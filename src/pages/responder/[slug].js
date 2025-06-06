// pages/responder/[slug].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
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

  // Para el prompt de instalación PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // ----------------------------
  // 1) “beforeinstallprompt” para mostrar botón de Instalar
  // ----------------------------
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

  // ----------------------------
  // 2) Registrar el service worker SOLO en esta ruta
  // ----------------------------
  useEffect(() => {
    if ("serviceWorker" in navigator && slug) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registrado:", reg.scope);
        })
        .catch((err) => console.error("Error al registrar SW:", err));
    }
  }, [slug]);

  // ----------------------------
  // 3) Abrir IndexedDB y funciones offline
  // ----------------------------
  const getDB = async () => {
    return await openDB("RespuestasOffline", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("respuestas")) {
          db.createObjectStore("respuestas", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  };

  const contarPendientes = async () => {
    const db = await getDB();
    const all = await db.getAll("respuestas");
    const sinEnviar = all.filter(
      (r) => !r.enviado && r.formularioSlug === slug
    );
    setPendientes(sinEnviar.length);
  };

  const guardarOffline = async (respuestas) => {
    const db = await getDB();
    await db.add("respuestas", {
      formularioSlug: slug,
      respuestas,
      enviado: false,
    });
    contarPendientes();
  };

  // ----------------------------
  // 4) Cargar datos (formulario + pendientes) cuando cambie slug
  // ----------------------------
  useEffect(() => {
    if (!slug) return;

    const cargarDatos = async () => {
      // 4.1) Traer el formulario por slug
      try {
        const res = await axios.get(`/api/public/formularios/${slug}`);
        setFormulario(res.data);
      } catch (error) {
        console.error("Error al cargar formulario:", error);
        alert("Formulario no encontrado");
        return;
      }

      // 4.2) Contar las respuestas offline pendientes
      try {
        await contarPendientes();
      } catch (error) {
        console.error("Error contando respuestas pendientes:", error);
      }
    };

    cargarDatos();
  }, [slug]);

  // ----------------------------
  // 5) Sincronizar respuestas offline
  // ----------------------------
  const sincronizarRespuestas = async () => {
    setSincronizando(true);
    const db = await getDB();
    const all = await db.getAll("respuestas");
    const sinEnviar = all.filter(
      (r) => !r.enviado && r.formularioSlug === slug
    );

    for (const item of sinEnviar) {
      try {
        await axios.post(`/api/responder/${slug}`, {
          respuestas: item.respuestas,
        });
        await db.delete("respuestas", item.id);
      } catch (err) {
        console.error("Error sincronizando:", err);
      }
    }

    await contarPendientes();
    setSincronizando(false);
    alert("Respuestas sincronizadas");
  };

  // ----------------------------
  // 6) Manejadores de formulario
  // ----------------------------
  const handleChange = (index, value) => {
    setRespuestas((prev) => ({
      ...prev,
      [`Campo${index + 1}`]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      if (navigator.onLine) {
        // Cuando hay conexión, enviamos directo al endpoint
        await axios.post(`/api/responder/${slug}`, { respuestas });
        alert("Respuesta enviada con éxito");
      } else {
        // Si no hay conexión, guardamos en IndexedDB
        await guardarOffline(respuestas);
        alert(
          "Respuesta guardada localmente. Se sincronizará cuando tengas conexión."
        );
      }
      setModoLlenado(false);
      setRespuestas({});
    } catch (error) {
      console.error(
        "Error enviando respuesta:",
        error.response?.data || error
      );
      alert("Error al guardar respuesta");
    } finally {
      setEnviando(false);
    }
  };

  // ----------------------------
  // 7) Renderizado
  // ----------------------------
  if (!formulario) {
    return <p className="text-center mt-10">Cargando formulario...</p>;
  }

  // Vista previa antes de llenar
  if (!modoLlenado) {
    return (
      <>
        {/* ======================
            7.1) HEAD con manifest y meta tags
        ====================== */}
        <Head>
          <title>{formulario.title}</title>
          <meta name="theme-color" content="#0d9488" />
          <link rel="manifest" href="/manifest.json" />
          {/* Opcionalmente: favicon */}
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="p-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{formulario.title}</h1>
          <p className="mb-6 text-gray-600">
            Puedes llenar este formulario incluso sin conexión. Luego
            sincroniza cuando tengas internet.
          </p>

          {showInstallPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
            >
              Instalar esta app
            </button>
          )}

          <div className="flex flex-col gap-4 items-center mt-6">
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
              {sincronizando
                ? "Sincronizando..."
                : `Sincronizar (${pendientes})`}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Vista de llenado del formulario
  return (
    <>
      {/* ======================
          7.2) HEAD con manifest y meta tags (cuando ya entro a llenar)
      ====================== */}
      <Head>
        <title>{formulario.title}</title>
        <meta name="theme-color" content="#0d9488" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          Formulario: {formulario.title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formulario.fields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <label className="font-medium mb-1">
                {field.label}
              </label>
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
    </>
  );
}
