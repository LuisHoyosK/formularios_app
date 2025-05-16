import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Método no permitido" });

  res.setHeader("Set-Cookie", serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // Expira la cookie
  }));

  res.status(200).json({ message: "Sesión cerrada exitosamente" });
}
