// src/routes/auth/Login.tsx
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { TextField, Button, Box, Typography, Link as MuiLink } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

type FormData = {
  correo: string;
  clave: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const apiUrl = import.meta.env.VITE_API_URL;
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      const responseData = await response.json();

      if (response.ok) {
        login(responseData.token);
        navigate("/prestamo");
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Iniciar Sesión
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Correo electrónico"
          type="email"
          variant="outlined"
          margin="normal"
          fullWidth
          {...register("correo", {
            required: "El correo es requerido",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,}$/i,
              message: "Correo electrónico no válido",
            },
          })}
          error={!!errors.correo}
          helperText={errors.correo?.message}
        />
        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          margin="normal"
          fullWidth
          {...register("clave", {
            required: "La contraseña es requerida",
            minLength: {
              value: 4,
              message: "La contraseña debe tener al menos 4 caracteres",
            },
          })}
          error={!!errors.clave}
          helperText={errors.clave?.message}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
        >
          Iniciar sesión
        </Button>
        <Typography align="center">
          ¿No tienes cuenta?{" "}
          <MuiLink component={Link} to="/register">
            Regístrate aquí
          </MuiLink>
        </Typography>
      </form>
    </Box>
  );
};

export default Login;
