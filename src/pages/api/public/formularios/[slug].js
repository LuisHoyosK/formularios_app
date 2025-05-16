import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Buscar directamente por el slug como texto
    const formulario = await prisma.formulario.findUnique({
      where: { slug },
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
