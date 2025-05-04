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

interface Categoria {
  _id: string;
  nombre: string;
  descripcion: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
}

const CategoriasCrud = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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
      descripcion: "",
    },
  });

  // Fetch categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/categorias`);
        const data = await response.json();
        setCategorias(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categorias:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar las categorías",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [apiUrl]);

  const handleOpenDialog = (id: string | null = null) => {
    setCurrentId(id);
    if (id) {
      const categoria = categorias.find((e) => e._id === id);
      if (categoria) {
        reset({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
        });
      }
    } else {
      reset({
        nombre: "",
        descripcion: "",
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
        descripcion: data.descripcion,
      };

      let response;
      if (currentId) {
        // Editar
        response = await fetch(`${apiUrl}/api/categorias/${currentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      } else {
        // Crear
        response = await fetch(`${apiUrl}/api/categorias`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      }

      if (response.ok) {
        const updatedCategorias = await fetch(`${apiUrl}/api/categorias`);
        const updatedData = await updatedCategorias.json();
        setCategorias(updatedData);
        setSnackbar({
          open: true,
          message: currentId
            ? "Categoría actualizada correctamente"
            : "Categoría creada correctamente",
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
      const response = await fetch(`${apiUrl}/api/categorias/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategorias(categorias.filter((e) => e._id !== id));
        setSnackbar({
          open: true,
          message: "Categoría eliminada correctamente",
          severity: "success",
        });
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar la categoría",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "descripcion", headerName: "Descripción", flex: 2 },
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
        <Typography variant="h4">Categorías</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Categoría
        </Button>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          showToolbar
          rows={categorias}
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
          {currentId ? "Editar Categoría" : "Agregar Categoría"}
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
              name="descripcion"
              control={control}
              rules={{ required: "Descripción es requerida" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  fullWidth
                  margin="normal"
                  error={!!errors.descripcion}
                  helperText={errors.descripcion?.message}
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

export default CategoriasCrud;
