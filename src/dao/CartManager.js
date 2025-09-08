const fs = require("fs").promises;
const path = require("path");
const { carritoModelo } = require("./models/cartsModel.js");

class CartManager {
  async getCarts(limit = 10, page = 1, sort = null, query = {}) {
    const options = {
      limit,
      page,
      sort,
      lean: true,
    };
    return await carritoModelo.paginate(query, options);
  }

  async getCartById(id) {
    return await carritoModelo
      .findOne({ _id: id })
      .populate("products.product")
      .lean();
  }

  async createCart() {
    return await carritoModelo.create({});
  }

  async addProductToCart(cartId, productId) {
    const cart = await carritoModelo.findById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }
    // Buscar si el producto ya existe en el carrito
    const existingProduct = cart.products.find(
      (p) => p.product.toString() === productId
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    await cart.save();
    return cart;
  }

  async clearCartProducts(cartId) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    cart.products = [];
    await carritoModelo.findByIdAndUpdate(cartId, { products: [] });
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await carritoModelo.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    const newProducts = cart.products.filter(
      (p) => p.product.toString() !== productId
    );
    const updatedCart = await carritoModelo
      .findByIdAndUpdate(cartId, { products: newProducts }, { new: true })
      .populate("products.product")
      .lean();
    return updatedCart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    // Buscar el carrito por ID (sin lean para modificar)
    const cart = await carritoModelo.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    // Buscar el producto en el array
    const prod = cart.products.find((p) => p.product.toString() === productId);
    if (!prod) throw new Error("Producto no encontrado en el carrito");
    prod.quantity = quantity;
    await cart.save();
    // Retornar el carrito con populate
    return await carritoModelo
      .findById(cartId)
      .populate("products.product")
      .lean();
  }

  async updateCartProducts(cartId, products) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    cart.products = products;
    await carritoModelo.findByIdAndUpdate(cartId, { products });
    return cart;
  }
}

module.exports = CartManager;
