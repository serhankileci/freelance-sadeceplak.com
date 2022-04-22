const cluster = require("cluster");

if (cluster.isMaster) {
    const cpus = require("os").cpus().length;

    for (let num = 0; num < cpus; num++) cluster.fork();
    cluster.on("exit", () => cluster.fork());

} else {
    const { HTTP, HTTPS, DB, CERT_DIR } = require("./config/config");
    const express = require("express");
    const app = express();
    const http = require("http");
    const https = require("https");
    const fs = require("fs");

    const options = {
        key: fs.readFileSync(`${CERT_DIR}/privkey.pem`),
        cert: fs.readFileSync(`${CERT_DIR}/cert.pem`),
        ca: fs.readFileSync(`${CERT_DIR}/chain.pem`),
    };

    const mongoose = require ("mongoose");
    
    const helmet = require("helmet");
    const compression = require("compression");
    const methodOverride = require("method-override");
    const cookieParser = require("cookie-parser")
    const expressLayouts = require("express-ejs-layouts");
    const flash = require("express-flash");
    const session = require("express-session");
    const passport = require("passport");
    const path = require("path");

    app.use(helmet());
    app.use(compression());
    app.set("layout", "./layouts/layout.ejs");
    app.use(expressLayouts);
    app.use(methodOverride("_method"));
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    app.use(express.static(path.join(__dirname, "public")));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(flash());
    app.use(session({
        secret: SESSION_SECRET,
        rolling: true,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 1
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    const homeRouter = require("./routes/index.js");
    const adminRouter = require("./routes/admin.js");

    app.use("/", homeRouter);
    app.use("/admin", adminRouter);
    app.all("*", (req, res) => res.render("404"));
    
    (async () => {
        try {
            await mongoose.connect(DB);
            http.createServer(app).listen(HTTP);
            https.createServer(options, app).listen(HTTPS);
        } catch (error) {
            console.log(error);
            process.exit();
        }
    })();
}
