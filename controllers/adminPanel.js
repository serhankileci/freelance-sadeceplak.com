const { UPLOADS_DIR,
        SERVER_DIR } = require("../config/config");
const { emptyUploadsDir } = require("../utils/emptyUploadsDir");
const { updObj } = require("../utils/docUpdate");

async function adminPage(req, res) {
    const Product = require("../models/vinyl.js");

    const orderList = {
        "a-z": 1,
        "z-a": -1,
        "artan fiyat": "asc",
        "azalan fiyat": "desc",
        "stokta olmayanlar": "tükendi",
        "özel ürün": "özel ürün",
        "indirimli": "indirimli"
    };

    function generateQuery(input) {
        const formatList = {
            "yerli45": "Yerli 45",
            "yerlilp": "Yerli LP",
            "yabancı45": "Yabancı 45",
            "yabancılp": "Yabancı LP"
        };

        const result = {
            query: {},
            sort: {},
        };

        if (!input.format && !input.order && !input.albumsAndArtists) {
            result.query.stock = "stokta";
            result.sort._id = -1;

            return result;
        } else {
            if (input.albumsAndArtists != null &&
                input.albumsAndArtists != undefined &&
                input.albumsAndArtists != "") {

                    const all = input.albumsAndArtists.replace(/i/gi, "İ").replace(/ı/gi, "İ");

                    result.query.stock = "stokta",
                    result.query["$or"] = [
                        { dev_artist: new RegExp(`(${all})`, "i") },
                        { dev_album: new RegExp(`(${all})`, "i") },
                        { dev_description: new RegExp(`(${all})`, "i") }
                    ]
            }
    
            if (input.format && !input.order) {
                result.query.stock = "stokta";
                result.query.format = formatList[input.format];
                result.sort._id = -1;
            } else {
                input.format ? result.query.format = formatList[input.format] : null;
            }
            
            switch (input.order) {
                case "a-z": case "z-a":
                    result.query.stock = "stokta";
                    result.sort.artist = orderList[input.order];
                    break;
                case "artan fiyat": case "azalan fiyat":
                    result.query.stock = "stokta";
                    result.sort.price = orderList[input.order];
                    break;
                case "stokta olmayanlar":
                    result.query.stock = orderList[input.order];
                    break;
                case "özel ürün":
                    result.query.stock = "stokta";
                    result.query.special = orderList[input.order];
                    break;
                case "indirimli":
                    result.query.stock = "stokta";
                    result.query.discount = true;
                    break;
            }
    
            return result;
        }
    }

    const result = generateQuery(req.query);

    const perPage = 48;
    const currentPage = req.params.page || 1;
    const product = await Product
                    .find(result.query)
                    .collation({ locale: "tr" })
                    .sort(result.sort)
                    .skip((perPage * currentPage) - perPage)
                    .limit(perPage);

    const productsLen = await Product
                    .find(result.query)
                    .countDocuments();

    try {
        return res.render("admin/admin", {
            product: product,
            currentPage: currentPage,
            pageCount: Math.ceil(await productsLen / perPage),
            errMsg: product.length < 1 ? "Ürün bulunamadı." : null,
            req: req,
            orderList: orderList,
            productsLen: productsLen,
            
            locals: {
                title: "sadeceplak - admin panel",
                desc: ""
            }
        });
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect("/");
    }
}

