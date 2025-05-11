/* eslint-disable @typescript-eslint/no-explicit-any */
// PrestamosPage.tsx
import { useEffect, useState, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Box,
  Stack,
  Typography,
  Divider,
  Paper,
  InputAdornment,
  Collapse,
  FormControlLabel,
  Checkbox,
  FormControl,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  InputLabel,
  MenuItem,
  Select,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  AssignmentReturn as ReturnIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";

const apiUrl = import.meta.env.VITE_API_URL;

interface Prestamo {
  id: string;
  clavePrestamo: string;
  usuarioNombre: string;
  materialTitulo: string;
  materialTipo: string;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionEsperadaISO: string;
  estado: string;
}

interface Material {
  _id: string;
  titulo: string;
  autor?: string;
  edicion?: string;
  editorial?: string;
}

interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  multaAcumulada: number;
}

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openPrestamo, setOpenPrestamo] = useState(false);
  const [openDevolucion, setOpenDevolucion] = useState(false);
  const [openAjusteMulta, setOpenAjusteMulta] = useState(false);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<string | null>(null);
  const [usuarioMulta, setUsuarioMulta] = useState<Usuario | null>(null);
  const [montoAjuste, setMontoAjuste] = useState('');
  const [accionAjuste, setAccionAjuste] = useState('pagar');
  
  // Filtros UI
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroClave, setFiltroClave] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroSemana, setFiltroSemana] = useState(false);
  
  // Estados para el buscador de usuarios
  const [usuarioSearch, setUsuarioSearch] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<{
    usuarioId: string;
    materialId: string;
    fechaEsperada: string;
  }>();
  
  const selectedUsuarioId = watch("usuarioId");
  
  const { control: controlDev, handleSubmit: handleSubmitDev, reset: resetDev } = useForm<{ observaciones: string }>();
  
  // Carga inicial
  useEffect(() => {
    const fetchAll = async () => {
      const [respP, respM, respU] = await Promise.all([
        fetch(`${apiUrl}/api/prestamos`),
        fetch(`${apiUrl}/api/materiales`),
        fetch(`${apiUrl}/api/usuarios`),
      ]);
      const [dataP, dataM, dataU] = await Promise.all([respP.json(), respM.json(), respU.json()]);
      setPrestamos(
        dataP.map((p: any) => ({
          id: p._id,
          clavePrestamo: p.clavePrestamo,
          usuarioNombre: p.usuarioNombre,
          materialTitulo: p.materialTitulo,
          materialTipo: p.materialTipo,
          fechaPrestamo: new Date(p.fechaPrestamo).toLocaleDateString(),
          fechaDevolucionEsperada: new Date(p.fechaDevolucionEsperada).toLocaleDateString(),
          fechaDevolucionEsperadaISO: p.fechaDevolucionEsperada,
          estado: p.estado,
        }))
      );
      setMateriales(dataM);
      setUsuarios(dataU);
    };
    fetchAll();
  }, []);

  // Búsqueda de usuarios
  const buscarUsuarios = (query: string) => {
    setLoadingUsers(true);
    const normalizedQuery = query.toLowerCase().trim();
    
    const resultados = usuarios.filter(usuario => 
      usuario.apellido.toLowerCase().includes(normalizedQuery) ||
      usuario.identificacion.toLowerCase().includes(normalizedQuery) ||
      usuario.correo.toLowerCase().includes(normalizedQuery)
    );
    
    setUsuariosFiltrados(resultados);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (usuarioSearch.trim().length > 1) {
      buscarUsuarios(usuarioSearch);
    } else {
      setUsuariosFiltrados([]);
    }
  }, [usuarioSearch]);

  // Selección de usuario
  const handleSelectUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setValue("usuarioId", usuario._id);
    setShowUserSearch(false);
  };

  // Crear préstamo
  const onSubmitPrestamo = async (data: { usuarioId: string; materialId: string; fechaEsperada: string }) => {
    const res = await fetch(`${apiUrl}/api/prestamos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: data.usuarioId,
        materialId: data.materialId,
        fechaDevolucionEsperada: data.fechaEsperada,
      }),
    });
    
    if (!res.ok) {
      alert((await res.json()).message);
    } else {
      setOpenPrestamo(false);
      reset();
      setSelectedUsuario(null);
      const resp = await fetch(`${apiUrl}/api/prestamos`);
      const lista = await resp.json();
      setPrestamos(
        lista.map((p: any) => ({
          id: p._id,
          clavePrestamo: p.clavePrestamo,
          usuarioNombre: p.usuarioNombre,
          materialTitulo: p.materialTitulo,
          materialTipo: p.materialTipo,
          fechaPrestamo: new Date(p.fechaPrestamo).toLocaleDateString(),
          fechaDevolucionEsperada: new Date(p.fechaDevolucionEsperada).toLocaleDateString(),
          fechaDevolucionEsperadaISO: p.fechaDevolucionEsperada,
          estado: p.estado,
        }))
      );
    }
  };

  // Registrar devolución
  const onSubmitDev = async (data: { observaciones: string }) => {
    if (!selectedPrestamoId) return;
    const res = await fetch(`${apiUrl}/api/prestamos/devolucion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestamoId: selectedPrestamoId, observaciones: data.observaciones }),
    });
    
    if (!res.ok) {
      alert((await res.json()).message);
    } else {
      setOpenDevolucion(false);
      resetDev();
      const resp = await fetch(`${apiUrl}/api/prestamos`);
      const lista = await resp.json();
      setPrestamos(
        lista.map((p: any) => ({
          id: p._id,
          clavePrestamo: p.clavePrestamo,
          usuarioNombre: p.usuarioNombre,
          materialTitulo: p.materialTitulo,
          materialTipo: p.materialTipo,
          fechaPrestamo: new Date(p.fechaPrestamo).toLocaleDateString(),
          fechaDevolucionEsperada: new Date(p.fechaDevolucionEsperada).toLocaleDateString(),
          fechaDevolucionEsperadaISO: p.fechaDevolucionEsperada,
          estado: p.estado,
        }))
      );
    }
  };

  // Columnas DataGrid
  const columns: GridColDef[] = [
    { field: "clavePrestamo", headerName: "Clave", flex: 1 },
    { field: "usuarioNombre", headerName: "Usuario", flex: 1 },
    { field: "materialTitulo", headerName: "Material", flex: 1 },
    { field: "materialTipo", headerName: "Tipo", flex: 1 },
    { field: "fechaPrestamo", headerName: "Fecha Préstamo", flex: 1 },
    { field: "fechaDevolucionEsperada", headerName: "Fecha Esperada", flex: 1 },
    { 
      field: "estado", 
      headerName: "Estado", 
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'activo' ? 'success' : 
            params.value === 'retrasado' ? 'error' : 'warning'
          }
          variant="outlined"
        />
      )
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => {
        if (params.row.estado !== "activo" && params.row.estado !== "retrasado") {
          return null;
        }
        return (
          <Button
            variant="contained"
            size="small"
            startIcon={<ReturnIcon />}
            onClick={() => {
              setSelectedPrestamoId(params.row.id);
              setOpenDevolucion(true);
            }}
          >
            Devolver
          </Button>
        );
      },
    },
  ];

  // Función para calcular inicio y fin de semana actual
  const getWeekBounds = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  };

  // Filtrado en cliente
  const prestamosFiltrados = useMemo(() => {
    const { monday, sunday } = getWeekBounds();
    return prestamos.filter((p) => {
      if (filtroClave && !(p.clavePrestamo?.toLowerCase() || '').includes(filtroClave.toLowerCase())) {
        return false;
      }
      if (filtroUsuario && !(p.usuarioNombre?.toLowerCase() || '').includes(filtroUsuario.toLowerCase())) {
        return false;
      }
      const fechaISO = new Date(p.fechaDevolucionEsperadaISO);
      if (filtroSemana) {
        if (isNaN(fechaISO.getTime()) || fechaISO < monday || fechaISO > sunday) {
          return false;
        }
      }
      if (!filtroSemana && filtroFecha) {
        const start = new Date(filtroFecha + "T00:00:00");
        const end = new Date(filtroFecha + "T23:59:59");
        if (isNaN(fechaISO.getTime()) || fechaISO < start || fechaISO > end) {
          return false;
        }
      }
      return true;
    });
  }, [prestamos, filtroClave, filtroUsuario, filtroFecha, filtroSemana]);

  // Separar activos y devueltos
  const activos = prestamosFiltrados.filter(p => p.estado === "activo" || p.estado === "retrasado");
  const devueltos = prestamosFiltrados.filter(p => p.estado !== "activo" && p.estado !== "retrasado");

  // Obtener el nombre completo del usuario seleccionado
  const getSelectedUserName = () => {
    if (selectedUsuario) {
      return `${selectedUsuario.nombre} ${selectedUsuario.apellido}`;
    }
    
    if (selectedUsuarioId) {
      const user = usuarios.find(u => u._id === selectedUsuarioId);
      return user ? `${user.nombre} ${user.apellido}` : "Seleccione un usuario";
    }
    
    return "Seleccione un usuario";
  };

  return (
    <Box p={2}>
      {/* Cabecera */}
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <IconButton onClick={() => setShowFiltros(v => !v)}>
          <FilterIcon />
        </IconButton>
        <Typography variant="h6" flexGrow={1}>
          Gestión de Préstamos
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<AttachMoneyIcon />}
          onClick={() => setOpenAjusteMulta(true)}
          sx={{ mr: 1 }}
        >
          Gestionar Deudas
        </Button>
        <IconButton color="primary" onClick={() => setOpenPrestamo(true)}>
          <AddIcon />
        </IconButton>
      </Stack>

      {/* Diálogo de Ajuste de Multas */}
      <Dialog 
        open={openAjusteMulta} 
        onClose={() => setOpenAjusteMulta(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajustar Multa de Usuario</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Buscar usuario"
              value={usuarioSearch}
              onChange={(e) => setUsuarioSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <List sx={{ maxHeight: 200, overflow: 'auto', mt: 2 }}>
              {usuariosFiltrados.map((usuario) => (
                <ListItemButton 
                  key={usuario._id} 
                  onClick={() => setUsuarioMulta(usuario)}
                  selected={usuarioMulta?._id === usuario._id}
                >
                  <ListItemText
                    primary={`${usuario.nombre} ${usuario.apellido}`}
                    secondary={`Deuda actual: $${usuario.multaAcumulada.toFixed(2)}`}
                  />
                </ListItemButton>
              ))}
            </List>

            {usuarioMulta && (
              <>
                <TextField
                  fullWidth
                  label="Monto"
                  type="number"
                  value={montoAjuste}
                  onChange={(e) => setMontoAjuste(e.target.value)}
                  sx={{ mt: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Acción</InputLabel>
                  <Select
                    value={accionAjuste}
                    onChange={(e) => setAccionAjuste(e.target.value)}
                  >
                    <MenuItem value="pagar">Registrar pago</MenuItem>
                    <MenuItem value="ajustar">Ajuste manual</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAjusteMulta(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            disabled={!usuarioMulta}
            onClick={async () => {
              try {
                const res = await fetch(`${apiUrl}/api/usuarios/${usuarioMulta?._id}/multa`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    accion: accionAjuste,
                    monto: Number(montoAjuste),
                    observaciones: `Ajuste realizado por bibliotecario`
                  }),
                });
                
                if (res.ok) {
                  setOpenAjusteMulta(false);
                  const resp = await fetch(`${apiUrl}/api/usuarios`);
                  setUsuarios(await resp.json());
                  setUsuarioMulta(null);
                  setMontoAjuste('');
                }
              } catch (error) {
                console.error('Error al ajustar multa:', error);
              }
            }}
          >
            Aplicar Ajuste
          </Button>
        </DialogActions>
      </Dialog>
 {/* Panel de filtros desplegable */}
 <Collapse in={showFiltros}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Clave"
            value={filtroClave}
            onChange={e => setFiltroClave(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 160 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Usuario"
            value={filtroUsuario}
            onChange={e => setFiltroUsuario(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Fecha Exacta"
            type="date"
            value={filtroFecha}
            onChange={e => setFiltroFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
            sx={{ minWidth: 180 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filtroSemana}
                onChange={e => setFiltroSemana(e.target.checked)}
              />
            }
            label="Esta semana"
          />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={() => {
              setFiltroClave("");
              setFiltroUsuario("");
              setFiltroFecha("");
              setFiltroSemana(false);
            }}
          >
            Limpiar
          </Button>
        </Paper>
      </Collapse>
      
      {/* Préstamos Activos */}
      <Typography variant="subtitle1" gutterBottom>
        Activos & Retrasados
      </Typography>
      <Box sx={{ height: 350, width: "100%", mb: 3 }}>
        <DataGrid
          rows={activos}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Box>
      
      <Divider>Devueltos</Divider>
      
      {/* Préstamos Devueltos */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Devueltos / Perdidos
      </Typography>
      <Box sx={{ height: 350, width: "100%" }}>
        <DataGrid
          rows={devueltos}
          columns={columns.filter(c => c.field !== "actions")}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Box>
      
      {/* Modal Nuevo Préstamo */}
      <Dialog
        open={openPrestamo}
        onClose={() => setOpenPrestamo(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nuevo Préstamo</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmitPrestamo)}>
            {/* Selector de usuario con búsqueda */}
            <FormControl fullWidth margin="normal">
              <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Usuario
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      flexGrow: 1, 
                      fontWeight: selectedUsuario ? 'bold' : 'normal',
                      color: selectedUsuario ? 'text.primary' : 'text.secondary'
                    }}
                  >
                    {getSelectedUserName()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowUserSearch(!showUserSearch)}
                  >
                    {showUserSearch ? "Cerrar" : "Buscar"}
                  </Button>
                </Box>
                
                <Controller
                  name="usuarioId"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Usuario obligatorio" }}
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                
                {showUserSearch && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Buscar por apellido, clave o correo"
                      value={usuarioSearch}
                      onChange={(e) => setUsuarioSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      {loadingUsers ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
                        <List dense>
                          {usuariosFiltrados.length > 0 ? (
                            usuariosFiltrados.map((usuario) => (
                              <ListItem key={usuario._id} disablePadding divider>
                                <ListItemButton onClick={() => handleSelectUsuario(usuario)}>
                                  <ListItemText
                                    primary={`${usuario.nombre} ${usuario.apellido}`}
                                    secondary={
                                      <Stack direction="row" spacing={1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <BadgeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                          {usuario.identificacion}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <EmailIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                          {usuario.correo}
                                        </Box>
                                      </Stack>
                                    }
                                  />
                                </ListItemButton>
                              </ListItem>
                            ))
                          ) : usuarioSearch.length > 1 ? (
                            <ListItem>
                              <ListItemText primary="No se encontraron usuarios" />
                            </ListItem>
                          ) : (
                            <ListItem>
                              <ListItemText primary="Escribe al menos 2 caracteres para buscar" />
                            </ListItem>
                          )}
                        </List>
                      )}
                    </Box>
                  </Box>
                )}
              </Paper>
            </FormControl>
            
            <Controller
              name="materialId"
              control={control}
              defaultValue=""
              rules={{ required: "Material obligatorio" }}
              render={({ field }) => (
                <Autocomplete
                  options={materiales}
                  getOptionLabel={opt =>
                    `${opt.titulo}${opt.autor ? ` – ${opt.autor}` : ""}${
                      opt.edicion ? ` (${opt.edicion})` : ""
                    }${opt.editorial ? ` [${opt.editorial}]` : ""}`
                  }
                  value={materiales.find(m => m._id === field.value) || null}
                  onChange={(_, v) => field.onChange(v?._id)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Buscar Material"
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
              )}
            />
            
            <Controller
              name="fechaEsperada"
              control={control}
              defaultValue={new Date().toISOString().slice(0, 10)}
              rules={{ required: "Fecha obligatoria" }}
              render={({ field }) => (
                <TextField
                  label="Fecha Devolución Esperada"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  {...field}
                />
              )}
            />
            
            <DialogActions>
              <Button onClick={() => setOpenPrestamo(false)}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Guardar
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal Devolución */}
      <Dialog
        open={openDevolucion}
        onClose={() => setOpenDevolucion(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Registrar Devolución</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmitDev(onSubmitDev)}>
            <Controller
              name="observaciones"
              control={controlDev}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observaciones"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
              )}
            />
            <DialogActions>
              <Button onClick={() => setOpenDevolucion(false)}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Registrar
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}