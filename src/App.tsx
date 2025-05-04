import { Navigate, Route, Routes } from "react-router-dom";
import Material from "./routes/Material.tsx";
import Usuario from "./routes/Usuario.tsx";
import Prestamo from "./routes/Prestamo.tsx";
import Login from "./routes/auth/Login.tsx";
import Autores from "./routes/Autores.tsx";
import Categorias from "./routes/Categorias.tsx";
import Editoriales from "./routes/Editoriales.tsx";
import { MainLayout } from "./layouts/MainLayout.tsx";
import Register from "./routes/auth/Register.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route path="material" element={<Material />} />
        <Route path="usuario" element={<Usuario />} />
        <Route path="prestamo" element={<Prestamo />} />
        <Route path="autores" element={<Autores />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="editoriales" element={<Editoriales />} />
      </Route>

      {/* Página 404 si no existe la ruta */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
