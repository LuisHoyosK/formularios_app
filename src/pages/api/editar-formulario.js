import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id } = req.query; // viene de /api/formularios/[id]
    const { title, fields } = req.body;

    if (!id || !title || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    // Verificar que el token esté presente y tenga el formato correcto
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado: Token no proporcionado" });
    }

    // Extraer y verificar el token
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

    // Verificar que el formulario exista y le pertenezca al usuario
    const formulario = await prisma.formulario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!formulario) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    if (formulario.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para editar este formulario" });
    }

    // Actualizar título y estructura (fields)
    const updatedFormulario = await prisma.formulario.update({
      where: { id: parseInt(id) },
      data: {
        title,
        fields,
      },
    });

    return res.status(200).json({ message: "Formulario actualizado exitosamente", formulario: updatedFormulario });
  } catch (error) {
    console.error("Error actualizando formulario:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}
