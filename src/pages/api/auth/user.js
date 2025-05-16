import { obtenerUsuarioDesdeToken } from "../../../utils/auth";


export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const user = obtenerUsuarioDesdeToken(req);

  if (!user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  return res.status(200).json({ user });
}
