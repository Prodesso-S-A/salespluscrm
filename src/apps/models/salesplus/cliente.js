// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const clienteSchema = new mongoose.Schema({
    nombreCliente:{type:String, required:true},
    rfcCliente:{type:String, required:true},
    tag:{type:String,default:"6296a7dad486268769fb859f"},
    idVendedor:{type:String, required:true},
    nombreContacto:{type:String, required:true},
    puestoContacto:{type:String, required:true},
    celularContacto:{type:String, required:true},
    whatsappContacto:{type:String, required:true},
    eMailContacto:{type:String, required:true},
    pais:{type:String, required:true},
    estado:{type:String, required:true},
    codigoPostal:{type:String, required:true},
    direccion:{type:String, required:true},
    geolocation:{type:String},
    giro:{type:String, required:true},
    foto:{type:String, required:true},
    usuarioCreador:{type:String,required:true},
    fechaCreacion: {type: Date,default: Date.now},
    idOrganizacion:{type:String, required:true},
    estado:{type:String,default:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Cliente',clienteSchema)
