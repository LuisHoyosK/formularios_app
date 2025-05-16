import { useState, useEffect, useContext } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { AuthContext } from "../context/authContext";

const FormGenerator = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [fields, setFields] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("auth/login");
    }
  }, [user, router]);

  const addField = (type) => {
    setFields([...fields, { type, label: `Campo ${fields.length + 1}`, value: "" }]);
  };

  const generateWithAI = async () => {
    if (!formTitle.trim()) {
      alert("Por favor ingresa un título para el formulario.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/generar-formulario", { prompt: `Genera un formulario titulado \"${formTitle}\" con campos de tipo texto, número o fecha.` });
      const extractedFields = extractFields(response.data.formulario);
      setFields(extractedFields.length ? extractedFields : []);
    } catch (error) {
      console.error("Error generando con IA:", error);
      alert("Hubo un error al generar el formulario.");
    } finally {
      setLoading(false);
    }
  };

  const extractFields = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return [...doc.querySelectorAll("input:not([type=submit]), textarea")].map((el, index) => ({
      type: el.getAttribute("type")?.toLowerCase() || "text",
      label: doc.querySelector(`label[for='${el.id}']`)?.textContent.trim() || `Campo ${index + 1}`,
      value: ""
    }));
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const removeField = (index) => setFields(fields.filter((_, i) => i !== index));

  const updateLabel = (index, newLabel) => {
    const newFields = [...fields];
    newFields[index].label = newLabel;
    setFields(newFields);
  };

  const saveForm = async () => {
    if (!formTitle.trim()) {
      alert("Por favor ingresa un título para el formulario.");
      return;
    }
    if (fields.length === 0) {
      alert("No hay campos en el formulario para guardar.");
      return;
    }
  
    setSaving(true);
    try {
      const token = localStorage.getItem("token"); // Recuperar el token del almacenamiento local
      if (!token) {
        alert("No estás autenticado.");
        setSaving(false);
        return;
      }
  
      await axios.post(
        "/api/guardar-formulario",
        { title: formTitle, fields },
        {
          headers: { Authorization: `Bearer ${token}` }, // Enviar el token
        }
      );
  
      alert("Formulario guardado exitosamente.");
      setFields([]);
      setFormTitle("");
    } catch (error) {
      console.error("Error guardando el formulario:", error.response?.data || error);
      alert("Hubo un error al guardar el formulario.");
    } finally {
      setSaving(false);
    }
  };
  

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-1/2 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Generador de Formularios</h2>
      <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Título del formulario" className="mb-4" />
      <div className="flex gap-2 mb-4">
        <Button onClick={() => addField("text")}>Agregar Texto</Button>
        <Button onClick={() => addField("number")}>Agregar Número</Button>
        <Button onClick={() => addField("date")}>Agregar Fecha</Button>
      </div>
      <Button className="text-sm px-3 py-2 bg-gray-700 text-white mb-4" onClick={generateWithAI} disabled={loading}>
        {loading ? "Generando..." : "Generar con IA"}
      </Button>
      {fields.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Campos Generados:</h3>
          {fields.map((field, index) => (
            <motion.div key={index} className="flex items-center gap-2 mb-3 border p-3 rounded-lg shadow-sm" layout transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <div className="flex-1">
                <Input type="text" value={field.label} onChange={(e) => updateLabel(index, e.target.value)} className="mb-1 font-medium border-b border-gray-300" />
                <Input type={field.type} value={field.value} className="w-full" />
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Button className="bg-blue-500 text-white" onClick={() => moveField(index, "up")} disabled={index === 0}>⬆</Button>
                <Button className="bg-blue-500 text-white" onClick={() => moveField(index, "down")} disabled={index === fields.length - 1}>⬇</Button>
              </div>
              <Button className="bg-red-500 text-white" onClick={() => removeField(index)}>Eliminar</Button>
            </motion.div>
          ))}
        </div>
      )}
      {fields.length > 0 && <Button className="mt-4 w-full bg-green-600 text-white" onClick={saveForm} disabled={saving}>{saving ? "Guardando..." : "Guardar Formulario"}</Button>}
    </div>
  );
};

export default FormGenerator;
