import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/context/authContext";

export default function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { setUser: setAuthUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      router.push("/form-generator"); // Redirige si ya hay sesión activa
    }
  }, [router]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      if (data.token) {
        const expiration = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // Expira en 7 días
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token_expiration", expiration);
      } else {
        console.error("Token no recibido en la respuesta");
      }
  
      setAuthUser(data.user); // Actualiza el contexto antes de redirigir
      setTimeout(() => {
        router.push("/form-generator");
      }, 100);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo"
            className="w-full p-2 border rounded mb-2"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded mb-2"
            onChange={handleChange}
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-2 text-center text-sm">
          ¿No tienes cuenta? <link href="/auth/register" className="text-blue-500">Regístrate</link>
        </p>
      </div>
    </div>
  );
}
