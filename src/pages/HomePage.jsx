import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-white">
      <nav className="flex justify-between items-center px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-purple-700">Tienda-Express</h1>
        <div className="space-x-4">
          <Link
            to="/auth?mode=login"
            className="text-purple-700 font-semibold hover:underline"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/auth?mode=register"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h2 className="text-4xl font-bold text-gray-700 mb-4">
          Crea el catálogo digital de tu negocio en minutos.
        </h2>
        <p className="text-gray-600 max-w-xl">
          Con Tienda-Express podrás mostrar tus productos, recibir pedidos por
          WhatsApp y administrar todo desde un panel fácil de usar.
        </p>
      </main>
    </div>
  );
}
