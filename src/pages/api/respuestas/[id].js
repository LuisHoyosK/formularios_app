// /pages/api/respuestas/[id].js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }

  const userId = decoded.userId;
  const formulario = await prisma.formulario.findUnique({
    where: { id: parseInt(id) },
  });

  if (!formulario || formulario.userId !== userId) {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const tableName = `respuestas_${id}`;

  try {
    const respuestas = await prisma.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``);
    return res.status(200).json({ respuestas });
  } catch (error) {
    console.error("Error al consultar respuestas:", error);
    return res.status(500).json({ error: "Error consultando las respuestas" });
  }
}
