const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    code: {
      type: String,
      unique: true,
    },
    price: Number,
    status: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    category: String,
    thumbnail: String,
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(paginate);

const productosModelo = mongoose.model("products", productSchema);

module.exports = { productosModelo };
