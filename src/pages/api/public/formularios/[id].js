import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const formulario = await prisma.formulario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!formulario) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    return res.status(200).json({
      id: formulario.id,
      title: formulario.title,
      fields: formulario.fields,
    });
  } catch (error) {
    console.error("Error recuperando formulario público:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
