const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
  userName: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  member: Boolean,
  admin: Boolean
})


module.exports = mongoose.model("Users", UserSchema)