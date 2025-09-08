const fs = require("fs").promises;
const path = require("path");
const { productosModelo } = require("./models/productsModel.js");

class ProductManager {
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

  async getProducts(limit = 10, page = 1, sort = null, query = {}) {
    const options = {
      limit,
      page,
      sort,
      lean: true,
    };
    return await productosModelo.paginate(query, options);
  }

  static async getProductBy(filtro = {}) {
    return await productosModelo.findOne(filtro).lean(); // {color:"green"}
  }

  // async getProductById(id) {
  //   // await this.loadProducts();
  //   return await productosModelo.findOne({ _id: id }); // {color:"green"}
  //   //const product = this.products.find((p) => p.id == id);
  //   //return product || null;
  // }

  async addProduct(productData) {
    return await productosModelo.create(productData);
  }

  async updateProduct(id, updateData) {
    return await productosModelo
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .lean();
  }

  async deleteProduct(id) {
    // Buscar el producto para obtener el nombre de la imagen
    const product = await productosModelo.findById(id).lean();
    let deleted = await productosModelo.findByIdAndDelete(id).lean();
    // Eliminar imagen del disco si existe
    if (product && product.thumbnail) {
      const imagePath = path.join(
        __dirname,
        "../public/productos",
        product.thumbnail
      );
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        // Si el archivo no existe, ignorar el error
        if (err.code !== "ENOENT") {
          console.error("Error eliminando imagen:", err.message);
        }
      }
    }
    return deleted;
  }
}

module.exports = ProductManager;
