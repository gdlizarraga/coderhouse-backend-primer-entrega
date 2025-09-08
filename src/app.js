const express = require("express");
const mongoose = require("mongoose");

const { conectarDB } = require("./config/db.js");
const { config } = require("./config/config.js");

const { create } = require("express-handlebars");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

// Configuración Ruteo
const productsRouterFactory = require("./routes/productsRouter.js");
const cartsRouter = require("./routes/cartsRouter.js");
const viewProductsRouter = require("./routes/viewProductsRouter.js");
const viewProductsRealTimeRouter = require("./routes/viewProductsRealTimeRouter.js");
const viewProductDetailRouter = require("./routes/viewProductDetailRouter.js");
const viewCartDetailRouter = require("./routes/viewCartDetailRouter.js");

// Configuración Managers
const ProductManager = require("./dao/ProductsManager.js");

const app = express();
const serverHTTP = http.createServer(app);
const io = socketIo(serverHTTP);
const PORT = config.PORT;
const productManager = new ProductManager();

// Configuración HBS
const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
  helpers: {
    eq: (a, b) => a === b,
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas API (productos primero para asegurar el socket)
const productsRouter = productsRouterFactory(io);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewProductsRouter);
app.use("/", viewProductsRealTimeRouter);
app.use("/products", viewProductDetailRouter);
app.use("/cart", viewCartDetailRouter);

// Vista Home
app.get("/", async (req, res) => {
  return res.status(200).json({ payload: "OK" });
});

// Vista RealTimeProducts
app.get("/realtimeproducts", async (req, res) => {
  return res.status(200).json({ payload: "OK" });
});

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor con Socket.io
serverHTTP.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

conectarDB(config.MONGO_URL, config.DB_NAME);
module.exports = app;
