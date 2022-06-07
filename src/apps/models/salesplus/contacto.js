// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const contactoSchema = new mongoose.Schema({
    nombre:{type:String, required:true},
    telefono:{type:String, required:true},
    email:{type:String, required:true},
    whatsapp:{type:String, required:true},
    usuarioCreador:{type:String,required:true},
    fechaCreacion: {type: Date,default: Date.now},
    idOrganizacion:{type:String, required:true},
    idCliente:{type:String, required:true},
    estado:{type:String,required:true,default: 'Nuevo'}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Contacto',contactoSchema)