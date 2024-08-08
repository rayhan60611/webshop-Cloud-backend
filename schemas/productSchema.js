const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: String,
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    productDescription: String,
  },
  { timestamps: true }
);

//product models
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
