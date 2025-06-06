import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { openDB } from "idb";

export default function ResponderFormulario() {
  const router = useRouter();
  const { slug } = router.query;

  const [formulario, setFormulario] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [modoLlenado, setModoLlenado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Handler para el “beforeinstallprompt” (PWA)
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  // Inicializa (o abre) la base IndexedDB “RespuestasOffline”
  const getDB = async () => {
    return await openDB("RespuestasOffline", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("respuestas")) {
          db.createObjectStore("respuestas", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  };

  // 1) Carga el formulario (por slug) y 2) cuenta cuántas respuestas offline hay pendientes
  useEffect(() => {
    if (!slug) return;

    const cargarDatos = async () => {
      // === 1) Cargo el formulario desde mi endpoint público ===
      try {
        const res = await axios.get(`/api/public/formularios/${slug}`);
        setFormulario(res.data);
      } catch (error) {
        console.error("Error al cargar formulario:", error);
        alert("Formulario no encontrado");
        return;
      }

      // === 2) Cuento cuántas respuestas están guardadas en IndexedDB sin sincronizar ===
      try {
        const db = await getDB();
        const all = await db.getAll("respuestas");
        const sinEnviar = all.filter(
          (r) => !r.enviado && r.formularioSlug === slug
        );
        setPendientes(sinEnviar.length);
      } catch (error) {
        console.error("Error contando respuestas pendientes:", error);
      }
    };

    cargarDatos();
  }, [slug]);


  // Guarda localmente en IndexedDB
  const guardarOffline = async (respuestas) => {
    const db = await getDB();
    await db.add("respuestas", {
      formularioSlug: slug,
      respuestas,
      enviado: false,
    });
    // Actualizo el contador en pantalla
    const all = await db.getAll("respuestas");
    const sinEnviar = all.filter(
      (r) => !r.enviado && r.formularioSlug === slug
    );
    setPendientes(sinEnviar.length);
  };

  // Sincroniza todas las respuestas pendientes a la API real
  const sincronizarRespuestas = async () => {
    setSincronizando(true);
    const db = await getDB();
    const all = await db.getAll("respuestas");
    const sinEnviar = all.filter(
      (r) => !r.enviado && r.formularioSlug === slug
    );

    for (const item of sinEnviar) {
      try {
        // Aquí: usamos **slug**, no formulario.id
        await axios.post(`/api/responder/${slug}`, {
          respuestas: item.respuestas,
        });
        // Si se guardó correctamente en el servidor, lo borramos de IndexedDB
        await db.delete("respuestas", item.id);
      } catch (err) {
        console.error("Error sincronizando:", err);
        // No hagas nada si falla; seguirá pendiente para el próximo intento.
      }
    }

    // Recuento final de pendientes
    const rest = await db.getAll("respuestas");
    const pendientesRest = rest.filter(
      (r) => !r.enviado && r.formularioSlug === slug
    );
    setPendientes(pendientesRest.length);

    setSincronizando(false);
    alert("Respuestas sincronizadas");
  };

  // Actualiza el state de respuestas según los inputs
  const handleChange = (index, value) => {
    setRespuestas((prev) => ({
      ...prev,
      [`Campo${index + 1}`]: value,
    }));
  };

  // Al enviar el formulario (CLICK “Guardar”)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      if (navigator.onLine) {
        // Si hay conexión, envío directamente usando el slug
        await axios.post(`/api/responder/${slug}`, { respuestas });
        alert("Respuesta enviada con éxito");
      } else {
        // Si no hay conexión, lo guardo en IndexedDB
        await guardarOffline(respuestas);
        alert(
          "Respuesta guardada localmente. Se sincronizará automáticamente cuando tengas internet."
        );
      }
      setModoLlenado(false);
      setRespuestas({});
    } catch (error) {
      console.error("Error enviando respuesta:", error.response?.data || error);
      alert("Error al guardar respuesta");
    } finally {
      setEnviando(false);
    }
  };

  // === Renderizado ===
  if (!formulario) {
    return <p className="text-center mt-10">Cargando formulario...</p>;
  }

  if (!modoLlenado) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">{formulario.title}</h1>
        <p className="mb-6 text-gray-600">
          Puedes llenar este formulario incluso sin conexión. Luego sincroniza cuando tengas internet.
        </p>
        {showInstallPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            Instalar esta app
          </button>
        )}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => setModoLlenado(true)}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Iniciar
          </button>
          <button
            onClick={sincronizarRespuestas}
            disabled={pendientes === 0 || sincronizando}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {sincronizando ? "Sincronizando..." : `Sincronizar (${pendientes})`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Formulario: {formulario.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formulario.fields.map((field, index) => (
          <div key={index} className="flex flex-col">
            <label className="font-medium mb-1">{field.label}</label>
            <input
              type={field.type}
              value={respuestas[`Campo${index + 1}`] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            disabled={enviando}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {enviando ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setModoLlenado(false);
              setRespuestas({});
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
