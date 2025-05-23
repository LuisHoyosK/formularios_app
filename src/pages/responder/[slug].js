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

  useEffect(() => {
    if (slug) {
      fetchFormulario();
      contarPendientes();
    }
  }, [slug]);

  const fetchFormulario = async () => {
    try {
      const res = await axios.get(`/api/public/formularios/${slug}`);
      setFormulario(res.data);
    } catch (error) {
      console.error("Error al cargar formulario:", error);
      alert("Formulario no encontrado");
    }
  };

  const getDB = async () => {
    return await openDB("RespuestasOffline", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("respuestas")) {
          db.createObjectStore("respuestas", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  };

  const guardarOffline = async (respuestas) => {
    const db = await getDB();
    await db.add("respuestas", { formularioSlug: slug, respuestas, enviado: false });
    contarPendientes();
  };

  const contarPendientes = async () => {
    const db = await getDB();
    const all = await db.getAll("respuestas");
    const sinEnviar = all.filter(r => !r.enviado && r.formularioSlug === slug);
    setPendientes(sinEnviar.length);
  };

  const sincronizarRespuestas = async () => {
    setSincronizando(true);
    const db = await getDB();
    const all = await db.getAll("respuestas");
    const sinEnviar = all.filter(r => !r.enviado && r.formularioSlug === slug);

    for (const item of sinEnviar) {
      try {
        await axios.post(`/api/responder/${formulario.id}`, { respuestas: item.respuestas });
        await db.delete("respuestas", item.id);
      } catch (err) {
        console.error("Error sincronizando:", err);
      }
    }

    await contarPendientes();
    setSincronizando(false);
    alert("Respuestas sincronizadas");
  };

  const handleChange = (index, value) => {
    setRespuestas({ ...respuestas, [`Campo${index + 1}`]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (navigator.onLine) {
        await axios.post(`/api/responder/${formulario.id}`, { respuestas });
        alert("Respuesta enviada con éxito");
      } else {
        await guardarOffline(respuestas);
        alert("Respuesta guardada localmente. Se sincronizará cuando tengas conexión.");
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

  if (!formulario) return <p className="text-center mt-10">Cargando formulario...</p>;

  if (!modoLlenado) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">{formulario.title}</h1>
        <p className="mb-6 text-gray-600">
          Puedes llenar este formulario incluso sin conexión. Luego sincroniza cuando tengas internet.
        </p>
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
