import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pablouser1",   // tu contraseña de MySQL
  database: "sistema_furgones"
});

db.connect(err => {
  if (err) {
    console.error("Error de conexión a MySQL:", err);
    return;
  }
  console.log("Conectado a MySQL ✅");
});


// =============================
// 🔐 Middleware de autenticación JWT
// =============================
const SECRET_KEY = process.env.JWT_SECRET || "clave_secreta_segura";

function verificarToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).json({ success: false, message: "Token requerido" });

  jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .json({ success: false, message: "Token inválido o expirado" });

    req.user = decoded; // contiene { id, username, rol }
    next();
  });
}

// =============================
// 🧑‍💼 RUTA DE LOGIN SEGURA
// =============================
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM usuarios WHERE username = ?";

  db.query(query, [username], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Error en servidor" });
    if (result.length === 0)
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: { id: user.id, username: user.username, rol: user.rol },
    });
  });
});

// =============================
// 👮 Middleware para validar roles
// =============================
function soloAdmin(req, res, next) {
  if (req.user.rol !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Acceso denegado: solo admin" });
  }
  next();
}

// Buscar datos generales de una unidad
app.get("/unidades/:search", (req, res) => {
  const { search } = req.params;

  const query = `
    SELECT * FROM unidadess 
    WHERE economico = ? OR placa_tc = ?
    LIMIT 1
  `;

  db.query(query, [search, search], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: "Unidad no encontrada" });
    }
  });
});

// Obtener unidad por número económico
app.get("/unidades/:economico", (req, res) => {
  const { economico } = req.params;
  db.query("SELECT * FROM unidadess WHERE economico = ?", [economico], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json(result[0] || null);
  });
});

// Obtener reparaciones activas
app.get("/reparaciones/:economico", (req, res) => {
  const { economico } = req.params;
  db.query(
    "SELECT * FROM reparacioness WHERE economico = ? AND activo = 1 ORDER BY fecha DESC",
    [economico],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error en servidor" });
      res.json(result);
    }
  );
});

// Editar reparación
app.put("/reparaciones/:id", (req, res) => {
  const { id } = req.params;
  const { tipo_reparacion, detalle, costo, comentarios, fecha } = req.body;

  const query = `
    UPDATE reparacioness 
    SET tipo_reparacion=?, detalle=?, costo=?, comentarios=?, fecha=? 
    WHERE id=?`;

  db.query(query, [tipo_reparacion, detalle, costo, comentarios, fecha, id], (err) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json({ success: true, message: "Reparación actualizada" });
  });
});

// Desactivar reparación (soft delete)
app.put("/reparaciones/:id/desactivar", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE reparacioness SET activo=0 WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json({ success: true, message: "Reparación desactivada" });
  });
});


// Desactivar reparación (soft delete)
app.put("/reparaciones/:id/desactivar", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE reparacioness SET activo = 0 WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json({ success: true, message: "Reparación desactivada" });
  });
});


