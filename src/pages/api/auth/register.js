import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Método no permitido" });

  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Todos los campos son obligatorios" });

  if (password.length < 8)
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "El correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: "Usuario registrado", user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    await prisma.$disconnect();
  }
}
