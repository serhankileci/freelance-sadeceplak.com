const express = require("express");
const router = express.Router();

const { checkAuth, checkNotAuth } = require("../middlewares/checkAuth");
const { upload, fileCountErr } = require("../middlewares/fileUpload");
const { login, logout } = require("../middlewares/passport");
// const { register } = require("../middlewares/register");

const {
    adminPage,
    newProduct,
    updateProductDataPage,
    updateProductMediaPage,
    // registerPage,
    loginPage,
    updateProductData,
    updateProductImgs,
    updateProductAudio,
    rmProductAudio,
    rmProduct } = require("../controllers/adminPanel.js");

    router
        .get("/", checkAuth, adminPage)
        .get("/products/:page", checkAuth, adminPage)
        // .get("/the-register", checkNotAuth, registerPage)
        // .post("/the-register", checkNotAuth, register)
        .get("/the-login", checkNotAuth, loginPage)
        .post("/the-login", checkNotAuth, login)
        .delete("/the-logout", logout)
        .get("/product/:id/update-info", checkAuth, updateProductDataPage)
        .get("/product/:id/update-media", checkAuth, updateProductMediaPage)
        .post("/", upload.array("media", 10), fileCountErr, checkAuth, newProduct)
        .put("/:id", updateProductData)
        .post("/:id/updateImgs", upload.array("images", 10), fileCountErr, checkAuth, updateProductImgs)
        .post("/:id/updateAudios", upload.single("audios"), fileCountErr, checkAuth, updateProductAudio)
        .post("/:id/deleteAudio", checkAuth, rmProductAudio)
        .delete("/:id/delete-data", checkAuth, rmProduct);

module.exports = router;