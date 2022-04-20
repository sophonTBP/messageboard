const mongoose = require('mongoose');
require('dotenv').config()
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env['DB'], { useNewUrlParser: true });
}

const BoardSchema = new mongoose.Schema({
  _id: String,
  boardName: { type: String, required: true },
  threads: [String],
  password: String
  
}, { _id: false })

module.exports = mongoose.model("Board", BoardSchema)


