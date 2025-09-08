const express = require("express");
const ProductManager = require("../dao/ProductsManager.js");
const CartManager = require("../dao/CartManager.js");
const router = express.Router();
const cartManager = new CartManager();

// Vista detalle de producto
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await ProductManager.getProductBy({ _id: pid });

    // Obtener carritos activos
    const cartsResult = await cartManager.getCarts(100, 1); // Traer hasta 100 carritos
    const carts = cartsResult.docs;

    if (!product) {
      return res.status(404).render("productDetail", { product: null });
    }
    res.render("productDetail", { product, carts });
  } catch (error) {
    res.status(500).render("productDetail", { product: null });
  }
});

module.exports = router;
