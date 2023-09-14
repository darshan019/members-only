const asyncHandler = require("express-async-handler")
const User = require("../models/user")
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const passport = require("passport")
require("dotenv").config()

exports.user_create_get = (req, res, next) => {
  res.render("sign-up", {user: {userName: undefined, password: undefined, email: undefined}})
}

exports.user_create_post = [
  body("username", "Username must at least be 3 characters long")
    .trim()
    .isLength({min: 3})
    .escape(),
  
  body("mail", "Enter e-mail address")
    .trim()
    .isEmail()
    .withMessage("Enter vaild email address")
    .custom(async (val) => {
      const user = await User.findOne({email: val})
      if(user) {
        throw Error("E-mail already exists use a new one")
      }
      else return true
    }),

  body("password", "Password must at least be 8 characters long")
    .trim()
    .isLength({min: 8})
    .escape(),

  body("confirm")
    .trim()
    .escape()
    .custom((val, { req }) => {
      if(val != req.body.password) {
        console.log(req.body.password)
        throw Error("Passwords don't match")
      }
      else return true
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
        const user = new User({
          userName: req.body.username,
          email: req.body.mail,
          password: hashedPassword,
          member: false,
          admin: false
        })
        
        if(!errors.isEmpty()) {
          res.render("sign-up", {
            user: {
              userName: req.body.username,
              email: req.body.mail,
              password: req.body.password,
            },
            errors: errors
          })
        }

        else {
          await user.save()
          res.redirect("/log-in")
        }

      }
      catch(err) {
        return next(err)
      }
    })

  })
]

exports.login_get = (req, res, next) => {
  res.render("log-in")
}

exports.login_post = passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/log-in",
});

exports.join_get = (req, res, next) => {
  res.render("join-club")
}

exports.join_post = [
  body("code")
    .trim()
    .escape()
    .custom((val) => {
      if(val === process.env.SECRET_KEY) {
        return true
      }
      else throw Error("Enter the correct code!")
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      res.render("join-club", { errors: errors.array() })
    }

    else {
      await User.findByIdAndUpdate(req.user._id, { member: true})
      console.log(req.user)
      res.redirect("/")
    }
  })
]

exports.admin_get = (req, res) => {
  res.render("admin")
}

exports.admin_post = [
  body("admin")
    .trim()
    .escape()
    .custom(val => {
      if(val === process.env.ADMIN_KEY) {
        return true
      }
      else throw Error("Incorrect admin key!")
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      res.render("admin", { errors: errors.array() })
    }

    else{
      await User.findByIdAndUpdate(req.user._id, { admin: true}).exec()
      res.redirect("/")
    }
  })
]

exports.log_out = (req, res, next) => {
  req.logout(err => {
    if(err) {
      return next(err)
    }
    else {
      res.redirect("/")
    }
  })
}