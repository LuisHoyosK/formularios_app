import { useState, useEffect, useContext } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { AuthContext } from "../context/authContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const FormEditor = ({ selectedForm, setSelectedForm }) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [fields, setFields] = useState(selectedForm?.fields || []);
  const [formTitle, setFormTitle] = useState(selectedForm?.title || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showRespuestas, setShowRespuestas] = useState(false);
  const [respuestas, setRespuestas] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const fetchRespuestas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/respuestas/${selectedForm.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRespuestas(res.data.respuestas);
      setShowRespuestas(true);
    } catch (error) {
      console.error("Error cargando respuestas:", error);
      alert("No se pudieron cargar las respuestas");
    }
  };

const campoIndex = fields.findIndex(f => f.label === campoSeleccionado);
const valoresCampo = campoIndex >= 0 ? respuestas.map(r => r[`Campo${campoIndex + 1}`]) : [];

const estadisticas = () => {
  if (!campoSeleccionado || !valoresCampo.length) return null;

  const tipo = fields[campoIndex].type;

  if (tipo === "number") {
    const stats = calcularEstadisticasNumericas(valoresCampo);
    return (
      <ul>
        <li><strong>Media:</strong> {stats.media.toFixed(2)}</li>
        <li><strong>Mínimo:</strong> {stats.min}</li>
        <li><strong>Máximo:</strong> {stats.max}</li>
        <li><strong>Desviación Estándar:</strong> {stats.desviacion.toFixed(2)}</li>
      </ul>
    );
  } else {
    // Para date y text (nominales), contar frecuencias
    const formateados = tipo === "date"
      ? valoresCampo.map(v => formatFecha(v))
      : valoresCampo;

    const conteos = contarValores(formateados);

    return (
      <ul>
        {conteos.map(({ valor, cantidad }, i) => (
          <li key={i}>
            <strong>{valor}:</strong> {cantidad}
          </li>
        ))}
      </ul>
    );
  }
};


