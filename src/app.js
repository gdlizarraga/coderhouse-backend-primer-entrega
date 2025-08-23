const express = require("express");
const { create } = require("express-handlebars");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");
const ProductManager = require("./managers/ProductManager");

const app = express();
const serverHTTP = http.createServer(app);
const io = socketIo(serverHTTP);
const PORT = 8080;
const productManager = new ProductManager();

// Configuración HBS
const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Vista Home
app.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", {
    products,
    title: "Home - Lista de Productos",
  });
});

// Vista RealTimeProducts
app.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("realTimeProducts", {
    products,
    title: "Home - Productos en Tiempo Real",
  });
});

// Websockets
io.on("connection", async (socket) => {
  // Enviar productos actuales al conectar
  const products = await productManager.getProducts();
  socket.emit("updateProducts", products);

  // Agregar producto
  socket.on("addProduct", async (data) => {
    try {
      await productManager.addProduct(data);
      const updatedProducts = await productManager.getProducts();
      io.emit("updateProducts", updatedProducts);
      socket.emit("addProductSuccess", "Producto agregado correctamente");
    } catch (error) {
      console.error("Error al agregar producto:", error.message);
      socket.emit("addProductError", error.message);
    }
  });

  // Eliminar producto
  socket.on("deleteProduct", async (id) => {
    console.log("Intentando eliminar producto con id:", id);
    try {
      const deleted = await productManager.deleteProduct(Number(id));
      console.log("Producto eliminado:", deleted);
      const updatedProducts = await productManager.getProducts();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Error al eliminar producto:", error.message);
      socket.emit("errorMessage", error.message);
    }
  });
});

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor con Socket.io
serverHTTP.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
