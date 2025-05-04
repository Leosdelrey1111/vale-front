// src/routes/editoriales/EditorialesCrud.tsx
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface Editorial {
  _id: string;
  nombre: string;
  pais: string;
  fundacion: string;
}

interface FormData {
  nombre: string;
  pais: string;
  fundacion: Dayjs | null;
}

const EditorialesCrud = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
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
      pais: "",
      fundacion: dayjs(),
    },
  });

  // Fetch editoriales
  useEffect(() => {
    const fetchEditoriales = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/editoriales`);
        const data = await response.json();
        setEditoriales(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching editoriales:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar las editoriales",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchEditoriales();
  }, [apiUrl]);

  const handleOpenDialog = (id: string | null = null) => {
    setCurrentId(id);
    if (id) {
      const editorial = editoriales.find((e) => e._id === id);
      if (editorial) {
        reset({
          nombre: editorial.nombre,
          pais: editorial.pais,
          fundacion: dayjs(editorial.fundacion),
        });
      }
    } else {
      reset({
        nombre: "",
        pais: "",
        fundacion: dayjs(),
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
        pais: data.pais,
        fundacion: data.fundacion?.toISOString(),
      };

      let response;
      if (currentId) {
        // Editar
        response = await fetch(`${apiUrl}/api/editoriales/${currentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      } else {
        // Crear
        response = await fetch(`${apiUrl}/api/editoriales`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
      }

      if (response.ok) {
        const updatedEditoriales = await fetch(`${apiUrl}/api/editoriales`);
        const updatedData = await updatedEditoriales.json();
        setEditoriales(updatedData);
        setSnackbar({
          open: true,
          message: currentId
            ? "Editorial actualizada correctamente"
            : "Editorial creada correctamente",
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
      const response = await fetch(`${apiUrl}/api/editoriales/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEditoriales(editoriales.filter((e) => e._id !== id));
        setSnackbar({
          open: true,
          message: "Editorial eliminada correctamente",
          severity: "success",
        });
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar la editorial",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "pais", headerName: "País", flex: 1 },
    {
      field: "fundacion",
      headerName: "Fundación",
      flex: 1,
      valueGetter: (params: { value: string }) =>
        dayjs(params.value).format("DD/MM/YYYY"),
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
        <Typography variant="h4">Editoriales</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Editorial
        </Button>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          showToolbar
          rows={editoriales}
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
          {currentId ? "Editar Editorial" : "Agregar Editorial"}
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
              name="pais"
              control={control}
              rules={{ required: "País es requerido" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="País"
                  fullWidth
                  margin="normal"
                  error={!!errors.pais}
                  helperText={errors.pais?.message}
                />
              )}
            />

            <Controller
              name="fundacion"
              control={control}
              rules={{ required: "Fecha de fundación es requerida" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Fecha de Fundación"
                  // value={field.value ? dayjs(field.value) : null}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: !!errors.fundacion,
                      helperText: errors.fundacion?.message,
                    },
                  }}
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

export default EditorialesCrud;
