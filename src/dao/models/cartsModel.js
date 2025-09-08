const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

cartSchema.plugin(paginate);

const carritoModelo = mongoose.model("carts", cartSchema);

module.exports = { carritoModelo };
