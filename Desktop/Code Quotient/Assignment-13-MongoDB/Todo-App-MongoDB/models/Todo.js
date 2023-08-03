
const mongoose=require("mongoose");

const todoSchema=new mongoose.Schema({
    userid:Number,
    todoText:String,
    priority:String,
    completed:Boolean,
    pic:String,
})

const Todo=mongoose.model("Todo",todoSchema);

module.exports=Todo;