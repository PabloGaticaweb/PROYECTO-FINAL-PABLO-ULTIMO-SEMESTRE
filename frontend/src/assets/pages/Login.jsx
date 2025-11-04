import * as React from "react";
import {
  Box, Button, Checkbox, CssBaseline, FormControlLabel, TextField,
  Typography, Link, Fade, Divider, InputAdornment
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Lock, Person } from "@mui/icons-material";


const Container = styled(Box)(() => ({
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  display: "flex", alignItems: "center", justifyContent: "center",
  backgroundImage: "url('/LOGO.jpg')", backgroundSize: "cover", backgroundPosition: "center", color: "#fff",
}));

const LeftSection = styled(Box)(({ theme }) => ({
  flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
  alignItems: "flex-start", padding: theme.spacing(8), textShadow: "0px 2px 6px rgba(0,0,0,0.6)",
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
  alignItems: "center", padding: theme.spacing(6), backgroundColor: "rgba(0,0,0,0.55)",
  borderRadius: 16, maxWidth: 450, margin: theme.spacing(4),
  boxShadow: "0px 10px 30px rgba(0,0,0,0.4), 0px 5px 15px rgba(0,0,0,0.25)",
}));

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [show, setShow] = React.useState(false);

  React.useEffect(() => setShow(true), []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setError("");
        navigate("/home");
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container>
        <LeftSection>
          <Fade in={show} timeout={1000}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>Bienvenido de vuelta</Typography>
              <Typography variant="body1" sx={{ mt: 2, maxWidth: "70%" }}>
                Inicia sesión para acceder a tu cuenta y continuar con tus actividades de forma segura.
              </Typography>
            </Box>
          </Fade>
        </LeftSection>

        <Fade in={show} timeout={1000}>
          <RightSection>
            <Typography component="h1" variant="h5" sx={{ fontWeight: "bold", mb: 3, color: "#fff" }}>
              Inicia sesión
            </Typography>

            <Box component="form" onSubmit={handleLogin} noValidate sx={{
              display: "flex", flexDirection: "column", gap: 2, width: "100%",
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
            }}>
              <TextField name="username" label="Usuario" type="text" required fullWidth autoFocus
                value={username} onChange={(e) => setUsername(e.target.value)} InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Person sx={{ color: "#1976d2" }} /></InputAdornment>) }}
                error={!!error} sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1, input: { color: "#fff" } }} />

              <TextField name="password" label="Contraseña" type="password" required fullWidth
                value={password} onChange={(e) => setPassword(e.target.value)} InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Lock sx={{ color: "#1976d2" }} /></InputAdornment>) }}
                error={!!error} helperText={error} sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1, input: { color: "#fff" } }} />

              <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Recordarme" sx={{ color: "#fff" }} />

              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem", borderRadius: 2, backgroundColor: "#1976d2", ":hover": { backgroundColor: "#1565c0" } }}>
                Entrar
              </Button>

              <Divider sx={{ mt: 2, mb: 1, bgcolor: "rgba(255,255,255,0.2)" }}>o</Divider>

              <Typography sx={{ textAlign: "center", fontSize: "0.9rem", color: "#fff" }}>
                ¿Olvidaste tu contraseña?{" "}
                <Link component="button" underline="hover" sx={{ color: "#90caf9" }}>Recuperar</Link>
              </Typography>
            </Box>
          </RightSection>
        </Fade>
      </Container>
    </React.Fragment>
  );
}
