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
} from "@mui/material";

export default function Users() {
  const [usuarios, setUsuarios] = React.useState([]);

  React.useEffect(() => {
    fetch("http://localhost:5000/Users")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Usuario</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.username}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button sx={{ mt: 2 }} variant="contained" color="primary">
        Agregar Usuario
      </Button>
    </Box>
  );
}
