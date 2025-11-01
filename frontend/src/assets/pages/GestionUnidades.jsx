import * as React from "react";
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,Alert,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import UsersIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function GestionUnidades() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [economico, setEconomico] = React.useState("");
  const [datosGenerales, setDatosGenerales] = React.useState(null);
  const [reparaciones, setReparaciones] = React.useState([]);
  const [filtroReparaciones, setFiltroReparaciones] = React.useState([]);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedRep, setSelectedRep] = React.useState(null);

  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
const [repToDelete, setRepToDelete] = React.useState(null);


  const handleBuscar = async () => {
    if (!economico) {
      alert("Ingrese un número económico");
      return;
    }

    try {
      const resUnidad = await fetch(`http://localhost:5000/unidades/${economico}`);
      const unidad = await resUnidad.json();
      setDatosGenerales(unidad || {});

      const resRep = await fetch(`http://localhost:5000/reparaciones/${economico}`);
      const listaReps = await resRep.json();
      setReparaciones(listaReps);
      setFiltroReparaciones(listaReps); // respaldo para filtros
    } catch (err) {
      console.error("Error al buscar:", err);
    }
  };

const exportarExcel = () => {
  if (filtroReparaciones.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // Convertimos los datos a un arreglo de objetos planos
  const data = filtroReparaciones.map(rep => ({
    Económico: rep.economico,
    "Placa TC": rep.placa_tc,
    "Tipo Reparación": rep.tipo_reparacion,
    Detalle: rep.detalle,
    Costo: rep.costo,
    Comentarios: rep.comentarios,
    Fecha: new Date(rep.fecha).toLocaleDateString(),
    Estación: rep.estacion,
  }));

  // Creamos un workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");

  // Convertimos a archivo y descargamos
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Historial_Mantenimientos_${economico || "general"}.xlsx`);
};


  const aplicarFiltroFechas = () => {
    if (!startDate || !endDate) {
      setFiltroReparaciones(reparaciones); // sin filtros
      return;
    }

    const inicio = new Date(startDate);
    const fin = new Date(endDate);

    const filtradas = reparaciones.filter((rep) => {
      const fechaRep = new Date(rep.fecha);
      return fechaRep >= inicio && fechaRep <= fin;
    });

    setFiltroReparaciones(filtradas);
  };

const confirmDeleteRep = (id) => {
  setRepToDelete(id);
  setOpenConfirmDialog(true);
};

const executeDeleteRep = async () => {
  if (!repToDelete) return;

  try {
    await fetch(`http://localhost:5000/reparaciones/${repToDelete}/desactivar`, { method: "PUT" });
    const actualizadas = reparaciones.filter((r) => r.id !== repToDelete);
    setReparaciones(actualizadas);
    setFiltroReparaciones(actualizadas);
  } catch (err) {
    console.error("Error al eliminar reparación:", err);
  } finally {
    setOpenConfirmDialog(false);
    setRepToDelete(null);
  }
};

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      await fetch(`http://localhost:5000/reparaciones/${id}/desactivar`, { method: "PUT" });
      const actualizadas = reparaciones.filter((r) => r.id !== id);
      setReparaciones(actualizadas);
      setFiltroReparaciones(actualizadas);
    } catch (err) {
      console.error("Error al eliminar reparación:", err);
    }
  };

  const handleEditar = (rep) => {
    setSelectedRep({ ...rep });
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    try {
      await fetch(`http://localhost:5000/reparaciones/${selectedRep.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRep),
      });

      const actualizadas = reparaciones.map((r) =>
        r.id === selectedRep.id ? selectedRep : r
      );

      setReparaciones(actualizadas);
      setFiltroReparaciones(actualizadas);
      setOpenEdit(false);
    } catch (err) {
      console.error("Error al editar reparación:", err);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: "Inicio", icon: <HomeIcon />, path: "/home" },
          { text: "Gestión de Unidades", icon: <DirectionsCarIcon />, path: "/unidades" },
          { text: "Registro de Reparaciones", icon: <BuildIcon />, path: "/reparaciones" },
          { text: "Costos", icon: <MoneyIcon />, path: "/costos" },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#1a2a40",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Gestión de Unidades
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#1a2a40",
              color: "#fff",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#1a2a40",
              color: "#fff",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />

        {/* Buscar */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Económico"
            value={economico}
            onChange={(e) => setEconomico(e.target.value)}
          />
          <Button variant="contained" onClick={handleBuscar}>
            Buscar
          </Button>
        </Box>

        {/* Datos Generales */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Datos Generales</Typography>
          {datosGenerales ? (
            <>
              <Typography>Económico: {datosGenerales.economico || "-"}</Typography>
              <Typography>Placa TC: {datosGenerales.placa_tc || "-"}</Typography>
              <Typography>Inventory: {datosGenerales.inventory || "-"}</Typography>
              <Typography>País: {datosGenerales.pais || "-"}</Typography>
              <Typography>Tamaño: {datosGenerales.tamano || "-"}</Typography>
              <Typography>Tipo: {datosGenerales.tipo || "-"}</Typography>
              <Typography>Estado: {datosGenerales.estado || "-"}</Typography>
            </>
          ) : (
            <Typography color="text.secondary">
              Ingrese un número económico y presione "Buscar".
            </Typography>
          )}
        </Paper>

        {/* Filtro por fechas */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Fecha inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={aplicarFiltroFechas}>
            Filtrar Fechas
          </Button>
        </Box>


        {/* Historial */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Historial de Mantenimientos</Typography>
                          <Button
                  variant="contained"
                  color="success"
                  sx={{ mb: 2 }}
                  onClick={exportarExcel}
                >
                  Exportar a Excel
                </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#1a2a40" }}>
                  <TableCell sx={{ color: "#fff" }}>Económico</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Placa TC</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Tipo Reparación</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Detalle</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Costo</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Comentarios</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Estación</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtroReparaciones.length > 0 ? (
                  filtroReparaciones.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>{rep.economico}</TableCell>
                      <TableCell>{rep.placa_tc}</TableCell>
                      <TableCell>{rep.tipo_reparacion}</TableCell>
                      <TableCell>{rep.detalle}</TableCell>
                      <TableCell>
                         {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(rep.costo)}
                      </TableCell>
                      <TableCell>{rep.comentarios}</TableCell>
                      <TableCell>{new Date(rep.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{rep.estacion}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEditar(rep)}
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => confirmDeleteRep(rep.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={9}>
                      No hay reparaciones registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>


        {/* Modal Editar */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Editar Reparación</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Tipo Reparación"
              value={selectedRep?.tipo_reparacion || ""}
              onChange={(e) =>
                setSelectedRep({ ...selectedRep, tipo_reparacion: e.target.value })
              }
            />
            <TextField
              label="Detalle"
              value={selectedRep?.detalle || ""}
              onChange={(e) =>
                setSelectedRep({ ...selectedRep, detalle: e.target.value })
              }
            />
            <TextField
              label="Costo"
              type="number"
              value={selectedRep?.costo || ""}
              onChange={(e) =>
                setSelectedRep({ ...selectedRep, costo: e.target.value })
              }
            />
            <TextField
              label="Comentarios"
              value={selectedRep?.comentarios || ""}
              onChange={(e) =>
                setSelectedRep({ ...selectedRep, comentarios: e.target.value })
              }
            />
            <TextField
              label="Fecha"
              type="date"
              value={selectedRep?.fecha?.split("T")[0] || ""}
              onChange={(e) =>
                setSelectedRep({ ...selectedRep, fecha: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Estación"
              value={selectedRep?.estacion || ""}
              onChange={(e) =>
                setSelectedRep({ ...selectedRep, estacion: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button onClick={handleEditSave} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
  <DialogTitle>Confirmar eliminación</DialogTitle>
  <DialogContent>
    <Typography>
      ¿Seguro que deseas eliminar este registro?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
    <Button color="error" variant="contained" onClick={executeDeleteRep}>
      Eliminar
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}
