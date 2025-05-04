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

interface Autor {
  _id: string;
  nombre: string;
  biografia: string;
  foto: string;
}

interface FormData {
  nombre: string;
  biografia: string;
  foto: string;
}

const AutoresCrud = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
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
      biografia: "",
      foto: "",
    },
  });

  // Fetch autores
  useEffect(() => {
    const fetchAutores = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/autores`);
        const data = await response.json();
        setAutores(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching autores:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar los autores",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchAutores();
  }, [apiUrl]);

  const handleOpenDialog = (id: string | null = null) => {
    setCurrentId(id);
    if (id) {
      const autor = autores.find((a) => a._id === id);
      if (autor) {
        reset({
          nombre: autor.nombre,
          biografia: autor.biografia,
          foto: autor.foto,
        });
      }
    } else {
      reset({
        nombre: "",
        biografia: "",
        foto: "",
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
        biografia: data.biografia,
        foto: data.foto,
      };

      let response;
      if (currentId) {
        // Editar
        response = await fetch(`${apiUrl}/api/autores/${currentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      } else {
        // Crear
        response = await fetch(`${apiUrl}/api/autores`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      }

      if (response.ok) {
        const updatedAutores = await fetch(`${apiUrl}/api/autores`);
        const updatedData = await updatedAutores.json();
        setAutores(updatedData);
        setSnackbar({
          open: true,
          message: currentId
            ? "Autor actualizado correctamente"
            : "Autor creado correctamente",
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
      const response = await fetch(`${apiUrl}/api/autores/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAutores(autores.filter((a) => a._id !== id));
        setSnackbar({
          open: true,
          message: "Autor eliminado correctamente",
          severity: "success",
        });
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el autor",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "biografia", headerName: "Biografía", flex: 2 },
    {
      field: "foto",
      headerName: "Foto",
      flex: 1,
      renderCell: (params) => (
        <img
          src={params.value}
          alt={`Foto de ${params.row.nombre}`}
          style={{ width: "50px", height: "50px" }}
        />
      ),
    },
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
        <Typography variant="h4">Autores</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Autor
        </Button>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          showToolbar
          rows={autores}
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
          {currentId ? "Editar Autor" : "Agregar Autor"}
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
              name="biografia"
              control={control}
              rules={{ required: "Biografía es requerida" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Biografía"
                  fullWidth
                  margin="normal"
                  error={!!errors.biografia}
                  helperText={errors.biografia?.message}
                />
              )}
            />

            <Controller
              name="foto"
              control={control}
              rules={{ required: "Foto es requerida" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Foto URL"
                  fullWidth
                  margin="normal"
                  error={!!errors.foto}
                  helperText={errors.foto?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default AutoresCrud;
