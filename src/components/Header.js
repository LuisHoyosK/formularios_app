import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 w-full h-24 bg-white shadow-md">
      <div className="container flex items-center justify-between h-full max-w-6xl px-8 mx-auto">
        {/* Logo */}
        <a href="#" className="flex items-center font-black text-xl text-gray-800">
          <span className="text-indigo-600">RadForms</span>
          <span className="text-pink-500">.</span>
        </a>

        {/* Nav Links */}
        <nav className={`absolute top-24 left-0 w-full bg-white shadow-md md:relative md:top-0 md:flex md:shadow-none md:bg-transparent ${isOpen ? "block" : "hidden"}`}>
          <a href="#" className="block p-4 text-gray-800 hover:text-indigo-600 md:inline md:ml-8">Home</a>
          <a href="#" className="block p-4 text-gray-800 hover:text-indigo-600 md:inline md:ml-8">¿Qué es?</a>
          <a href="#" className="block p-4 text-gray-800 hover:text-indigo-600 md:inline md:ml-8">Funciones</a>
        </nav>

        {/* Botones */}
        <div className="hidden md:flex space-x-4">
          <a href="#" className="text-pink-500 font-bold">Login</a>
          <a href="#" className="px-5 py-2 bg-indigo-700 text-white rounded-md shadow-md hover:shadow-lg transition">Registrarse</a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <span className="block w-6 h-1 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-1 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-1 bg-gray-800"></span>
        </div>
      </div>
    </header>
  );
}
