// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const operacionclienteSchema = new mongoose.Schema({
    idCliente:{type:String, required:true},
    folioFiscal:{type:String, default:""},
    folio:{type:String, required:true},
    montoFactura:{type:Number, required:true},
    montoPagado:{type:Number, default:0},
    estadoFactura:{type:String, default:"Por Pagar"},
    usuarioCreador:{type:String,required:true},
    fechaFactura: {type: Date,default: Date.now},
    fechaLimite: {type: Date,default: Date.now},
    fechaPago: {type: Date,default: Date.now},
    fechaCreacion: {type: Date,default: Date.now},
    estado:{type:String,default:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('OperacionCliente',operacionclienteSchema)
