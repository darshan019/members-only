const mongoose = require("mongoose")

const Schema = mongoose.Schema

const MessageSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: "Users", required: true},
  title: {type: String, required: true},
  text: {type: String, required: true},
  time: {type: Date},
})

MessageSchema.virtual("formatted_time").get(function() {
  const inputDate = new Date(this.time);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formattedDate = inputDate.toLocaleDateString('en-US', options);

  return formattedDate
})

module.exports = mongoose.model("Messages", MessageSchema)
