import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID no proporcionado" });
  }

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

  try {
    const formulario = await prisma.formulario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!formulario) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    if (formulario.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para este formulario" });
    }

    // ======= GET =======
    if (req.method === "GET") {
      return res.status(200).json(formulario);
    }

    // ======= PUT =======
    if (req.method === "PUT") {
      const { title, fields } = req.body;

      if (!title || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ error: "Datos incompletos o inválidos" });
      }

      const updated = await prisma.formulario.update({
        where: { id: parseInt(id) },
        data: { title, fields },
      });

      const tableName = `respuestas_${id}`;

      // Obtener columnas actuales
      const columnsResult = await prisma.$queryRawUnsafe(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
      `);

      const existingColumns = columnsResult
        .map(c => c.COLUMN_NAME)
        .filter(name => name !== "id" && name !== "createdAt");

      const newColumns = fields.map((_, index) => `Campo${index + 1}`);

      // Agregar columnas faltantes
      for (const column of newColumns) {
        if (!existingColumns.includes(column)) {
          const fieldIndex = parseInt(column.replace("Campo", "")) - 1;
          const fieldType = fields[fieldIndex].type;

          const sqlType =
            fieldType === "text" ? "TEXT" :
            fieldType === "number" ? "INT" :
            fieldType === "date" ? "DATE" :
            null;

          if (!sqlType) continue;

          const alterAddQuery = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${column}\` ${sqlType}`;
          console.log("Agregando columna:", alterAddQuery);
          await prisma.$executeRawUnsafe(alterAddQuery);
        }
      }

      // Eliminar columnas sobrantes
      for (const column of existingColumns) {
        if (!newColumns.includes(column)) {
          const alterDropQuery = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${column}\``;
          console.log("Eliminando columna:", alterDropQuery);
          await prisma.$executeRawUnsafe(alterDropQuery);
        }
      }

      return res.status(200).json({ message: "Formulario y tabla de respuestas actualizados", formulario: updated });
    }

    // ======= DELETE =======
    if (req.method === "DELETE") {
      const tableName = `respuestas_${id}`;

      // Eliminar tabla de respuestas
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`Tabla ${tableName} eliminada`);
      } catch (dropError) {
        console.error("Error eliminando tabla de respuestas:", dropError);
      }

      // Eliminar formulario
      await prisma.formulario.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({ message: "Formulario y tabla de respuestas eliminados exitosamente" });
    }

    return res.status(405).json({ error: "Método no permitido" });

  } catch (error) {
    console.error("Error en API /formularios/[id]:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}
