const asyncHandler = require("express-async-handler")
const User = require("../models/user")
const Message = require("../models/message")
const { body, validationResult } = require("express-validator")

exports.post_get = function(req, res, next) {
  res.render("post", {post: {title: undefined, text: undefined}})
}

exports.post_sub = [
  body("title", "Title should be at least 5 characters long")
    .trim()
    .isLength({min: 5})
    .escape(),

  body("content", "Content should be at least 10 characters long")
    .trim()
    .isLength({min: 10})
    .escape(),

   asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    
    const message = new Message({
      user: req.user._id,
      title: req.body.title,
      text: req.body.content,
      time: new Date()
    })

    if(!errors.isEmpty()) {
      res.render("post", {post: message, errors: errors.array()})
    }
    else {
      await message.save()
      res.redirect('/')
    }
  }) 
]

exports.delete_get = asyncHandler(async (req, res) => {
  const post = await Message.findById(req.params.id).populate({path: "user", select: "userName"}).exec()

  res.render("delete", { post: post })
})

exports.delete_post = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndDelete(req.params.id)
  res.redirect("/")
})