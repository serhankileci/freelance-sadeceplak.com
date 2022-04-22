module.exports = {
    checkAuth: (req, res, next) => req.isAuthenticated() ? next() : res.redirect("/admin/the-login"),
    checkNotAuth: (req, res, next) => req.isAuthenticated() ? res.redirect("/admin") : next()
}