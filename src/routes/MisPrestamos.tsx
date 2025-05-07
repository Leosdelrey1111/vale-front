// MisPrestamos.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Chip, Paper, Stack, CircularProgress } from "@mui/material";

const apiUrl = import.meta.env.VITE_API_URL;

interface Prestamo {
  id: string;
  materialTitulo: string;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  estado: string;
}

export default function MisPrestamos() {
  const { usuarioId } = useParams();
  const [data, setData] = useState<{
    activos: Prestamo[];
    historial: Prestamo[];
    adeudo: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/mis-prestamos/${usuarioId}`);
        if (!res.ok) throw new Error("Error al obtener los datos");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (usuarioId) fetchData();
  }, [usuarioId]);

  const columns: GridColDef[] = [
    { field: "materialTitulo", headerName: "Material", flex: 1 },
    { field: "fechaPrestamo", headerName: "Fecha préstamo", width: 150 },
    { field: "fechaDevolucionEsperada", headerName: "Fecha devolución", width: 150 },
    {
      field: "estado",
      headerName: "Estado",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value === "activo" ? "Activo" : "Devuelto"}
          color={params.value === "activo" ? "success" : "warning"}
          size="small"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Typography color="error">No se pudo cargar la información.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack spacing={3}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Resumen
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="body1">Préstamos activos:</Typography>
              <Typography variant="h4">{data.activos.length}</Typography>
            </Box>
            <Box>
              <Typography variant="body1">Adeudo total:</Typography>
              <Typography variant="h4" color="error">
                ${data.adeudo.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Préstamos Activos
          </Typography>
          <div style={{ height: 300, width: "100%" }}>
            <DataGrid
              rows={data.activos}
              columns={columns}
              pageSizeOptions={[5]}
              initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
            />
          </div>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historial de Préstamos
          </Typography>
          <div style={{ height: 300, width: "100%" }}>
            <DataGrid
              rows={data.historial}
              columns={columns}
              pageSizeOptions={[5]}
              initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
            />
          </div>
        </Paper>
      </Stack>
    </Box>
  );
}
