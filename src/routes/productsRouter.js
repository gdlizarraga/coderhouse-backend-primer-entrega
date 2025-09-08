const path = require("path");
const express = require("express");
const ProductManager = require("../dao/ProductsManager");

module.exports = function (io) {
  const router = express.Router();
  const productManager = new ProductManager();

  // Inicializar socket
  if (io && !io._productsSocketInitialized) {
    io._productsSocketInitialized = true;
    console.log("[SOCKET] Inicializando listeners de productos...");
    io.on("connection", (socket) => {
      socket.on("addProduct", async (data) => {
        console.log("[SOCKET] addProduct recibido:", data);
        try {
          const newProduct = await productManager.addProduct(data);
          // Obtener paginación del cliente o usar valores por defecto
          const { page = 1, limit = 10 } = data;
          const updatedProducts = await productManager.getProducts(limit, page);
          io.emit("updateProducts", {
            products: updatedProducts.docs,
            pagination: updatedProducts,
          });
          socket.emit(
            "addProductSuccess",
            `Producto agregado correctamente (ID: ${newProduct._id})`
          );
        } catch (error) {
          console.error("[SOCKET] Error en addProduct:", error.message);
          socket.emit("addProductError", error.message);
        }
      });
      socket.on("deleteProduct", async (payload) => {
        // payload puede ser id o {id, page, limit}
        let id,
          page = 1,
          limit = 10;
        if (typeof payload === "object") {
          id = payload.id;
          page = parseInt(payload.page) || 1;
          limit = parseInt(payload.limit) || 10;
        } else {
          id = payload;
        }
        console.log("[SOCKET] deleteProduct recibido:", id);
        try {
          await productManager.deleteProduct(id);
          let updatedProducts = await productManager.getProducts(limit, page);
          // Si la página actual queda vacía pero hay productos en páginas anteriores, mostrar la última página disponible
          if (
            updatedProducts.docs.length === 0 &&
            updatedProducts.totalPages > 0 &&
            page > updatedProducts.totalPages
          ) {
            updatedProducts = await productManager.getProducts(
              limit,
              updatedProducts.totalPages
            );
          }
          io.emit("updateProducts", {
            products: updatedProducts.docs,
            pagination: updatedProducts,
          });
        } catch (error) {
          console.error("[SOCKET] Error en deleteProduct:", error.message);
          socket.emit("errorMessage", error.message);
        }
      });
    });
  }

  // GET / - Listar todos los productos
  router.get("/", async (req, res) => {
    try {
      let { limit, page, sort } = req.query;
      limit = parseInt(limit) || 10;
      page = parseInt(page) || 1;
      let filter = {};
      // Campos definidos en el modelo
      const modelFields = [
        "title",
        "description",
        "code",
        "price",
        "status",
        "stock",
        "category",
      ];
      // Si llega algún campo del modelo en la query, agregarlo al filtro
      for (const field of modelFields) {
        if (req.query[field] !== undefined) {
          // Convertir a tipo correcto si es necesario
          if (field === "price" || field === "stock") {
            filter[field] = Number(req.query[field]);
          } else if (field === "status") {
            filter[field] = req.query[field] === "true";
          } else {
            filter[field] = req.query[field];
          }
        }
      }

      let sortOption = {};
      if (sort === "asc") sortOption.price = 1;
      if (sort === "desc") sortOption.price = -1;
      const options = {
        limit,
        page,
        sort: Object.keys(sortOption).length ? sortOption : undefined,
        lean: true,
      };
      const result = await productManager.getProducts(
        limit,
        page,
        sortOption,
        filter
      );
      // Construir links
      const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
        req.path
      }`;
      const prevLink = result.hasPrevPage
        ? `${baseUrl}?page=${result.prevPage}&limit=${limit}${
            sort ? `&sort=${sort}` : ""
          }`
        : null;
      const nextLink = result.hasNextPage
        ? `${baseUrl}?page=${result.nextPage}&limit=${limit}${
            sort ? `&sort=${sort}` : ""
          }`
        : null;
      res.json({
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink,
        nextLink,
      });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  });

  // GET /:pid - Obtener producto por ID
  router.get("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;
      const product = await ProductManager.getProductBy({ _id: pid });

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST / - Agregar nuevo producto
  const { uploader } = require("../utils/utils.js");
  router.post("/", uploader.single("thumbnail"), async (req, res) => {
    let {
      title,
      description,
      code,
      price,
      status = true,
      stock,
      category,
    } = req.body;
    if (
      !title ||
      !description ||
      !code ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      return res.status(400).json({
        error:
          "Los campos: title, description, code, price, stock y category son obligatorios excepto thumbnails",
      });
    }

    try {
      let existe = await ProductManager.getProductBy({ code });
      if (existe) {
        return res.status(400).json({
          error: `Ya existe un producto con code ${code} en db: ${existe.title}`,
        });
      }

      let thumbnail = "";
      if (req.file) {
        thumbnail = req.file.filename;
      }
      let nuevoProducto = await productManager.addProduct({
        title,
        code,
        description,
        price,
        stock,
        category,
        thumbnail,
      });

      res.status(201).json({ message: "Alta producto exitosa", nuevoProducto });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /:pid - Actualizar producto
  router.put("/:pid", async (req, res) => {
    let { pid } = req.params;
    // validaciones en relación a lo que voy a modificar
    let modifica = req.body;

    try {
      let productoModificado = await productManager.updateProduct(
        pid,
        modifica
      );

      res
        .status(200)
        .json({ message: `Modificación exitosa`, productoModificado });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /:pid - Eliminar producto
  router.delete("/:pid", async (req, res) => {
    let id = req.params.pid;
    try {
      let productoEliminado = await productManager.deleteProduct(id);
      if (!productoEliminado) {
        return res
          .status(400)
          .json({ error: `No existe producto con id ${id}` });
      }

      res.status(200).json({
        message: "Producto eliminado correctamente",
        product: productoEliminado,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
