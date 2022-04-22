const express = require("express");
const router = express.Router();

const { homepage, viewProduct } = require("../controllers/homeAndProduct.js");

router
    .get("/", homepage)
    .get("/products/:page", homepage)
    .get("/product/:id", viewProduct);

module.exports = router;