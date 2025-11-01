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
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
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
import { useState, useEffect } from "react";
import jsPDF from "jspdf";


const drawerWidth = 240;

export default function RegistroReparaciones() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "info",
});

const mostrarMensaje = (message, severity = "info") => {
  setSnackbar({ open: true, message, severity });
};

const [confirmDialog, setConfirmDialog] = useState({
  open: false,
  message: "",
  onConfirm: null,
});

const mostrarConfirmacion = (message, onConfirm) => {
  setConfirmDialog({ open: true, message, onConfirm });
};

const handleCloseConfirm = (respuesta) => {
  setConfirmDialog((prev) => ({ ...prev, open: false }));
  if (respuesta && confirmDialog.onConfirm) confirmDialog.onConfirm();
};

  

  // Fecha actual en formato YYYY-MM-DD
  const fechaHoy = new Date().toISOString().split("T")[0];

  // Estado de formulario de reparaciones
  const [formData, setFormData] = useState({
    economico: "",
    placa_tc: "",
    tipo_reparacion: "",
    detalle: "",
    costo: "",
    comentarios: "",
    fecha: fechaHoy,  // <-- fecha por defecto (editable)
    estacion: "",
  });

  // Estado de la unidad
  const [economicoEstado, setEconomicoEstado] = useState("");
  const [estadoUnidad, setEstadoUnidad] = useState("Activo");
  const [estacionSeleccionada, setEstacionSeleccionada] = useState("");
  const [mostrarEstacionUnidad, setMostrarEstacionUnidad] = useState(false);

  // Guardar unidad activa para PDF
  const [unidadActiva, setUnidadActiva] = useState(null);

  // Estado del preventivo
  const [openPreventivo, setOpenPreventivo] = useState(false);
  const [preventivo, setPreventivo] = useState({
    titulo: "",
    descripcion: "",
    meses: 0,
    dias: 0,
  });

  // ===== Listas de Tipo y Detalle (según lo que me diste) =====
  const tiposReparacion = [
    "SUSPENSION",
    "SISTEMA ELÉCTRICO",
    "CARROCERIA",
    "LLANTAS",
    "EJES",
    "PUERTAS",
    "FRENOS",
    "OTROS",
  ];

  const detallesPorTipo = {
    SUSPENSION: [
      "CAMBIO DE AMORTIGUADORES",
      "CAMBIO DE BUJES",
      "CAMBIO DE RESORTES",
      "AJUSTE O ALINEACIÓN",
    ],
    "SISTEMA ELÉCTRICO": [
      "CAMBIO DE LUCES TRACERAS",
      "DIRECCIONALES",
      "LUCES DE FRENO",
    ],
    CARROCERIA: [
      "SOLDADURA CHASIS",
      "REPARACIÓN TECHO O PISO",
      "REPARACIÓN PAREDES",
      "ENDEREZADO MARCOS",
      "SELLADO FILTRACIONES",
    ],
    LLANTAS: ["ROTACION", "SUSTITUCIÓN", "TORQUES"],
    EJES: ["REEMPLAZO RODAMIENTOS", "ALINEACIÓN DE EJES", "REVISIÓN DE BUJES"],
    PUERTAS: ["CAMBIO", "REPARACIÓN"],
    FRENOS: [
      "CAMBIO DE ZAPATAS",
      "CAMBIO DE TAMBORES",
      "SISTEMA DE AIRE",
      "VALVULAS",
    ],
    OTROS: ["OLORES"],
  };

    // ✅ FECHA automática con formato DD-MM-YYYY


  // Si cambia el tipo de reparación, limpiar detalle (para forzar nueva selección)
  useEffect(() => {
    if (formData.tipo_reparacion) {
      setFormData((prev) => ({ ...prev, detalle: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tipo_reparacion]);

  // Sincronizar ECONÓMICO y ESTACIÓN del panel "Estado de la Unidad" hacia el formulario de reparaciones.
  // Se autollenan pero siguen editables.
  useEffect(() => {
    // Si hay una estación seleccionada y la unidad está en taller, autollenar
    if (estadoUnidad === "EN TALLER" && estacionSeleccionada) {
      setFormData((prev) => ({
        ...prev,
        estacion: estacionSeleccionada,
        // solo setea economico si existe en el estado (evita sobrescribir si el usuario ya ingresó otro)
        economico: prev.economico || economicoEstado || prev.economico,
      }));
    } else {
      // si no está en taller, no forzamos borrar (mantener lo que usuario tenga)
      // Si quieres limpiar cuando no esté en taller, descomenta la siguiente línea:
      // setFormData(prev => ({ ...prev, estacion: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estacionSeleccionada, estadoUnidad, economicoEstado]);

  // 📌 Generar PDF (se mantiene igual)
  const generarPDF = (unidad) => {
    const doc = new jsPDF();
    const fechaHoyPDF = new Date();
    const fechaStr = fechaHoyPDF.toLocaleDateString("es-ES");
    const vence = new Date(fechaHoyPDF);
    vence.setMonth(vence.getMonth() + 1);
    const venceStr = vence.toLocaleDateString("es-ES");

    // === LOGOS ===
    const logoIzq = new Image();
    logoIzq.src = "public/logo1.png";
    try {
      doc.addImage(logoIzq, "PNG", 15, 10, 25, 25);
    } catch (e) {
      // si no encuentra imagen, no interrumpe
      console.warn("Logo izquierdo no cargado:", e);
    }

    const logoDer = new Image();
    logoDer.src = "public/logo2.png";
    try {
      doc.addImage(logoDer, "PNG", 170, 10, 25, 25);
    } catch (e) {
      console.warn("Logo derecho no cargado:", e);
    }

    doc.setFontSize(14);
    doc.setTextColor(128, 0, 0);
    doc.text("202512030122", 105, 40, { align: "center" });

    doc.setDrawColor(255, 128, 0);
    doc.setLineWidth(1.5);
    doc.line(10, 45, 200, 45);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ARWEST BIT GUATEMALA", 105, 60, { align: "center" });
    doc.text("CONSTANCIA DE FUMIGACION", 105, 70, { align: "center" });

    doc.setLineWidth(1.5);
    doc.line(10, 75, 200, 75);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`EQUIPO: FURGON: ${unidad.tamano || "48 PIES"}`, 15, 90);
    doc.text(`NUMERO DE EQUIPO: ${unidad.economico}   ${unidad.placa_tc}`, 15, 100);
    doc.text("CONSTANCIA: CONTROL ACTIVO Y PREVENTIVO DE PLAGAS", 15, 110);
    doc.text(`FECHA: ${fechaStr}`, 15, 120);
    doc.text(`VENCE: ${venceStr}`, 15, 130);
    doc.text("LUGAR: DELTA BARCENAS", 15, 140);

    doc.line(10, 145, 200, 145);

    doc.setFontSize(11);
    doc.text("INSECTICIDA: BIOTHRINE C.E.15", 15, 160);
    doc.text("INGREDIENTE: DELTAMETRINA", 15, 166);
    doc.text("DOSIS: 10ML/1LTS", 15, 172);
    doc.text("REGISTRO SANITARIO: RSCO-URB-INAC-119-317-009-1.6", 15, 178);
    doc.text("LICENCIA: 95-AR025E", 15, 184);
    doc.text("SISTEMA DE APLICACIÓN: ASPERJAO", 15, 190);

    doc.line(10, 195, 200, 195);

    doc.setFontSize(8);
    const textoDeltametrina = `DELTAMETRINA
Nombre químico: 
(S)-a-ciano-3-fenoxibencil (1R,3R)-3-(2,2-dibromovinil)-2,2-dimetil dimetilciclopropanocarboxilato (equivalente a 15 g de i.a./L),
Nombre común: deltamethrin (EPA, ISO).
Ingredientes Inertes: Tensoactivos, antioxidante, ajustador de Ph, disolventes
Eficacia antiparasitaria
Tipo de acción: INSECTICIDA PIRETROIDE QUE ACTUA POR CONTACTO E INGESTION.
Eficacia principal contra: Moscas, mosquitos, hormigas, Chinches, pulgas, arañas y alacranes.
La deltametrina (y muchos otros piretroides) es eficaz contra muchos parásitos externos del ganado y las mascotas.

Los piretroides son moléculas con actividad insecticida que se aplican a cosechas, plantas de jardines, animales domésticos y también directamente a seres humanos.
Producto autorizado para usarse en la industria alimentaria y áreas de procesos de alimentos.
Formulaciones más comunes:
COLLARES
CONCENTRADOS para INMERSIÓN
CONCENTRADOS para ASPERSIÓN
CONCENTRADOS para TRATAMIENTO DEL ENTORNO
Uso en medicina humana: NO
Uso en higiene pública/doméstica: SÍ
Uso en agricultura: Sí
Uso en industria alimentaria: Sí
Genéricos disponibles: SÍ, ESCASOS`;
    doc.text(textoDeltametrina, 15, 210, { maxWidth: 180, lineHeightFactor: 1.2 });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SISTEMA DE CALIDAD ARWEST.", 105, 285, { align: "center" });

    doc.setLineWidth(1.5);
    doc.line(10, 290, 200, 290);

    doc.save(`Constancia_${unidad.economico}.pdf`);
  };

  // Manejar cambio de inputs
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "economico") {
      try {
        const res = await fetch(`http://localhost:5000/unidades/${value}`);
        const data = await res.json();
        if (data && data.placa_tc) {
          setFormData((prev) => ({
            ...prev,
            economico: value,
            placa_tc: data.placa_tc,
          }));
          if (data.estacion) {
            setFormData((prev) => ({ ...prev, estacion: data.estacion }));
            // también sincronizar estación con la del panel si hace sentido
            setEstacionSeleccionada((prevSel) => prevSel || data.estacion);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            economico: value,
            placa_tc: "",
            estacion: "",
          }));
        }
      } catch (err) {
        console.error("Error al buscar unidad", err);
        // igual setear económico ingresado aunque no exista en DB
        setFormData((prev) => ({ ...prev, economico: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Actualizar estado de unidad
  const handleActualizarEstado = async () => {
    if (!economicoEstado) {
      mostrarMensaje("Debes ingresar el número económico primero ❌");
      return;
    }

    try {
      const resUnidad = await fetch(`http://localhost:5000/unidades/${economicoEstado}`);
      const unidad = await resUnidad.json();
      if (!unidad) {
        mostrarMensaje("Unidad no encontrada ❌");
        return;
      }

      const estadoActual = unidad.estado;

      if (estadoUnidad === "EN TALLER" && estadoActual !== "DESPACHADO") {
        mostrarMensaje("Solo puedes pasar a 'EN TALLER' si el estado actual es 'DESPACHADO' ❌");
        return;
      }
      if (estadoUnidad === "DESPACHADO" && estadoActual !== "Activo") {
        mostrarMensaje("Solo puedes pasar a 'DESPACHADO' si el estado actual es 'Activo' ❌");
        return;
      }
      if (estadoUnidad === "Activo" && estadoActual !== "EN TALLER") {
        mostrarMensaje("Solo puedes pasar a 'Activo' si el estado actual es 'EN TALLER' ❌");
        return;
      }

      if (estadoUnidad === "EN TALLER" && !estacionSeleccionada) {
        mostrarMensaje("Debes seleccionar una estación ❌");
        return;
      }

const bodyData = { estado: estadoUnidad };

// Solo enviamos estación si la unidad está en taller
if (estadoUnidad === "EN TALLER") {
  bodyData.estacion = estacionSeleccionada;
}

const res = await fetch(`http://localhost:5000/unidades/${economicoEstado}/estado`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(bodyData),
});


      const data = await res.json();
      if (data.success) {
        if (estadoUnidad === "Activo") {
          setUnidadActiva(unidad); // ✅ Guardar unidad activa
          mostrarMensaje("Estado actualizado a 'Activo' ✅");
        }
        if (estadoUnidad === "EN TALLER") {
          // Autollenar estacion en el formulario (pero dejar editable)
          setFormData((prev) => ({ ...prev, estacion: estacionSeleccionada, economico: economicoEstado }));
          setMostrarEstacionUnidad(true);
            try {
    const resUnidadData = await fetch(`http://localhost:5000/unidades/${economicoEstado}`);
    const unidadData = await resUnidadData.json();
    if (unidadData && unidadData.placa_tc) {
      setFormData((prev) => ({
        ...prev,
        placa_tc: unidadData.placa_tc,
        // opcional: actualizar estación si quieres usar la del backend
        estacion: prev.estacion || unidadData.estacion,
      }));
    } else {
      setFormData((prev) => ({ ...prev, placa_tc: "" }));
    }
  } catch (err) {
    console.error("Error al buscar placa_tc:", err);
    setFormData((prev) => ({ ...prev, placa_tc: "" }));
  }
        } else {
          setMostrarEstacionUnidad(false);
          setFormData((prev) => ({ ...prev, estacion: "" }));
          setEstacionSeleccionada("");
        }
      } else {
        alert("Error al actualizar estado ❌");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al actualizar estado ❌");
    }
  };

  // Guardar reparación
  const handleSubmit = async (e) => {
    e.preventDefault();
    const estacionFinal = formData.estacion || estacionSeleccionada;
    const { economico, placa_tc, tipo_reparacion, detalle, costo, fecha } = formData;
    if (!economico || !placa_tc || !tipo_reparacion || !detalle || !costo || !fecha || !estacionFinal) {
      mostrarMensaje("Error: Todos los campos son obligatorios");
      return;
    }

    const reparacionData = { ...formData, estacion: estacionFinal };

    try {
      const res = await fetch("http://localhost:5000/reparaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reparacionData),
      });
      const data = await res.json();

if (data.success) {
  mostrarConfirmacion(
    "¿Quieres agendar un mantenimiento preventivo próximo?",
    () => {
      setOpenPreventivo(true);
    }
  );
  setFormData({
    economico: "",
    placa_tc: "",
    tipo_reparacion: "",
    detalle: "",
    costo: "",
    comentarios: "",
    fecha: fechaHoy,
    estacion: "",
  });
  setEstacionSeleccionada("");
} else {
  mostrarMensaje("Error: " + data.error, "error");
}
    } catch (error) {
      console.error(error);
      alert("Error en la conexión con el servidor ❌");
    }
  };

  const handlePreventivoChange = (e) => {
    const { name, value } = e.target;
    setPreventivo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreventivoSubmit = async () => {
    try {
      let fechaFutura = new Date();

      // Sumar meses
      fechaFutura.setMonth(fechaFutura.getMonth() + parseInt(preventivo.meses || 0));
      // Sumar días
      fechaFutura.setDate(fechaFutura.getDate() + parseInt(preventivo.dias || 0));
      // Restar 1 día para evitar atrasos
      fechaFutura.setDate(fechaFutura.getDate() - 1);
      // Normalizar hora
      fechaFutura.setHours(0, 0, 0, 0);

      const evento = {
        titulo: preventivo.titulo,
        descripcion: preventivo.descripcion,
        fecha: fechaFutura.toISOString().split("T")[0], // YYYY-MM-DD
      };

      await fetch("http://localhost:5000/calendario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evento),
      });

      mostrarMensaje("Mantenimiento preventivo agendado correctamente ✅");

      setOpenPreventivo(false);
      setFormData({
        economico: "",
        placa_tc: "",
        tipo_reparacion: "",
        detalle: "",
        costo: "",
        comentarios: "",
        fecha: fechaHoy,
        estacion: "",
      });
      setEstacionSeleccionada("");
      setPreventivo({ titulo: "", descripcion: "", meses: 0, dias: 0 });
    } catch (error) {
      console.error("Error al agendar preventivo:", error);
    }
  };

  const menuItems = [
    { text: "Inicio", icon: <HomeIcon />, path: "/home" },
    { text: "Gestión de Unidades", icon: <CarIcon />, path: "/unidades" },
    { text: "Registro de Reparaciones", icon: <BuildIcon />, path: "/reparaciones" },
    { text: "Costos", icon: <MoneyIcon />, path: "/costos" },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
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
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, backgroundColor: "#1a2a40" }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Registro de Reparaciones
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

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Grid container spacing={3}>
          {/* Estado de unidad */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 5 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1a2a40" }}>
                Estado de la Unidad
              </Typography>

              <TextField
                label="Económico"
                value={economicoEstado}
                onChange={(e) => setEconomicoEstado(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
              />

              <ToggleButtonGroup
                value={estadoUnidad}
                exclusive
                onChange={(e, newEstado) => newEstado && setEstadoUnidad(newEstado)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="Activo">Activo</ToggleButton>
                <ToggleButton value="EN TALLER">En Taller</ToggleButton>
                <ToggleButton value="DESPACHADO">Despachado</ToggleButton>
              </ToggleButtonGroup>

              {estadoUnidad === "EN TALLER" && (
                <TextField
                  select
                  label="Estación"
                  value={estacionSeleccionada}
                  onChange={(e) => setEstacionSeleccionada(e.target.value)}
                  SelectProps={{ native: true }}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                >
                  <option value="">Seleccione una estación</option>
                  <option value="Hidalgo (MX)">Hidalgo (MX)</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Costa Rica">Costa Rica</option>
                </TextField>
              )}

              <Button variant="contained" onClick={handleActualizarEstado} fullWidth>
                Actualizar Estado
              </Button>

              {/* 📌 Botón de PDF */}
              {unidadActiva && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => generarPDF(unidadActiva)}
                  >
                    Descargar Constancia de Fumigación
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Registro de reparaciones */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 5 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1a2a40" }}>
                Registro de Reparación
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Económico"
                  name="economico"
                  value={formData.economico}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Placa TC"
                  name="placa_tc"
                  value={formData.placa_tc}
                  onChange={handleChange}
                  required
                />

                {/* Tipo de reparación -> select */}
                <TextField
                  select
                  label="Tipo de Reparación"
                  name="tipo_reparacion"
                  value={formData.tipo_reparacion}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Seleccione tipo</MenuItem>
                  {tiposReparacion.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Detalle -> select dependiente */}
                <TextField
                  select
                  label="Detalle"
                  name="detalle"
                  value={formData.detalle}
                  onChange={handleChange}
                  required
                  disabled={!formData.tipo_reparacion}
                >
                  <MenuItem value="">Seleccione detalle</MenuItem>
                  {formData.tipo_reparacion &&
                    (detallesPorTipo[formData.tipo_reparacion] || []).map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                </TextField>

                <TextField
                  label="Costo"
                  name="costo"
                  type="number"
                  value={formData.costo}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  required
                />

                {/* Fecha con valor por defecto actual (editable) */}
                <TextField
                  label="Fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                {/* Estación autollenada pero editable (input de texto readonly -> NO, pediste editable) */}
                {/* Dejamos editable: */}
                <TextField
                  label="Estación"
                  name="estacion"
                  value={formData.estacion}
                  onChange={handleChange}
                  required
                />

                <Grid size={{ xs: 12 }}>
                  <Button type="submit" variant="contained" color="success" fullWidth>
                    Guardar Reparación
                  </Button>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Modal para mantenimiento preventivo */}
      <Dialog open={openPreventivo} onClose={() => setOpenPreventivo(false)}>
        <DialogTitle>Agendar Mantenimiento Preventivo</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Título"
            fullWidth
            name="titulo"
            value={preventivo.titulo}
            onChange={handlePreventivoChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            name="descripcion"
            value={preventivo.descripcion}
            onChange={handlePreventivoChange}
          />
          <TextField
            margin="dense"
            label="Meses"
            type="number"
            fullWidth
            name="meses"
            value={preventivo.meses}
            onChange={handlePreventivoChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="dense"
            label="Días"
            type="number"
            fullWidth
            name="dias"
            value={preventivo.dias}
            onChange={handlePreventivoChange}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreventivo(false)}>Cancelar</Button>
          <Button onClick={handlePreventivoSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: "top", horizontal: "center" }}
>
  <Alert
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    severity={snackbar.severity}
    sx={{ width: "100%" }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>

<Dialog open={confirmDialog.open} onClose={() => handleCloseConfirm(false)}>
  <DialogTitle>Confirmar acción</DialogTitle>
  <DialogContent>
    <Typography>{confirmDialog.message}</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => handleCloseConfirm(false)}>Cancelar</Button>
    <Button onClick={() => handleCloseConfirm(true)} variant="contained" color="primary">
      Aceptar
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}
