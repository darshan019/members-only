var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const path = require("path")
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config()


var app = express();

mongoose.set("strictQuery", false)

const User = require("./models/user")

async function main() {
  await mongoose.connect(process.env.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
}

main().catch((err) => console.log(err))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({secret: process.env.ENCRYPT_KEY, resave: false, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({extended: false}))


passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ userName: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
