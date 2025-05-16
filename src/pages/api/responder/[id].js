import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const tableName = `respuestas_${id}`;
    const { respuestas } = req.body;

    if (!respuestas || typeof respuestas !== "object") {
      return res.status(400).json({ error: "Respuestas inválidas" });
    }

    // Construir las columnas y valores dinámicamente
    const columns = Object.keys(respuestas)
      .map((key) => `\`${key}\``)
      .join(", ");  
    const values = Object.values(respuestas)
      .map((value) => (typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value))
      .join(", ");

    const insertQuery = `
      INSERT INTO \`${tableName}\` (${columns})
      VALUES (${values});
    `;

    console.log("Ejecutando query:", insertQuery);
    await prisma.$executeRawUnsafe(insertQuery);

    return res.status(201).json({ message: "Respuesta guardada con éxito" });
  } catch (error) {
    console.error("Error guardando respuesta:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}
