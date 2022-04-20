const mongoose = require('mongoose');
require('dotenv').config()
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env['DB'], { useNewUrlParser: true });
}


const ThreadSchema = new mongoose.Schema({
  _id: String,
  board_ID: { type: String, required: true },
  //boardName:String,
  text: String,
  created_on: Date,
  replies:{type:Array},
  replycount:Number,
  password: String,  
  reported:Boolean,
  bumped_on:Date
}, { _id: false })




module.exports = mongoose.model("Thread", ThreadSchema)