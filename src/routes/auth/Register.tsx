// src/routes/auth/Register.tsx
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

type FormData = {
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  telefono: string;
  clave: string;
};

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${apiUrl}/api/usuarios`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Registro exitoso, ahora inicia sesión.");
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al registrar.");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
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
        Registro
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Nombre"
          variant="outlined"
          margin="normal"
          fullWidth
          {...register("nombre", { required: "El nombre es requerido" })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
        />
        <TextField
          label="Apellido"
          variant="outlined"
          margin="normal"
          fullWidth
          {...register("apellido", { required: "El apellido es requerido" })}
          error={!!errors.apellido}
          helperText={errors.apellido?.message}
        />
        <TextField
          label="Identificación"
          variant="outlined"
          margin="normal"
          fullWidth
          {...register("identificacion", {
            required: "La identificación es requerida",
          })}
          error={!!errors.identificacion}
          helperText={errors.identificacion?.message}
        />
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
          label="Teléfono"
          variant="outlined"
          margin="normal"
          fullWidth
          {...register("telefono", {
            required: "El teléfono es requerido",
            maxLength: {
              value: 10,
              message: "El teleono no puede superar los 10 digitos",
            },
            minLength: {
              value: 10,
              message: "El teleono no puede ser menor a 10 digitos",
            },
          })}
          error={!!errors.telefono}
          helperText={errors.telefono?.message}
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
          Registrarse
        </Button>
        <Typography align="center">
          ¿Ya tienes cuenta?{" "}
          <MuiLink component={Link} to="/">
            Inicia sesión
          </MuiLink>
        </Typography>
      </form>
    </Box>
  );
};

export default Register;
