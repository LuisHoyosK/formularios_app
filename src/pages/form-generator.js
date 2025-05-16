import { useState, useEffect, useContext } from "react";
import FormGenerator from "../components/FormGenerator";
import FormEditor from "../components/FormEditor"; // Importamos el editor
import { AuthContext } from "../context/authContext";

export default function FormGeneratorPage() {
  const { user, logout, loading } = useContext(AuthContext);
  const [formularios, setFormularios] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null); // Estado para el formulario seleccionado

  useEffect(() => {
    if (!user) return;

    const fetchFormularios = async () => {
      try {
        const response = await fetch("/api/formularios", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (response.ok) {
          setFormularios(data);
        } else {
          console.error("Error al obtener formularios:", data.error);
        }
      } catch (error) {
        console.error("Error en la petición:", error);
      }
    };

    fetchFormularios();
  }, [user]);

  if (loading) return null;

  return (
    <div>
      {/* Encabezado */}
      <br />
      <div className="container flex items-center justify-between h-full max-w-6xl px-8 mx-auto xl:px-0">
        <a href="#" className="relative flex items-center inline-block font-black leading-none">
          <span className="ml-3 text-xl text-gray-800">RadForms<span className="text-pink-500">.</span></span>
        </a>

        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-indigo-700 font-bold">{user.name}</span>
              <button 
                onClick={logout} 
                className="bg-pink-500 text-white px-4 py-2 rounded shadow-md hover:bg-pink-600 transition"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <a href="auth/login" className="bg-indigo-700 text-white px-5 py-3 rounded shadow-md hover:bg-indigo-800">
              Iniciar Sesión
            </a>
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* Si está editando un formulario, carga el editor */}
      {selectedForm ? (
        <FormEditor selectedForm={selectedForm} setSelectedForm={setSelectedForm} />
      ) : (
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Tus Formularios</h2>

          {/* Grid para los formularios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formularios.length > 0 ? (
              formularios.map((form) => (
                <div 
                  key={form.id} 
                  className="bg-white p-4 shadow-md rounded-lg border border-gray-200 aspect-[8/3] flex items-center justify-center text-center font-semibold text-lg cursor-pointer"
                  onClick={() => {
                    console.log("Formulario seleccionado:", form);
                    setSelectedForm(form);
                  }} // Al hacer clic, carga el editor
                >
                  {form.title}
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No tienes formularios creados.</p>
            )}
          </div>

          {/* Botón para crear un nuevo formulario */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => setShowGenerator(true)} 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              Crear Nuevo Formulario
            </button>
          </div>

          {/* Muestra el generador cuando se presiona el botón */}
          {showGenerator && <FormGenerator />}
        </div>
      )}
    </div>
  );
}
