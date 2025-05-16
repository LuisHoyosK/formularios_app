import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" },
      }
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No se generó contenido.";
    res.status(200).json({ formulario: generatedText });
  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    res.status(500).json({ error: "Error generando el formulario." });
  }
}
