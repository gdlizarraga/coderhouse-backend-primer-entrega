const express = require("express");
const CartManager = require("../dao/CartManager");
const ProductManager = require("../dao/ProductsManager");

const router = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// GET / - Listar todos los productos
router.get("/", async (req, res) => {
  try {
    let { limit, page, sort } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    let sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;
    const options = {
      limit,
      page,
      sort: Object.keys(sortOption).length ? sortOption : undefined,
      lean: true,
    };
    const result = await cartManager.getCarts(limit, page, sortOption);
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

// GET /:cid - Obtener productos de un carrito
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    // Usar populate para traer los productos completos
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / - Crear nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /:cid/product/:pid - Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    res.json({
      message: "Producto agregado al carrito",
      cart: updatedCart,
    });
  } catch (error) {
    if (error.message === "Carrito no encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/carts/:cid - Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.clearCartProducts(cid);
    res.json({ message: "Todos los productos eliminados del carrito", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/carts/:cid/product/:pid - Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.removeProductFromCart(cid, pid);
    res.json({ message: "Producto eliminado del carrito", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/carts/:cid - Actualizar todos los productos del carrito con un arreglo
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products))
      return res.status(400).json({ error: "products debe ser un arreglo" });
    const cart = await cartManager.updateCartProducts(cid, products);
    res.json({ message: "Carrito actualizado", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de ejemplares de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 1)
      return res.status(400).json({ error: "Cantidad inválida" });
    const cart = await cartManager.updateProductQuantity(cid, pid, quantity);
    res.json({ message: "Cantidad actualizada", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
