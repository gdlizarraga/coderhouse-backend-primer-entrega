const fs = require("fs").promises;
const path = require("path");

class CartManager {
  constructor() {
    this.path = path.join(__dirname, "../data/carts.json");
    this.carts = [];
    this.nextId = 1;
    this.init();
  }

  async init() {
    try {
      await this.loadCarts();
    } catch (error) {
      // Si el archivo no existe, se creará automáticamente
      await this.saveCarts();
    }
  }

  async loadCarts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      this.carts = JSON.parse(data);
      // Calcular el próximo ID basado en los carritos existentes
      if (this.carts.length > 0) {
        this.nextId = Math.max(...this.carts.map((c) => c.id)) + 1;
      }
    } catch (error) {
      this.carts = [];
      this.nextId = 1;
    }
  }

  async saveCarts() {
    try {
      // Crear directorio si no existe
      const dir = path.dirname(this.path);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
    } catch (error) {
      throw new Error(`Error al guardar carritos: ${error.message}`);
    }
  }

  async createCart() {
    await this.loadCarts();

    const newCart = {
      id: this.nextId++,
      products: [],
    };

    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    await this.loadCarts();
    const cart = this.carts.find((c) => c.id == id);
    return cart || null;
  }

  async addProductToCart(cartId, productId) {
    await this.loadCarts();

    const cartIndex = this.carts.findIndex((c) => c.id == cartId);
    if (cartIndex === -1) {
      throw new Error("Carrito no encontrado");
    }

    const cart = this.carts[cartIndex];

    // Buscar si el producto ya existe en el carrito
    const existingProductIndex = cart.products.findIndex(
      (p) => p.product == productId
    );

    if (existingProductIndex !== -1) {
      // Si el producto ya existe, incrementar la cantidad
      cart.products[existingProductIndex].quantity += 1;
    } else {
      // Si el producto no existe, agregarlo con cantidad 1
      cart.products.push({
        product: Number(productId),
        quantity: 1,
      });
    }

    await this.saveCarts();
    return cart;
  }

  async getCarts() {
    await this.loadCarts();
    return this.carts;
  }
}

module.exports = CartManager;