const datosGrafico = () => {
  if (!campoSeleccionado || !valoresCampo.length) return null;

  const tipo = fields[campoIndex].type;

  if (tipo === "number") {
    const conteoNumerico = contarValores(valoresCampo);
    return {
      labels: conteoNumerico.map(d => d.valor),
      datasets: [{
        label: campoSeleccionado,
        data: conteoNumerico.map(d => d.cantidad),
        backgroundColor: "#6366f1",
      }],
    };
  } else {
    const formateados = tipo === "date"
      ? valoresCampo.map(v => formatFecha(v))
      : valoresCampo;

    const conteo = contarValores(formateados);
    return {
      labels: conteo.map(d => d.valor),
      datasets: [{
        label: "Frecuencia",
        data: conteo.map(d => d.cantidad),
        backgroundColor: "#f59e0b",
      }],
    };
  }
};


  const addField = (type) => {
    setFields([...fields, { type, label: `Campo ${fields.length + 1}`, value: "" }]);
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
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado.");
        setSaving(false);
        return;
      }

      await axios.put(
        `/api/formularios/${selectedForm.id}`,
        { title: formTitle, fields },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Formulario actualizado exitosamente.");
      setSelectedForm(null);
    } catch (error) {
      console.error("Error actualizando el formulario:", error.response?.data || error);
      alert("Hubo un error al actualizar el formulario.");
    } finally {
      setSaving(false);
    }
  };

  const deleteForm = async () => {
    const confirmed = window.confirm(
      "⚠️ Asegúrese de descargar las respuestas del formulario antes de eliminar, estos cambios son irreversibles.\n\n¿Deseas continuar?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado.");
        setDeleting(false);
        return;
      }

      await axios.delete(`/api/formularios/${selectedForm.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Formulario y tabla de respuestas eliminados exitosamente.");
      setSelectedForm(null);
    } catch (error) {
      console.error("Error eliminando el formulario:", error.response?.data || error);
      alert("Hubo un error al eliminar el formulario.");
    } finally {
      setDeleting(false);
    }
  };

  const calcularEstadisticasNumericas = (valores) => {
  const nums = valores.map(Number).filter((n) => !isNaN(n));
  const media = nums.reduce((a, b) => a + b, 0) / nums.length;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const desv = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - media, 2), 0) / nums.length);
  return { media, min, max, desviacion: desv };
};

const contarValores = (valores) => {
  const conteo = {};
  valores.forEach((v) => {
    const key = v?.toString().trim() || "Vacío";
    conteo[key] = (conteo[key] || 0) + 1;
  });
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([valor, cantidad]) => ({ valor, cantidad }));
};


  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toISOString().split("T")[0]; // YYYY-MM-DD
  };


  const downloadCSV = (respuestas, fields, tituloFormulario) => {
    const header = fields.map((f) => f.label);
    header.push("Fecha");

    const csvRows = [
      header.join(","),
      ...respuestas.map((resp) => {
        const row = fields.map((f, i) => {
          let val = resp[`Campo${i + 1}`] ?? "";
          if (f.type === "date" && val) {
            val = formatFecha(val);
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        row.push(formatFecha(resp.createdAt));
        return row.join(",");
      }),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `respuestas_${tituloFormulario.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCampoValor = (value, type) => {
    if (type === "date" && value) {
      return formatFecha(value);
    }
    return value;
  };


  if (showRespuestas) {
    const total = respuestas.length;
    const respuestasPreview = respuestas.slice(0, 10);
    

    return (
      <div className="p-6 bg-white rounded-lg shadow-md w-11/12 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Respuestas de: {formTitle}</h2>
          <span className="text-gray-600 font-medium">Total de respuestas: {total}</span>
        </div>
        <table className="w-full border">
          <thead>
            <tr>
              {fields.map((field, idx) => (
                <th key={idx} className="border p-2">{field.label}</th>
              ))}
              <th className="border p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {respuestasPreview.map((resp, i) => (
              <tr key={i}>
                {fields.map((field, idx) => (
                  <td key={idx} className="border p-2">
                    {renderCampoValor(resp[`Campo${idx + 1}`], field.type)}
                  </td>
                ))}
                <td className="border p-2">{formatFecha(resp.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-6">
          <Button className="bg-gray-700 text-white" onClick={() => setShowRespuestas(false)}>
            Volver al editor
          </Button>
          <Button
            className="bg-blue-600 text-white"
            onClick={() => downloadCSV(respuestas, fields, formTitle)}
          >
            Descargar CSV
          </Button>        
        </div> 
        <div className="mt-10">
          <h3 className="text-lg font-bold mb-2"> Estadísticas </h3>
          <div className="mb-4">
            <select
              className="p-2 border rounded w-full"
              value={campoSeleccionado}
              onChange={(e) => setCampoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione</option>
              {fields.map((f, i) => (
                <option key={i} value={f.label}>{f.label}</option>
              ))}
            </select>
          </div>

          {campoSeleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Estadísticas:</h4>
                {estadisticas()}
              </div>

              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Gráfico:</h4>
                <Bar data={datosGrafico()} />
              </div>
            </div>
          )}
        </div>      
      </div>
      
      
    );   
  }
  return (    
    <div className="p-6 bg-white rounded-lg shadow-md w-1/2 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button className="bg-gray-500 text-white" onClick={() => setSelectedForm(null)}>
        Volver
      </Button>
        <h2 className="text-2xl font-bold">Editando: {formTitle}</h2>
        <div className="flex gap-2">
          <Button className="bg-purple-600 text-white" onClick={fetchRespuestas}>
            Ver respuestas
          </Button>
          <Button
            className="bg-indigo-600 text-white"
            onClick={() => {
              const link = `${window.location.origin}/responder/${selectedForm.id}`;
              navigator.clipboard.writeText(link);
              alert("¡Enlace para llenar formulario copiado al portapapeles!");
            }}
          >
            Copiar enlace
          </Button>
        </div>
      </div>

    
      <Input
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        placeholder="Título del formulario"
        className="mb-4"
      />
      <div className="flex gap-2 mb-4">
        <Button onClick={() => addField("text")}>Agregar Texto</Button>
        <Button onClick={() => addField("number")}>Agregar Número</Button>
        <Button onClick={() => addField("date")}>Agregar Fecha</Button>
      </div>
      {fields.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Campos:</h3>
          {fields.map((field, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 mb-3 border p-3 rounded-lg shadow-sm"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex-1">
                <Input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateLabel(index, e.target.value)}
                  placeholder="Nombre del campo"
                  className="mb-1 font-medium border-b border-gray-300"
                />
                <Input type={field.type} value={field.value} disabled className="w-full" />
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Button
                  className="bg-blue-500 text-white disabled:cursor-not-allowed"
                  onClick={() => moveField(index, "up")}
                  disabled={index === 0}
                >⬆</Button>
                <Button
                  className="bg-blue-500 text-white disabled:cursor-not-allowed"
                  onClick={() => moveField(index, "down")}
                  disabled={index === fields.length - 1}
                >⬇</Button>
              </div>
              <Button className="bg-red-500 text-white" onClick={() => removeField(index)}>
                Eliminar
              </Button>
            </motion.div>
          ))}
        </div>
      )}
      {fields.length > 0 && (
        <Button className="mt-4 w-full bg-green-600 text-white" onClick={saveForm} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      )}
      <Button className="mt-4 w-full bg-red-600 text-white" onClick={deleteForm} disabled={deleting}>
        {deleting ? "Eliminando..." : "Eliminar Formulario"}
      </Button>
    </div>
  );
};

export default FormEditor;
