import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { title, fields } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado: Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const userId = decoded.userId;
    if (!userId) {
      return res.status(401).json({ error: "Usuario no válido" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!title || !fields || !Array.isArray(fields)) {
      throw new Error("Datos inválidos: title y fields son requeridos y fields debe ser un array.");
    }

    fields.forEach((field, index) => {
      if (!field.type) {
        console.error(`Campo inválido en índice ${index}:`, field);
        throw new Error(`Cada campo debe tener un tipo válido. Error en campo ${index + 1}`);
      }
    });

    // 🆕 Generar slug único
    const slug = nanoid(12);

    // Guardar formulario
    const formulario = await prisma.formulario.create({
      data: { title, fields, userId, slug },
    });

    // Crear tabla de respuestas
    const tableName = `respuestas_${formulario.id}`;
    const columnDefinitions = fields
      .map((field, index) => {
        const fieldName = `Campo${index + 1}`;
        const sqlType =
          field.type === "text" ? "TEXT" :
          field.type === "number" ? "INT" :
          field.type === "date" ? "DATE" :
          null;

        if (!sqlType) {
          throw new Error(`Tipo de campo desconocido: ${field.type}`);
        }

        return `\`${fieldName}\` ${sqlType}`;
      })
      .join(", ");

    const createTableQuery = `
      CREATE TABLE \`${tableName}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ${columnDefinitions},
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("QUERY A EJECUTAR:", createTableQuery);
    await prisma.$executeRawUnsafe(createTableQuery);

    return res.status(201).json({ message: "Formulario creado con éxito", formulario });
  } catch (error) {
    console.error("Error en API:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}
