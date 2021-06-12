const express = require("express");
const routes = express.Router();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const user = require('./modle.js');
const passport = require('passport');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const flash = require('connect-flash');




routes.use(bodyparser.urlencoded({ extended: true }));

routes.use(cookieparser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));


routes.use(passport.initialize());
routes.use(passport.session());


routes.use(flash());
routes.use((req, res, next) => {
    res.locals.successmessage = req.flash('successmessage');
    res.locals.errormessage = req.flash('errormessage');
    res.locals.error = req.flash('error');
    next();

});


// database connection start===================================================================================================

mongoose.connect('mongodb://localhost/forregistration', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("connected");

});



// const register = mongoose.model('Contact', registerSchema);
// database connection end=====================================================================================================


// for registration============================================================================================================
routes.get("/", (req, res) => {
    res.render("register");
});

routes.post("/register", (req, res) => {
    var { email, username, password, confirmpassword } = req.body;
    // res.render("login");
    var err;
    if (!username || !email || !password || !confirmpassword) {
        err = "Fill the all feilds";
        res.render("register", { 'err': err });
    }
    else if (password != confirmpassword) {
        err = "pwd don't match";
        res.render("register", { 'err': err, 'username': username, 'email': email });
    }
    if (typeof err == 'undefined') {
        user.findOne({ email: email }, (err, data) => {
            if (err) throw err;
            if (data) {
                console.log("user exists");
                err = "user already taken this email";
                res.render("register", { 'err': err, 'username': username, 'email': email });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                            username, email, password
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('successmessage', "succesfully registerd, log in to continue")
                            res.redirect('/login')
                        });
                    });
                });
            }
        });
    }
});

// registration end========================================================================================================

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    user.findOne({ email: email }, (err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message: "user does't exists...." });
        }
        bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            }
            else if (!match) {
                return done(null, false, { message: "password does't match...." });
            }
            else if (match) {
                return done(null, data);
            }
        });
    });
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
})

passport.deserializeUser((id, cb) => {
    user.findById(id, (err, user) => {
        cb(err, user);
    });
});



routes.get('/login', (req, res) => {
    res.render('login')
});

routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/home',
        failureFlash: true,
    })(req, res, next);
});

routes.get('/home', (req, res) => {
    res.render('home')
});

routes.get('/logout',(req, res)=> {
    req.logout();
    res.redirect('/login')
})

module.exports = routes;