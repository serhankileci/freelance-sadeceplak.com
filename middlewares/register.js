module.exports = async function register (req, res) {
    const bcrypt = require("bcrypt");

    try {
        let newUser = new Admin({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 10)
        });

        await newUser.save();
        
        res.redirect("/admin/the-login");
    } catch(err) {
        console.log(err);
        res.redirect("/admin/the-register");
    }
}