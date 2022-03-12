// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const menuSchema = new mongoose.Schema({
    idMenuPadre:{type:String, required:true},
    Class:{type:String,required:true},
    Nombre:{type:String, required:true},
    Url:{type:String, required:true},
    Segmento:{type:String, required:true},
    Modulo:{type:String, required:true}
});

// Creating a Model from that Schema
const Menu = mongoose.model("Menu", menuSchema);

// Exporting the Model to use it in app.js File.
module.exports = Menu;