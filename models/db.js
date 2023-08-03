
const mongoose=require('mongoose');

module.exports.init=async function(){
    await mongoose.connect('mongodb+srv://root:root@cluster0.ksy4gc0.mongodb.net/supercoder?retryWrites=true&w=majority');
    console.log("connected to db");
}
