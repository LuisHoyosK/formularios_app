import { parse } from "cookie";

export function getSession(req) {
  const cookies = parse(req.headers.cookie || "");
  if (!cookies.token) return null;

  try {
    const user = JSON.parse(atob(cookies.token.split(".")[1])); // Decodifica el token
    return { user };
  } catch (error) {
    return null;
  }
}
