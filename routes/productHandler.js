const express = require("express");
const router = express.Router();
const Product = require("../schemas/productSchema");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Route to get distinct product categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$category" } } },
        },
      },
      {
        $replaceRoot: { newRoot: { category: "$_id" } },
      },
    ]);
    res.json(categories.map((c) => c.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const data = await Product.find();
    res.send(data);
  } catch {
    res.status(500).json({
      error: "There was a server-side error",
    });
  }
});

// Get a product by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id; // Capture the id from the URL parameters
    const product = await Product.findById(id).exec(); // Use Mongoose to find the document by its ID
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

//find items by ids
router.post("/find-by-ids", async (req, res) => {
  const ids = req.body.ids; // Expecting an array of IDs in the request body
  try {
    const documents = await Product.find({ _id: { $in: ids } });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error finding documents" });
  }
});

// Post a product
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({
      message: "Product saved successfully",
    });
  } catch (err) {
    const errors = err?.errors
      ? Object.values(err.errors).map((item) =>
          item.message.replace("Path", "").toUpperCase()
        )
      : ["Server-side failure"];
    console.log(err);
    res.status(500).json({
      error: errors,
    });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (deletedProduct) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

//email service
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "test.test60611@gmail.com",
    pass: "rpowdbzbtkptzbvf",
  },
});

router.post("/send-email", upload.single("attachment"), (req, res) => {
  const { to, text } = req.body;
  const attachment = req.file;

  if (!attachment) {
    return res.status(400).send("No file uploaded.");
  }

  const mailOptions = {
    from: "test.test60611@gmail.com",
    to,
    subject: "LowTech GmbH Purchase Confirmation",
    text,
    attachments: [
      {
        filename: attachment.originalname,
        path: attachment.path,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
});

module.exports = router;
