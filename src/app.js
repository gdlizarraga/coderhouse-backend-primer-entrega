const express = require("express");
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");

const app = express();
const PORT = 8080;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "Servidor de productos y carritos funcionando",
    endpoints: {
      products: "/api/products",
      carts: "/api/carts",
    },
  });
});

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
