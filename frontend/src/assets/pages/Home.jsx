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
  Tabs,
  Tab,
  Avatar,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  Logout as LogoutIcon,
  People as UsersIcon,
  Person as PersonIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const drawerWidth = 240;

export default function Home() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const [unidades, setUnidades] = React.useState([]);
  const [filter, setFilter] = React.useState("Todos");
  const [stationFilter, setStationFilter] = React.useState("Todas");
  const [events, setEvents] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState({ id: null, title: "", date: "", descripcion: "" });
  const username = "admin"; 
  const navigate = useNavigate();

  const calendarRef = React.useRef(null);

  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
const [eventToDelete, setEventToDelete] = React.useState(null);


  React.useEffect(() => {
    fetch("http://localhost:5000/unidades")
      .then((res) => res.json())
      .then((data) => setUnidades(data))
      .catch((err) => console.error("Error al obtener unidades:", err));

    fetch("http://localhost:5000/calendario")
      .then((res) => res.json())
      .then((data) =>
        setEvents(
          data.map((e) => ({
            id: e.id,
            title: e.titulo,
            date: e.fecha,
            descripcion: e.descripcion || "",
          }))
        )
      )
      .catch((err) => console.error("Error al obtener eventos:", err));
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleFilterChange = (estado) => setFilter(estado);

  const filteredUnidades = unidades.filter((u) => {
    const matchEstado =
      filter === "Todos" ||
      (filter === "Activo" && u.estado === "Activo") ||
      (filter === "EN TALLER" && u.estado === "EN TALLER") ||
      (filter === "DESPACHADO" && u.estado === "DESPACHADO");

    const matchEstacion = stationFilter === "Todas" || u.estacion === stationFilter;

    return matchEstado && matchEstacion;
  });

const eventosSemana = React.useMemo(() => {
  const hoy = new Date();
  const sieteDiasDespues = new Date();
  sieteDiasDespues.setDate(hoy.getDate() + 7); // Próximos 7 días

  return events.filter((ev) => {
    const fechaEvento = new Date(ev.date);
    return fechaEvento >= hoy && fechaEvento <= sieteDiasDespues;
  });
}, [events]);

const confirmDeleteEvent = (id) => {
  setEventToDelete(id);
  setOpenConfirmDialog(true);
};

const executeDeleteEvent = () => {
  if (!eventToDelete) return;

  fetch(`http://localhost:5000/calendario/${eventToDelete}`, { method: "DELETE" })
    .then(() => {
      setEvents(prev => prev.filter(e => e.id !== eventToDelete));
      const fcEvent = calendarRef.current.getApi().getEventById(eventToDelete);
      if (fcEvent) fcEvent.remove();
    })
    .catch((err) => console.error("Error al eliminar evento:", err))
    .finally(() => {
      setOpenConfirmDialog(false);
      setEventToDelete(null);
      setOpenDialog(false);
      setSelectedEvent({ id: null, title: "", date: "", descripcion: "" });
    });
};


  const drawer = (
    <div style={{ backgroundColor: "#1a2a40", height: "100%", color: "#fff" }}>
      <Toolbar>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: "#2a4d7a" }}>
            <PersonIcon />
          </Avatar>
          <Typography sx={{ ml: 1, fontWeight: "bold" }}>{username}</Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: "#2a4d7a" }} />
      <List>
        {[
          { text: "Inicio", icon: <HomeIcon />, path: "/home" },
          { text: "Gestión de Unidades", icon: <CarIcon />, path: "/unidades" },
          { text: "Registro de Reparaciones", icon: <BuildIcon />, path: "/reparaciones" },
          { text: "Costos", icon: <MoneyIcon />, path: "/Costos" },
          { text: "Cerrar sesión", icon: <LogoutIcon />, action: () => navigate("/") },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{ "&:hover": { bgcolor: "#2a4d7a" } }}
              onClick={() => (item.action ? item.action() : navigate(item.path))}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const openNewEventDialog = (dateStr) => {
    setSelectedEvent({ id: null, title: "", date: dateStr, descripcion: "" });
    setOpenDialog(true);
  };

  const openEditEventDialog = (eventInfo) => {
    const eventDate = new Date(eventInfo.start);
    const yyyy = eventDate.getFullYear();
    const mm = String(eventDate.getMonth() + 1).padStart(2, "0");
    const dd = String(eventDate.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setSelectedEvent({
      id: eventInfo.id,
      title: eventInfo.title,
      date: formattedDate,
      descripcion: eventInfo.extendedProps.descripcion || "",
    });
    setOpenDialog(true);
  };

  const handleSaveEvent = () => {
    const method = selectedEvent.id ? "PUT" : "POST";
    const url = selectedEvent.id
      ? `http://localhost:5000/calendario/${selectedEvent.id}`
      : "http://localhost:5000/calendario";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: selectedEvent.title,
        fecha: selectedEvent.date,
        descripcion: selectedEvent.descripcion,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (method === "POST") {
          const newEvent = {
            id: data.id,
            title: selectedEvent.title,
            date: selectedEvent.date,
            descripcion: selectedEvent.descripcion,
          };
          setEvents(prev => [...prev, newEvent]);
          calendarRef.current.getApi().addEvent(newEvent);
        } else {
setEvents(prev =>
  prev.map(ev =>
    ev.id === selectedEvent.id
      ? { ...ev, title: selectedEvent.title, date: selectedEvent.date, descripcion: selectedEvent.descripcion }
      : ev
  )
);
          const fcEvent = calendarRef.current.getApi().getEventById(selectedEvent.id);
          if (fcEvent) {
            fcEvent.setProp("title", selectedEvent.title);
            fcEvent.setStart(selectedEvent.date);
            fcEvent.setExtendedProp("descripcion", selectedEvent.descripcion);
          }
        }
        setOpenDialog(false);
      })
      .catch((err) => console.error("Error al guardar evento:", err));
  };

  const handleDeleteEvent = (id) => {
    if (!window.confirm("¿Deseas eliminar este evento?")) return;

    fetch(`http://localhost:5000/calendario/${id}`, { method: "DELETE" })
      .then(() => {
        setEvents(prev => prev.filter(e => e.id !== id));
        const fcEvent = calendarRef.current.getApi().getEventById(id);
        if (fcEvent) fcEvent.remove();
        setOpenDialog(false);
        setSelectedEvent({ id: null, title: "", date: "", descripcion: "" });
      })
      .catch((err) => console.error("Error al eliminar evento:", err));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#1a2a40",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Es tiempo de trabajar
            </Typography>
            <Typography variant="body2">
              Analiza tus datos y toma decisiones estratégicas
            </Typography>
          </Box>
          <Button color="inherit" onClick={() => navigate("/")}>
            <LogoutIcon />
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Toolbar />
        <Tabs value={tab} onChange={(e, v) => setTab(v)} centered textColor="primary" indicatorColor="primary">
          <Tab label="Disponibilidad" />
          <Tab label="Calendario" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          {tab === 0 && (
            <Box sx={{ height: "100%", overflowY: "auto", p: 2 }}>
              <Box sx={{ mb: 2, textAlign: "center" }}>
                <Button
                  startIcon={<FilterIcon />}
                  variant={filter === "Todos" ? "contained" : "outlined"}
                  onClick={() => handleFilterChange("Todos")}
                  sx={{ mx: 1 }}
                >
                  Todos
                </Button>
                <Button
                  startIcon={<FilterIcon />}
                  variant={filter === "Activo" ? "contained" : "outlined"}
                  onClick={() => handleFilterChange("Activo")}
                  sx={{ mx: 1 }}
                >
                  Disponible
                </Button>
                <Button
                  startIcon={<FilterIcon />}
                  variant={filter === "EN TALLER" ? "contained" : "outlined"}
                  onClick={() => handleFilterChange("EN TALLER")}
                  sx={{ mx: 1 }}
                >
                  En Taller
                </Button>
                <Button
                  startIcon={<FilterIcon />}
                  variant={filter === "DESPACHADO" ? "contained" : "outlined"}
                  onClick={() => handleFilterChange("DESPACHADO")}
                  sx={{ mx: 1 }}
                >
                  Despachado
                </Button>
              </Box>

              {/* Filtro de estación */}
              <Box sx={{ mb: 2, textAlign: "center" }}>
                <TextField
                  select
                  label="Filtrar por estación"
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                  SelectProps={{ native: true }}
                  variant="outlined"
                  size="small"
                  sx={{ width: 250 }}
                >
                  <option value="Todas">Todas</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Hidalgo (MX)">Hidalgo (MX)</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Costa Rica">Costa Rica</option>
                </TextField>
              </Box>

              <Table sx={{ maxWidth: 900, mx: "auto", bgcolor: "#fff" }}>
                <TableHead sx={{ bgcolor: "#1a2a40" }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Económico</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Placa</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Estado</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Estación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUnidades.map((u) => (
                    <TableRow key={u.id_inventario}>
                      <TableCell>{u.economico}</TableCell>
                      <TableCell>{u.placa_tc}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.estado}
                          color={
                            u.estado === "Activo"
                              ? "success"
                              : u.estado === "EN TALLER"
                              ? "error"
                              : u.estado === "DESPACHADO"
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{u.estacion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {tab === 1 && (
    <Box sx={{ height: "100%", p: 2 }}>
    {/* Lista de próximos eventos */}
    {eventosSemana.length > 0 && (
      <Box sx={{ mb: 2, p: 2, bgcolor: "#fff3e0", borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Próximos eventos esta semana:
        </Typography>
        {eventosSemana.map((ev) => (
          <Typography key={ev.id}>
            • {ev.title} - {new Date(ev.date).toLocaleDateString("es-ES")}
          </Typography>
        ))}
      </Box>
    )}


              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="100%"
                dateClick={(info) => openNewEventDialog(info.dateStr)}
                eventClick={(info) => openEditEventDialog(info.event)}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedEvent.id ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            value={selectedEvent.title}
            onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Fecha"
            type="date"
            fullWidth
            value={selectedEvent.date}
            onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Descripción"
            multiline
            rows={4}
            fullWidth
            value={selectedEvent.descripcion}
            onChange={(e) => setSelectedEvent({ ...selectedEvent, descripcion: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          {selectedEvent.id && (
            <Button color="error" onClick={() => confirmDeleteEvent(selectedEvent.id)}>
              Eliminar
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEvent}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
  <DialogTitle>Confirmar eliminación</DialogTitle>
  <DialogContent>
    <Typography>
      ¿Seguro que deseas eliminar este evento?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
    <Button color="error" variant="contained" onClick={executeDeleteEvent}>
      Eliminar
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}
