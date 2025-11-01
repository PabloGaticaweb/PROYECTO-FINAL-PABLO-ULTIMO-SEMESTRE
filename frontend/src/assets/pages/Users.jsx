import * as React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

export default function Users() {
  const [usuarios, setUsuarios] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    nombre: "",
    email: "",
    password: "",
    role: "MECANICO",
  });

  const cargarUsuarios = () => {
    fetch("http://localhost:5000/Users")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  };

  React.useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const crearUsuario = async () => {
    const res = await fetch("http://localhost:5000/Users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ nombre: "", email: "", password: "", role: "MECANICO" });
      cargarUsuarios();
    } else {
      alert("Error al crear usuario");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.nombre}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={() => setOpen(true)}>
        Agregar Usuario
      </Button>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Registrar Usuario</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} />
          <TextField label="Contraseña" type="password" name="password" value={form.password} onChange={handleChange} />

          <TextField select label="Rol" name="role" value={form.role} onChange={handleChange}>
            <MenuItem value="ADMIN">Administrador</MenuItem>
            <MenuItem value="MECANICO">Mecánico</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={crearUsuario}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
