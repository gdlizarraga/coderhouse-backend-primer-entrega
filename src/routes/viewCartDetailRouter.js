const express = require("express");
const CartManager = require("../dao/CartManager.js");
const router = express.Router();
const cartManager = new CartManager();

// Vista detalle de carrito
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res
        .status(404)
        .render("cartDetail", { cart: { _id: cid, products: [] } });
    }
    res.render("cartDetail", { cart });
  } catch (error) {
    res
      .status(500)
      .render("cartDetail", { cart: { _id: req.params.cid, products: [] } });
  }
});

module.exports = router;
