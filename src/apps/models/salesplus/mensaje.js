// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const mensajeSchema = new mongoose.Schema({
    mensaje:{type:String, required:true},
    plataforma:{type:String,required:true},
    fechaCreacion: {type: Date,default: Date.now},
    estado:{type:String,default:"unread"},
    favorito:{type:String,default:false},
    idCliente:{type:String,required:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Mensaje',mensajeSchema)
