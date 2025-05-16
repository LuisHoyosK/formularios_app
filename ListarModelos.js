import fetch from "node-fetch";
import "dotenv/config";

const API_KEY = process.env.GOOGLE_API_KEY;

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📜 Modelos disponibles:");
    data.models.forEach(model => console.log(`- ${model.name}`));
  } catch (error) {
    console.error("❌ Error al listar modelos:", error.message);
  }
}

listModels();
