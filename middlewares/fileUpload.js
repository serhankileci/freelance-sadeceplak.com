const multer = require("multer");
const { UPLOADS_DIR } = require("../config/config");

const mimeTypes = [
    "image/jpeg", "image/jpg", "image/png",
    "audio/wav", "audio/mpeg", "audio/webm",
    "audio/m4a", "audio/x-m4a",
];

const upload = multer({
    dest: UPLOADS_DIR,
    limits: { fileSize: 10485760 },
    fileFilter: (req, file, callback) => {
        callback(null, mimeTypes.includes(file.mimetype))
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});

const fileCountErr = (err, req, res, next) => {
    if (!err) next();

    req.session.error = "En fazla 10 resim dosyası yükleyin.";
    return res.redirect("/admin");
}

module.exports = {
    upload,
    fileCountErr
}