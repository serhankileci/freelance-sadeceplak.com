const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Kullanıcı adı boş bırakılamaz."],
        minlength: [5, "Kullanıcı adı en az 5 karakterden oluşmalı."],
        maxlength: [25, "Kullanıcı adı en fazla 25 karakterden oluşmalı."],
        validate: {
            validator(x) { return /^[a-z]+$/i.test(x) },
            message: "Kullanıcı adı sadece harflerden oluşmalı."
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [10, "Şifre en az 10 karakterden oluşmalı."],
    }
});

module.exports = mongoose.model("user", usersSchema);