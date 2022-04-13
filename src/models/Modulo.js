// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const ModuloSchema = new mongoose.Schema({
    Nombre:{type:String, required:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Modulo',ModuloSchema)