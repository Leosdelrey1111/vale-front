import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  telefono: string;
  prestamosActivos: number;
  estado: string;
  multaAcumulada: number;
  fechaRegistro: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  telefono: string;
  clave: string;
}

const UsuariosCrud = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nombre: "",
      apellido: "",
      identificacion: "",
      correo: "",
      telefono: "",
      clave: "",
    },
  });

  // Fetch usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/usuarios`);
        const data = await response.json();
        setUsuarios(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching usuarios:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar los usuarios",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [apiUrl]);

  const handleOpenDialog = (id: string | null = null) => {
    setCurrentId(id);
    if (id) {
      const usuario = usuarios.find((u) => u._id === id);
      if (usuario) {
        reset({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          identificacion: usuario.identificacion,
          correo: usuario.correo,
          telefono: usuario.telefono,
          clave: "",
        });
      }
    } else {
      reset({
        nombre: "",
        apellido: "",
        identificacion: "",
        correo: "",
        telefono: "",
        clave: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData = {
        nombre: data.nombre,
        apellido: data.apellido,
        identificacion: data.identificacion,
        correo: data.correo,
        telefono: data.telefono,
        clave: data.clave,
      };

      let response;
      if (currentId) {
        // Editar
        response = await fetch(`${apiUrl}/api/usuarios/${currentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      } else {
        // Crear
        response = await fetch(`${apiUrl}/api/usuarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      }

      if (response.ok) {
        const updatedUsuarios = await fetch(`${apiUrl}/api/usuarios`);
        const updatedData = await updatedUsuarios.json();
        setUsuarios(updatedData);
        setSnackbar({
          open: true,
          message: currentId
            ? "Usuario actualizado correctamente"
            : "Usuario creado correctamente",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error("Error en la operación");
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al realizar la operación",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: GridRowId) => {
    try {
      const response = await fetch(`${apiUrl}/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsuarios(usuarios.filter((u) => u._id !== id));
        setSnackbar({
          open: true,
          message: "Usuario eliminado correctamente",
          severity: "success",
        });
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el usuario",
        severity: "error",
      });
    }
  };

  const handleOpenDetailsDialog = (id: string) => {
    const usuario = usuarios.find((u) => u._id === id);
    if (usuario) {
      setSelectedUser(usuario);
      setOpenDetailsDialog(true);
    }
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "identificacion", headerName: "Identificación", flex: 1 },
    { field: "correo", headerName: "Correo", flex: 1 },
    { field: "telefono", headerName: "Teléfono", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    {
      field: "actions",
      headerName: "Acciones",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.id as string)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.id)}
        />,
        <GridActionsCellItem
          icon={<AddIcon />}
          label="Ver Detalles"
          onClick={() => handleOpenDetailsDialog(params.id as string)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Usuario
        </Button>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          showToolbar
          rows={usuarios}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25, 100]}
        />
      </Box>

      {/* Dialog para agregar/editar */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentId ? "Editar Usuario" : "Agregar Usuario"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: "Nombre es requerido" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  fullWidth
                  margin="normal"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                />
              )}
            />

            <Controller
              name="apellido"
              control={control}
              rules={{ required: "Apellido es requerido" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Apellido"
                  fullWidth
                  margin="normal"
                  error={!!errors.apellido}
                  helperText={errors.apellido?.message}
                />
              )}
            />

            <Controller
              name="identificacion"
              control={control}
              rules={{ required: "Identificación es requerida" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Identificación"
                  fullWidth
                  margin="normal"
                  error={!!errors.identificacion}
                  helperText={errors.identificacion?.message}
                />
              )}
            />

            <Controller
              name="correo"
              control={control}
              rules={{ required: "Correo es requerido" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Correo"
                  fullWidth
                  margin="normal"
                  error={!!errors.correo}
                  helperText={errors.correo?.message}
                />
              )}
            />

            <Controller
              name="telefono"
              control={control}
              rules={{ required: "Teléfono es requerido" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Teléfono"
                  fullWidth
                  margin="normal"
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                />
              )}
            />

            {!currentId && (
              <Controller
                name="clave"
                control={control}
                rules={{ required: "Clave es requerida" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Clave"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={!!errors.clave}
                    helperText={errors.clave?.message}
                  />
                )}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para ver detalles del usuario */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="body1">
                Nombre: {selectedUser.nombre}
              </Typography>
              <Typography variant="body1">
                Apellido: {selectedUser.apellido}
              </Typography>
              <Typography variant="body1">
                Identificación: {selectedUser.identificacion}
              </Typography>
              <Typography variant="body1">
                Correo: {selectedUser.correo}
              </Typography>
              <Typography variant="body1">
                Teléfono: {selectedUser.telefono}
              </Typography>
              <Typography variant="body1">
                Estado: {selectedUser.estado}
              </Typography>
              <Typography variant="body1">
                Prestamos Activos: {selectedUser.prestamosActivos}
              </Typography>
              <Typography variant="body1">
                Fecha de Registro:{" "}
                {new Date(selectedUser.fechaRegistro).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                Multa Acumulada: ${selectedUser.multaAcumulada.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default UsuariosCrud;
