import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { useForm } from "react-hook-form";

const apiUrl = import.meta.env.VITE_API_URL;

interface Material {
  _id: string;
  tipo: string;
  titulo: string;
  autor: string;
  codigo: string;
  categoria: string;
  ejemplaresTotal: number;
  ejemplaresDisponibles: number;
  fechaPublicacion: string;
  editorial: string;
  ubicacion: string;
  estado: string;
  imagenPortada: string;
  edicion: string;
  paginas: number;
}

interface Categoria {
  nombre: string;
}

interface Autor {
  nombre: string;
}

interface Editorial {
  nombre: string;
}

// Valores iniciales para el formulario en blanco
const initialFormValues = {
  tipo: "",
  titulo: "",
  autor: "",
  codigo: "",
  categoria: "",
  ejemplaresTotal: 0,
  ejemplaresDisponibles: 0,
  fechaPublicacion: "",
  editorial: "",
  ubicacion: "",
  estado: "",
  imagenPortada: "",
  edicion: "",
  paginas: 0
};

const MaterialesCrud = () => {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [editId, setEditId] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<Omit<Material, "_id">>();

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchMateriales(),
        fetchCategorias(),
        fetchAutores(),
        fetchEditoriales()
      ]);
    };
    fetchData();
  }, []);

  const fetchMateriales = async () => {
    const res = await fetch(`${apiUrl}/api/materiales`);
    const data = await res.json();
    setMateriales(data);
  };

  const fetchCategorias = async () => {
    const res = await fetch(`${apiUrl}/api/categorias`);
    const data = await res.json();
    setCategorias(data);
  };

  const fetchAutores = async () => {
    const res = await fetch(`${apiUrl}/api/autores`);
    const data = await res.json();
    setAutores(data);
  };

  const fetchEditoriales = async () => {
    const res = await fetch(`${apiUrl}/api/editoriales`);
    const data = await res.json();
    setEditoriales(data);
  };

  const onSubmit = async (data: Omit<Material, "_id">) => {
    try {
      const url = editId 
        ? `${apiUrl}/api/materiales/${editId}`
        : `${apiUrl}/api/materiales`;
        
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          // Convertir números a enteros
          ejemplaresTotal: Number(data.ejemplaresTotal),
          ejemplaresDisponibles: Number(data.ejemplaresDisponibles),
          paginas: Number(data.paginas)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar");
      }

      fetchMateriales();
      handleCloseForm();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error desconocido");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este material?")) {
      await fetch(`${apiUrl}/api/materiales/${id}`, { method: "DELETE" });
      fetchMateriales();
    }
  };

  const handleEdit = (material: Material) => {
    setEditId(material._id);
    reset({
      ...material,
      fechaPublicacion: material.fechaPublicacion.split("T")[0],
      tipo: material.tipo,
      titulo: material.titulo,
      autor: material.autor,
      codigo: material.codigo,
      categoria: material.categoria,
      editorial: material.editorial,
      ubicacion: material.ubicacion,
      estado: material.estado,
      imagenPortada: material.imagenPortada,
      edicion: material.edicion,
      ejemplaresTotal: Number(material.ejemplaresTotal),
      ejemplaresDisponibles: Number(material.ejemplaresDisponibles),
      paginas: Number(material.paginas)
    });
    setOpenForm(true);
  };

  const handleView = (material: Material) => {
    setSelectedMaterial(material);
    setOpenDetails(true);
  };

  const handleOpenForm = () => {
    setEditId(null);
    // Resetear el formulario con valores iniciales en blanco
    reset(initialFormValues);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    // También resetear aquí para asegurar que el formulario quede limpio
    reset(initialFormValues);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedMaterial(null);
  };

  const columns: GridColDef[] = [
    { field: "tipo", headerName: "Tipo", flex: 1 },
    { field: "titulo", headerName: "Título", flex: 1 },
    { field: "autor", headerName: "Autor", flex: 1 },
    { field: "estado", headerName: "Estado", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleView(params.row)}>
            <Visibility />
          </IconButton>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            <Delete />
          </IconButton>
        </>
      ),
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
        <Typography variant="h4">Materiales</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenForm}
        >
          Agregar Material
        </Button>
      </Box>

      <DataGrid
        showToolbar
        rows={materiales}
        columns={columns}
        getRowId={(row) => row._id}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        autoHeight
      />

      {/* Formulario agregar/editar */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>
          {editId ? "Editar Material" : "Agregar Material"}
        </DialogTitle>
        <DialogContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="material-form"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select {...register("tipo")} value={watch("tipo") || ""}>
                <MenuItem value="libro">Libro</MenuItem>
                <MenuItem value="revista">Revista</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Título" {...register("titulo")} fullWidth />

            <FormControl fullWidth>
              <InputLabel>Autor</InputLabel>
              <Select {...register("autor")} value={watch("autor") || ""}>
                {autores.map((autor) => (
                  <MenuItem key={autor.nombre} value={autor.nombre}>
                    {autor.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Código" {...register("codigo")} fullWidth />

            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select 
                {...register("categoria")} 
                value={watch("categoria") || ""}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.nombre} value={cat.nombre}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Ejemplares Totales"
              type="number"
              {...register("ejemplaresTotal", { 
                valueAsNumber: true,
                required: "Este campo es requerido"
              })}
              fullWidth
            />
            <TextField
              label="Ejemplares Disponibles"
              type="number"
              {...register("ejemplaresDisponibles")}
              fullWidth
            />
            <TextField
              label="Fecha de Publicación"
              type="date"
              {...register("fechaPublicacion")}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Editorial</InputLabel>
              <Select 
                {...register("editorial")} 
                value={watch("editorial") || ""}
              >
                {editoriales.map((edit) => (
                  <MenuItem key={edit.nombre} value={edit.nombre}>
                    {edit.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Ubicación" {...register("ubicacion")} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                {...register("estado")}
                value={watch("estado") || ""}
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="prestado">Prestado</MenuItem>
                <MenuItem value="reparacion">En reparación</MenuItem>
                <MenuItem value="perdido">Perdido</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Imagen Portada (URL)"
              {...register("imagenPortada")}
              fullWidth
            />
            <TextField label="Edición" {...register("edicion")} fullWidth />
            <TextField
              label="Páginas"
              type="number"
              {...register("paginas")}
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancelar</Button>
          <Button
            type="submit"
            form="material-form"
            variant="contained"
            color="primary"
          >
            {editId ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de ver detalles */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Detalles del Material</DialogTitle>
        <DialogContent dividers>
          {selectedMaterial && (
            <List>
              {Object.entries(selectedMaterial).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemText primary={key} secondary={String(value)} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialesCrud;