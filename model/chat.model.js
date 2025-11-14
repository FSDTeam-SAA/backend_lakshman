import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
  name: { type: String},
  seller : { type: Schema.Types.ObjectId, ref: 'User'},
  schedule : { type: Schema.Types.ObjectId, ref: 'Schedule'},
  user : { type: Schema.Types.ObjectId, ref: 'User'},
  messages:[{
    text: { type: String,  },
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
},{
  timestamps: true
});

export const Chat = mongoose.model("chat", chatSchema);