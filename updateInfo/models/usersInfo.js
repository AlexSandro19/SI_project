const { Schema, model, Types } = require("mongoose");

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    picture_path:{
        type: String,
    },
    phone:{
        type:String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("Usersinfo", schema,"usersinfo");
