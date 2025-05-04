import { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface Payload {
  id: string;
  correo: string;
  nombre: string;
  estado: string;
  exp: number; // expiración del token en segundos
}

export function useAuth() {
  const [user, setUser] = useState<Payload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<Payload>(token);

        // Verificar que el token no esté expirado
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log("Token expirado");
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setUser(null);
      }
    }
  }, []);

  return { user };
}
