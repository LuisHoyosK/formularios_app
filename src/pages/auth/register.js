import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";


export default function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const router = useRouter();

  // ✅ Definir handleChange para actualizar el estado
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (user.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            className="w-full p-2 border rounded mb-2"
            onChange={handleChange} // ✅ Ahora handleChange está definido
            required
          />
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
            Registrarse
          </button>
        </form>
        <p className="mt-2 text-center text-sm">
          ¿Ya tienes cuenta? <Link href="/auth/login" className="text-blue-500">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
