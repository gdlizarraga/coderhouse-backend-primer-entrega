const fs = require("fs").promises;
const path = require("path");

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, "../data/products.json");
    this.products = [];
    this.nextId = 1;
    this.init();
  }

  async init() {
    try {
      await this.loadProducts();
    } catch (error) {
      // Si el archivo no existe, se creará automáticamente
      await this.saveProducts();
    }
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      this.products = JSON.parse(data);
      // Calcular el próximo ID basado en los productos existentes
      if (this.products.length > 0) {
        this.nextId = Math.max(...this.products.map((p) => p.id)) + 1;
      }
    } catch (error) {
      this.products = [];
      this.nextId = 1;
    }
  }

  async saveProducts() {
    try {
      // Crear directorio si no existe
      const dir = path.dirname(this.path);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
    } catch (error) {
      throw new Error(`Error al guardar productos: ${error.message}`);
    }
  }

  async getProducts() {
    await this.loadProducts();
    return this.products;
  }

  async getProductById(id) {
    await this.loadProducts();
    const product = this.products.find((p) => p.id == id);
    return product || null;
  }

  async addProduct(productData) {
    const {
      title,
      description,
      code,
      price,
      status = true,
      stock,
      category,
      thumbnails = [],
    } = productData;

    // Validaciones
    if (
      !title ||
      !description ||
      !code ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      throw new Error("Todos los campos son obligatorios excepto thumbnails");
    }

    await this.loadProducts();

    // Verificar que el código no se repita
    const existingProduct = this.products.find((p) => p.code === code);
    if (existingProduct) {
      throw new Error("Ya existe un producto con ese código");
    }

    const newProduct = {
      id: this.nextId++,
      title,
      description,
      code,
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    };

    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }

  async updateProduct(id, updateData) {
    await this.loadProducts();

    const productIndex = this.products.findIndex((p) => p.id == id);
    if (productIndex === -1) {
      throw new Error("Producto no encontrado");
    }

    // No permitir actualizar el ID
    const { id: _, ...allowedUpdates } = updateData;

    // Actualizar solo los campos proporcionados
    this.products[productIndex] = {
      ...this.products[productIndex],
      ...allowedUpdates,
    };

    await this.saveProducts();
    return this.products[productIndex];
  }

  async deleteProduct(id) {
    await this.loadProducts();

    const productIndex = this.products.findIndex((p) => p.id == id);
    if (productIndex === -1) {
      throw new Error("Producto no encontrado");
    }

    const deletedProduct = this.products.splice(productIndex, 1)[0];
    await this.saveProducts();
    return deletedProduct;
  }
}

module.exports = ProductManager;