async function newProduct(req, res) {
    const Product = require("../models/vinyl.js");
    const sharp = require("sharp");
    const { description = undefined } = req.body;
    const fs = require("fs");

    req.setTimeout(300000);

    const record = new Product({
        album: req.body.album,
        artist: req.body.artist,
        format: req.body.format,
        description: description,

        dev_album: (req.body.album.toLowerCase() + req.body.album.toUpperCase()).replace(/I/g, "İ"),
        dev_artist: (req.body.artist.toLowerCase() + req.body.artist.toUpperCase()).replace(/I/g, "İ"),
        dev_description: (description.toLowerCase() + description.toUpperCase()),

        price: req.body.price,
        dateAdded: new Date().toString().split(/[.\*+:/ _]/).join("-").slice(4, 24),
        img: req.files,
        av: []
    });

    const generalPath = `${SERVER_DIR}/${UPLOADS_DIR}/${record.id}`;
    
    try {

        for await (const mediaType of ["images", "audios"]) {
            fs.mkdirSync(`${generalPath}/${mediaType}`, { recursive: true }, (err) => {
                if (err) {
                    throw new Error("Medya klasörleri oluşturulurken bir hata oluştu.");
                }
            })
        }

        for await (const img of record.img) {
            if (img.mimetype.toString().startsWith("image")) {
                await sharp(`${UPLOADS_DIR}/${img.filename}`)
                .resize(1500, 1500)
                .jpeg({ compressionLevel: 9,
                        palette: true,
                        adaptiveFiltering: true })
                .withMetadata()
                .toFile(`${generalPath}/images/${img.originalname.slice(0, img.originalname.lastIndexOf("."))}.jpeg`)
                .then(data => {})
                .catch(err => { throw err; });
            } else {
                throw new Error("Hatalı dosya uzantısı. Bir resim medyası (.png, .jpg/.jpeg uzantılı) yükleyin.");
            }
        }

        await updObj(record.img, `${generalPath}`, "images");
        await record.save();
        await emptyUploadsDir();

        return res.redirect(`/product/${record.id}`);
    } catch (err) {
        console.log(err);

        if (err.name === "ValidationError") {
            req.session.error = Object.values(err.errors).map(val => val.message);
        } else {
            req.session.error = err.toString();
        }
        await record.remove();
        await emptyUploadsDir();
        await fs.rmSync(`${SERVER_DIR}/${UPLOADS_DIR}/${record.id}`, { recursive: true, force: true });
        
        return res.redirect("/admin");
    }
}

async function updateProductData(req, res) {
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);
    //
    try {
        await Product.findOneAndUpdate({ _id: product._id }, {
            album: req.body.album,
            artist: req.body.artist,
            format: req.body.format,
            stock: req.body.stock,
            special: req.body.special,
            description: req.body.description,

            dev_album: (req.body.album.toLowerCase() + req.body.album.toUpperCase()).replace(/I/g, "İ"),
            dev_artist: (req.body.artist.toLowerCase() + req.body.artist.toUpperCase()).replace(/I/g, "İ"),
            dev_description: (req.body.description.toLowerCase() + req.body.description.toUpperCase()),

            oldprice: req.body.price < product.price ? product.price : product.oldprice ?? product.price,
            discount: req.body.price < product.price ? true : false,
            price: req.body.price
        }, { runValidators: true });

        return res.redirect(`/product/${product.id}`);
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect("/admin");
    }
}

async function updateProductImgs(req, res) {
    const sharp = require("sharp");
    const fse = require("fs-extra");
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);
    const generalPath = `${SERVER_DIR}/${UPLOADS_DIR}/${product.id}`;

    product.img = await req.files;
    
    try {
        fse.emptyDirSync(`${generalPath}/images`, err => {
            if (err) throw err;
        });
        
        for await (const img of product.img) {
            if (img.mimetype.toString().startsWith("image")) {
                await sharp(`${UPLOADS_DIR}/${img.filename}`)
                .resize(1500, 1500)
                .jpeg({ compressionLevel: 9,
                        palette: true,
                        adaptiveFiltering: true })
                .withMetadata()
                .toFile(`${generalPath}/images/${img.originalname.slice(0, img.originalname.lastIndexOf("."))}.jpeg`)
                .then(data => {})
                .catch(err => { throw err; });
            } else {
                throw new Error("Hatalı dosya uzantısı. Bir resim medyası (.png, .jpg/.jpeg uzantılı) yükleyin.");
            }
        }

        await updObj(product.img, `${generalPath}`, "images");
        await product.save();
        await emptyUploadsDir();

        return res.redirect(`/product/${product.id}`);
        
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        await emptyUploadsDir();

        return res.redirect(`/admin/product/${req.params.id}/update-media`);
    }
}

