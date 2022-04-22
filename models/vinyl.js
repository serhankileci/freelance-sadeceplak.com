const mongoose = require("mongoose");
const fs = require("fs");
const { UPLOADS_DIR, SERVER_DIR } = require("../config/config");

const vinyl = new mongoose.Schema({
    album: {
        type: String,
        minlength: [1, "Albüm en az 1 karakterden oluşmalı."],
        maxlength: [200, "Albüm en fazla 200 karakterden oluşmalı."],
        required: [true, "Albüm kısmı boş bırakılamaz."],
    },
    artist: {
        type: String,
        minlength: [1, "Sanatçı en az 1 karakterden oluşmalı."],
        maxlength: [200, "Sanatçı en fazla 200 karakterden oluşmalı."],
        required: [true, "Sanatçı kısmı boş bırakılamaz."],
    },
    format: {
        type: String,
        required: [true, "Format kısmı boş bırakılamaz."],
    },
    description: {
        type: String,
        maxlength: [1000, "Açıklama en fazla 1000 karakterden oluşmalı."],
        default: "Bu ürünün açıklaması yok."
    },
    dev_album: {
        type: String
    },
    dev_artist: {
        type: String
    },
    dev_description: {
        type: String
    },
    price: {
        type: Number,
        min: [1, "Fiyat en az 1 olmalıdır."],
        max: [100000, "Fiyat en fazla 100,000 olmalıdır."],
        required: [true, "Fiyat kısmı boş bırakılamaz."],
        validate: {
            validator(x) { return /^[0-9]+$/.test(x) },
            message: "Fiyat sadece rakamlardan oluşmalıdır."
        }
    },
    oldprice: {
        type: Number
    },
    stock: {
        type: String,
        enum: ["stokta", "tükendi"],
        default: "stokta"
    },
    special: {
        type: String,
        enum: ["özel ürün", "standart"],
        default: "standart"
    },
    discount: {
        type: Boolean,
        default: false
    },
    dateAdded: {
        type: String,
        immutable: true
    },
    img: {
        type: Array,
        min: [1, "En az 1 fotoğraf yükleyin."],
        max: [10, "En fazla 10 fotoğraf yükleyin."]
    },
    av: {
        type: Array,
        max: [1, "En fazla 1 ses dosyası yükleyin."]
    }
});

vinyl.virtual("coverImg").get(() => {
    const files = fs.readdirSync(`${SERVER_DIR}/${UPLOADS_DIR}/${this.id}/images`);
    return `/uploads/${this.id}/images/${files[0]}`;
});

module.exports = mongoose.model("vinyl", vinyl);