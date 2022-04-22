
async function homepage(req, res) {
    const Product = require("../models/record-schema.js");

    const orderList = {
        "a-z": 1,
        "z-a": -1,
        "artan fiyat": 1,
        "azalan fiyat": -1,
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
        return res.render("index", {
            product: product,
            currentPage: currentPage,
            pageCount: Math.ceil(await productsLen / perPage),
            errMsg: product.length < 1 ? "Ürün bulunamadı." : null,
            req: req,
            orderList: orderList,
            productsLen: productsLen,

            locals: {
                title: "sadeceplak | 2. el plak satış",
                desc: 'Kaliteli ve uygun fiyat 2. el plaklar sadeceplak.com\'da!'
            }
        });
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect("/");
    }
}

async function viewProduct(req, res) {
    const Product = require("../models/record-schema.js");
    const fs = require("fs");
    const product = await Product.findById(req.params.id);

    try {
        return res.render("clicked-product", { 
            product: product,
            fs: fs,
            server: process.env.SERVER_DIR,
            uploads: process.env.UPLOADS_DIR,
            
            locals: {
                title: `${product.artist} - ${product.album} (PLAK) | sadeceplak`,
                desc: `'${product.artist} - ${product.album}' plağına en uygun fiyat ile sahip ol!`
            }
        });
    } catch (err) {
        console.log(err);
        req.session.error = err.toString();

        return res.redirect("/");
    }
}

module.exports = {
    homepage,
    viewProduct,
}