// Ruta para registrar reparaciones
app.post("/reparaciones", (req, res) => {
  const { economico, placa_tc, tipo_reparacion, detalle, costo, comentarios, fecha, estacion } = req.body;

  if (!economico || !placa_tc || !tipo_reparacion || !detalle || !costo || !comentarios || !fecha || !estacion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const query = `
    INSERT INTO reparacioness (economico, placa_tc, tipo_reparacion, detalle, costo, comentarios, fecha, estacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [economico, placa_tc, tipo_reparacion, detalle, costo, comentarios, fecha, estacion], (err, result) => {
    if (err) {
      console.error("Error al registrar reparación:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json({ success: true, message: "Reparación registrada con éxito ✅" });
  });
});

app.post("/detalle-costos", (req, res) => {
  const { economico, tipo_reparacion, detalle, fecha_inicio, fecha_fin } = req.body;

  let query = `SELECT * FROM reparacioness WHERE 1=1`;
  const params = [];

  if (economico) {
    query += " AND economico = ?";
    params.push(economico);
  }
  if (tipo_reparacion) {
    query += " AND tipo_reparacion = ?";
    params.push(tipo_reparacion);
  }
  if (detalle) {
    query += " AND detalle = ?";
    params.push(detalle);
  }
  if (fecha_inicio) {
    query += " AND fecha >= ?";
    params.push(fecha_inicio);
  }
  if (fecha_fin) {
    query += " AND fecha <= ?";
    params.push(fecha_fin);
  }

  query += " ORDER BY economico, tipo_reparacion, detalle, fecha";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Agrupar por economico
    const detallePorEconomico = {};
    results.forEach((r) => {
      if (!detallePorEconomico[r.economico]) detallePorEconomico[r.economico] = [];
      detallePorEconomico[r.economico].push({
        tipo_reparacion: r.tipo_reparacion,
        detalle: r.detalle,
        costo: parseFloat(r.costo),
        fecha: r.fecha,
      });
    });

    res.json(detallePorEconomico);
  });
});


app.post("/detalle-costos", (req, res) => {
  const { filtros } = req.body;

  console.log("Filtros recibidos en detalle-costos:", filtros); // Log para depurar los filtros recibidos

  if (!filtros || filtros.length === 0 || !filtros[0].economico) {
    return res.status(400).json({ error: "Es necesario incluir el económico para consultar los detalles." });
  }

  const economicos = filtros.map(f => f.economico); // Recogemos todos los económicos que llegaron

  const query = `
    SELECT tipo_reparacion, economico, SUM(costo) AS total
    FROM reparacioness
    WHERE economico IN (?)  -- Usamos el array de económicos para la consulta
    GROUP BY tipo_reparacion, economico
    ORDER BY economico, tipo_reparacion
  `;

  db.query(query, [economicos], (err, result) => {
    if (err) {
      console.error("Error al consultar detalles de costos:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    const detalles = {};

    // Agrupar los resultados por económico
    result.forEach(item => {
      const { tipo_reparacion, economico, total } = item;

      if (!detalles[economico]) {
        detalles[economico] = [];
      }

      detalles[economico].push({ tipo_reparacion, total });
    });

    res.json(detalles); // Devolvemos los datos agrupados por económico
  });
});

// Nuevo endpoint: obtener usuario por username
app.get("/usuario/:username", (req, res) => {
  const { username } = req.params;

  const query = "SELECT id, username FROM usuarios WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  });
});

// Obtener todas las unidades con estado
app.get("/unidades", (req, res) => {
  const query = "SELECT id_inventario, economico, placa_tc, estado, estacion FROM unidadess";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json(result);
  });
});

// Obtener eventos
app.get("/calendario", (req, res) => {
  db.query("SELECT * FROM calendario", (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json(result);
  });
});

// Agregar evento
app.post("/calendario", (req, res) => {
  const { titulo, descripcion, fecha } = req.body;
  const query = "INSERT INTO calendario (titulo, descripcion, fecha) VALUES (?, ?, ?)";
  db.query(query, [titulo, descripcion, fecha], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json({ success: true, id: result.insertId });
  });
});

// Editar evento
app.put("/calendario/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha } = req.body;
  const query = "UPDATE calendario SET titulo=?, descripcion=?, fecha=? WHERE id=?";
  db.query(query, [titulo, descripcion, fecha, id], (err) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json({ success: true });
  });
});

// Eliminar evento
app.delete("/calendario/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM calendario WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json({ success: true });
  });
});
// Obtener todos los usuarios
app.get("/usuarios", (req, res) => {
  const query = "SELECT id, username FROM usuarios";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json(result);
  });
});

// Cambiar estado de unidad
app.put("/unidades/:economico/estado", (req, res) => {
  const { economico } = req.params;
  const { estado, estacion } = req.body;

  // Si llega estacion, actualizamos ambas columnas
  if (typeof estacion !== "undefined") {
    db.query(
      "UPDATE unidadess SET estado = ?, estacion = ? WHERE economico = ?",
      [estado, estacion, economico],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, message: "Estado y estación actualizados correctamente" });
      }
    );
  } else {
    // Si no llega estacion, solo actualizamos estado
    db.query(
      "UPDATE unidadess SET estado = ? WHERE economico = ?",
      [estado, economico],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, message: "Estado actualizado correctamente" });
      }
    );
  }
});

// Backend Node.js / Express
app.get("/api/correlativo", async (req, res) => {
  try {
    // Obtener el último correlativo
    const result = await db.query(
      "SELECT correlativo FROM correlativo_pdf ORDER BY id DESC LIMIT 1"
    );
    let last = result.rows[0]?.correlativo;

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaStr = `${yyyy}${mm}${dd}`; // YYYYMMDD

    let nuevo;
    if (last && String(last).startsWith(fechaStr)) {
      // Incrementa el contador del día
      const contador = parseInt(String(last).slice(8)) + 1;
      nuevo = fechaStr + contador.toString().padStart(4, "0");
    } else {
      // Primer PDF del día
      nuevo = fechaStr + "0122"; // empieza en 0122 como ejemplo
    }

    // Guardar en la BD
    await db.query(
      "INSERT INTO correlativo_pdf(correlativo) VALUES($1)",
      [nuevo]
    );

    res.json({ correlativo: nuevo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar correlativo" });
  }
});

export const registerUser = async (req, res) => {
  const { username, password, rol } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO usuarios (username, password, rol)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [username, hashed, rol], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Usuario registrado exitosamente" });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
export default app; 