var express = require("express");
var cors = require("cors");
var app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const productHandler = require("./routes/productHandler");

//middleware
app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Hello LowTech Gmbh Webshop");
// });

// app.listen(port, () => {
//   console.log(`LowTech Gmbh Webshop app listening on port ${port}`);
// });

// API URLS
app.use("/products", productHandler);

//default error handlers
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
}
app.use(errorHandler);

// connect to server mongodb/mongoose
mongoose
  .connect("mongodb://127.0.0.1:27017/webshop")
  .then(() => {
    console.log("Mongoose Connection Successful");
    app.listen(port, () => {
      console.log(`LowTech Gmbh Webshop is listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
