require("dotenv").config({ path: __dirname + "/.env" });

module.exports = {
    HTTP: process.env.HTTP,
    HTTPS: process.env.HTTPS,
    DB: process.env.MONGODB,

    ADMIN: process.env.ADMIN,

    SERVER_DIR: process.env.SERVER_DIR,
    UPLOADS_DIR: process.env.UPLOADS_DIR,
    CERT_DIR: process.env.CERT_DIR
}
