import jwt from "jsonwebtoken";

function obtenerUsuarioDesdeToken(req) {
  try {
    // Obtener el token desde las cookies o headers
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return null;

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Retorna los datos del usuario
  } catch (error) {
    return null;
  }
}
