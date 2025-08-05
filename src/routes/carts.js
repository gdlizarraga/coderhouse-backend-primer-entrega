const express = require("express");
const CartManager = require("../managers/CartManager");
const ProductManager = require("../managers/ProductManager");

const router = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// POST / - Crear nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:cid - Obtener productos de un carrito
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Obtener información completa de cada producto
    const productsWithDetails = await Promise.all(
      cart.products.map(async (cartProduct) => {
        const productDetails = await productManager.getProductById(
          cartProduct.product
        );
        if (productDetails) {
          return {
            product: productDetails,
            quantity: cartProduct.quantity,
          };
        } else {
          // Si el producto no existe, mantener la estructura original
          return {
            product: cartProduct.product,
            quantity: cartProduct.quantity,
            error: "Producto no encontrado",
          };
        }
      })
    );

    res.json(productsWithDetails);
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

module.exports = router;
