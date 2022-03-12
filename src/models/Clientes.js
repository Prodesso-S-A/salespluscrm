// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const clienteSchema = new mongoose.Schema({
    RazonSocial:{type:String, required:true},
    RFC:{type:String,required:true},
    TipoEmpresa:{type:String, required:true},
    fecha:{type: Date,default: Date.now}
});

// Creating a Model from that Schema
const Cliente = mongoose.model("Cliente", clienteSchema);

// Exporting the Model to use it in app.js File.
module.exports = Cliente;