const express = require("express");
const ProductManager = require("../dao/ProductsManager.js");
const CartManager = require("../dao/CartManager.js");
const router = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get("/", async (req, res) => {
  try {
    // Obtener parámetros de paginación desde la query
    let { page, limit, sort, query } = req.query;

    page = parseInt(page) || 1;
    limit =
      limit !== undefined && limit !== null && limit !== ""
        ? parseInt(limit)
        : 10;

    // Obtener productos paginados
    const result = await productManager.getProducts(limit, page, sort, query);
    // Construir array de números de página para la vista
    const pageNumbers = [];
    for (let i = 1; i <= result.totalPages; i++) {
      pageNumbers.push({ number: i, active: i === result.page });
    }

    // Obtener carritos activos
    const cartsResult = await cartManager.getCarts(100, 1); // Traer hasta 100 carritos
    const carts = cartsResult.docs;

    // Enviar productos, carritos y datos de paginación a la vista
    res.render("home", {
      products: result.docs,
      carts,
      pagination: {
        hasPrevPage: result.hasPrevPage,
        prevPage: result.prevPage,
        hasNextPage: result.hasNextPage,
        nextPage: result.nextPage,
        pageNumbers,
      },
      query: {
        limit: req.query.limit,
        sort: req.query.sort,
        // puedes agregar más parámetros si los usas
      },
      title: "Home - Lista de Productos",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: `Internal server error` });
  }
});

module.exports = router;
