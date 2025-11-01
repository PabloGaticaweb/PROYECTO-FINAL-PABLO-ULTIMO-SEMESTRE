import * as React from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  People as UsersIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const drawerWidth = 240;
const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};


// 🔹 Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0]; // Solo YYYY-MM-DD
};

export default function Costos() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState({
    economico: "",
    tipo_reparacion: "",
    detalle: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [detalle, setDetalle] = useState(null);

  const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleChange = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/detalle-costos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtro),
      });
      const data = await res.json();
      setDetalle(data);
    } catch (error) {
      console.error(error);
      alert("Error al consultar costos ❌");
    }
  };

  // 🔹 Función para exportar a Excel
  const exportarExcel = () => {
    if (!detalle || Object.keys(detalle).length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const allData = [];

    Object.keys(detalle).forEach((economico) => {
      detalle[economico].forEach((r) => {
        allData.push({
          Económico: economico,
          "Tipo Reparación": r.tipo_reparacion,
          Detalle: r.detalle,
          Costo: r.costo,
          Fecha: formatDate(r.fecha),
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(allData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Costos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Detalle_Costos.xlsx`);
  };

  const renderDetalle = () => {
    if (!detalle || Object.keys(detalle).length === 0) {
      return <Typography>Datos de detalle no disponibles</Typography>;
    }

    return Object.keys(detalle).map((economico) => {
      const registros = detalle[economico];
      const totalEconomico = registros.reduce((acc, r) => acc + parseFloat(r.costo), 0);

      return (
        <Box key={economico} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detalle de Costos para Económico {economico}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de Reparación</TableCell>
                  <TableCell>Detalle</TableCell>
                  <TableCell align="right">Costo</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registros.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.tipo_reparacion}</TableCell>
                    <TableCell>{r.detalle}</TableCell>
                    <TableCell align="right">{formatCurrency(parseFloat(r.costo))}</TableCell>
                    <TableCell>{formatDate(r.fecha)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} align="right"><b>Total</b></TableCell>
                  <TableCell align="right"><b>{formatCurrency(totalEconomico)}</b></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    });
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: "Inicio", icon: <HomeIcon />, path: "/home" },
          { text: "Gestión de Unidades", icon: <CarIcon />, path: "/unidades" },
          { text: "Registro de Reparaciones", icon: <BuildIcon />, path: "/reparaciones" },
          { text: "Costos", icon: <MoneyIcon />, path: "/costos" },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
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
            Módulo de Costos
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backgroundColor: "#1a2a40", color: "#fff" },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backgroundColor: "#1a2a40", color: "#fff" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h6" gutterBottom>
          Filtrar Costos
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField label="Económico" name="economico" value={filtro.economico} onChange={handleChange} />
            <TextField label="Tipo de Reparación" name="tipo_reparacion" value={filtro.tipo_reparacion} onChange={handleChange} />
            <TextField label="Detalle" name="detalle" value={filtro.detalle} onChange={handleChange} />
            <TextField type="date" label="Fecha Inicio" name="fecha_inicio" value={filtro.fecha_inicio} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField type="date" label="Fecha Fin" name="fecha_fin" value={filtro.fecha_fin} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>

          <Button type="submit" variant="contained">Consultar</Button>
        </form>

        {/* Botón para exportar a Excel */}
        {detalle && Object.keys(detalle).length > 0 && (
          <Button
            variant="contained"
            color="success"
            sx={{ mb: 2, mt: 2 }}
            onClick={exportarExcel}
          >
            Exportar a Excel
          </Button>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Detalle de Costos
        </Typography>
        {renderDetalle()}
      </Box>
    </Box>
  );
}

