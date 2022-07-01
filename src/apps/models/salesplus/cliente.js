// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const clienteSchema = new mongoose.Schema({
    nombreCliente:{type:String, required:false},
    rfcCliente:{type:String, required:false},
    tag:{type:String,default:"62be31cfad7d1aa4973c741c"},
    idVendedor:{type:String, required:false},
    nombreContacto:{type:String, required:false},
    puestoContacto:{type:String, required:false},
    celularContacto:{type:String, required:false},
    whatsappContacto:{type:String, required:false},
    eMailContacto:{type:String, required:false},
    pais:{type:String, required:false},
    estado:{type:String, required:false},
    codigoPostal:{type:String, required:false},
    direccion:{type:String, required:false},
    geolocation:{type:String},
    giro:{type:String, required:false},
    foto:{type:String, required:false},
    usuarioCreador:{type:String,required:false},
    fechaCreacion: {type: Date,default: Date.now},
    idOrganizacion:{type:String, required:false},
    estado:{type:String,default:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Cliente',clienteSchema)
