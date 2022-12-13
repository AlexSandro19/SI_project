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
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    salt:{
        type: String,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", schema);