async function updateProductAudio(req, res) {
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);
    const fse = require("fs-extra");
    const generalPath = `${SERVER_DIR}/${UPLOADS_DIR}/${product.id}`;

    try {
        if (!req.file.mimetype.toString().startsWith("image")) {
            
            fse.emptyDirSync(`${generalPath}/audios`, err => {
                if (err) throw new Error("Ses klasörü temizlenirken bir sorun oluştu:", err)
            });
            
            fse.moveSync(`${UPLOADS_DIR}/${req.file.filename}`,
                `${generalPath}/audios/1.mp3`, { mkdirp: true, recursive: true }, ((err) => {
                    if (err) throw new Error("Ses dosyası taşınırken bir sorun oluştu:", err);
                })
            );
            
            product.av = await req.file;
            await updObj(product.av, `${generalPath}`, "audios");
            await product.save();
            
            return res.redirect(`/product/${product.id}`);

        } else {
            throw new Error("Hatalı dosya uzantısı. Bir ses medyası (.mp3, .wav, .webm uzantılı) yükleyin.");
        }
    } catch (err) {
        console.log(err);

        product.av = {};
        await product.save();

        await emptyUploadsDir();

        req.session.error = err.toString();
        return res.redirect(`/admin/product/${req.params.id}/update-media`);
    }
}

async function rmProductAudio(req, res) {
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);
    const generalPath = `${SERVER_DIR}/${UPLOADS_DIR}/${product.id}`;
    const fse = require("fs-extra");

    try {
        fse.emptyDirSync(`${generalPath}/audios`, err => {
            if (err) throw new Error("Ses klasörü temizlenirken bir sorun oluştu:", err)
        });

        product.av = {};
        await product.save();

        return res.redirect(`/product/${product.id}`);
    } catch (err) {
        console.log(err);

        req.session.error = "Ürün ses dosyasını silerken bilinmeyen bir hata oluştu, sistem adminine ulaşın.";

        return res.redirect(`/admin/product/${req.params.id}/update-media`);
    }
}

async function rmProduct(req, res) {
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);
    const generalPath = `${SERVER_DIR}/${UPLOADS_DIR}/${product.id}`;
    const fs = require("fs");

    try {
        await product.remove();
        await fs.rmSync(`${generalPath}`, { recursive: true, force: true });

        return res.redirect("/admin");
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect("/admin");
    }
}

async function updateProductDataPage(req, res) {
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);

    try {
        return res.render("admin/updateProductData", {
            product: product,
            req: req,
            
            locals: {
                title: "sadeceplak - ürün bilgisi güncelle",
                desc: ""
            }
        });
    } catch (err) {
        console.log(err);

        req.session.error = err.toString();
        return res.redirect(`/admin/product/${req.params.id}/update-info`);
    }
}

async function updateProductMediaPage(req, res) {
    const Product = require("../models/vinyl.js");
    const product = await Product.findById(req.params.id);

    try {
        return res.render("admin/updateProductMedia", {
            product: product,
            req: req,
            
            locals: {
                title: "sadeceplak - ürün medyası güncelle",
                desc: ""
            }
        });
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect(`/admin/product/${req.params.id}/update-media`);
    }
}

// async function registerPage(req, res) {
//     try {
//         return res.render("admin/register", {
//             title: "sadeceplak - kayıt ol",
//             req: req,
//             desc: ""
//         });
//     } catch (err) {
//         console.log(err);
//         req.session.error = err.toString();

//         return res.redirect("/admin");
//     }
// }

async function loginPage(req, res) {
    try {
        return res.render("admin/login", {
            req: req,
            
            locals: {
                title: "sadeceplak - giriş yap",
                desc: ""
            },
        });
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect("/admin");
    }
}

module.exports = {
    adminPage,

    // registerPage,
    loginPage,
    updateProductDataPage,
    updateProductMediaPage,

    updateProductData,

    newProduct,
    updateProductImgs,
    updateProductAudio,
    rmProductAudio,

    rmProduct
}