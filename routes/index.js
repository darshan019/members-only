var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");

/* GET home page. */
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    console.log("hello");
    await Message.find({})
      .populate({ path: "user", select: "userName email" })
      .exec()
      .then((pos) => {
        res.render("index", {
          user: req.user,
          title: "Members Only",
          posts: pos,
        });
      });
    // res.render("index", {
    //   user: req.user,
    //   title: "Members Only",
    //   posts: posts,
    // });
    console.log(req.user);
  })
);

function authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  next();
}

router.get("/sign-up", authenticated, userController.user_create_get);

router.post("/sign-up", userController.user_create_post);

router.get("/log-in", authenticated, userController.login_get);

router.post("/log-in", userController.login_post);

router.get("/post", messageController.post_get);

router.post("/post", messageController.post_sub);

router.get("/join-club", userController.join_get);

router.post("/join-club", userController.join_post);

router.get("/admin", userController.admin_get);

router.post("/admin", userController.admin_post);

router.get("/delete/:id", messageController.delete_get);

router.post("/delete/:id", messageController.delete_post);

router.get("/log-out", userController.log_out);

module.exports = router;
