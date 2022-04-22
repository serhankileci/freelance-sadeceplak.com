const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { ADMIN } = require("../config/config");

function initializePassport(passport, getUserByUsername) {
    const authenticateUser = async (username, password, done) => {

        const user = getUserByUsername(username);
        if (user == null) done(null, false, { message: "bu isimle bir kullanıcı bulunamadı" });
        
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user, { message: `hoşgeldin, ${user.username}` });
            } else {
                done(null, false, { message: "yanlış şifre" });
            }
        } catch (err) {
            done(err);
        }
    }

    passport.use(new LocalStrategy({ usernameField: "username" }, authenticateUser));
    passport.serializeUser((user, done) => { done(null, user.username); })
    passport.deserializeUser((username, done) => done(null, getUserByUsername(username)));
}

let admin;
(async () => admin = await User.find({ username: ADMIN }));

initializePassport(passport,
    username => Array.from(Object.values(admin))
    .find(user => user.username === username),
)

module.exports = {
    login: async (req, res) => {
        passport.authenticate("local", {
            successRedirect: "/admin",
            failureRedirect: "/admin/the-login",
            successFlash: true,
            failureFlash: true
        });
    },
    logout: async (req, res) => (req.logOut(), res.redirect("/admin/the-login"))
}