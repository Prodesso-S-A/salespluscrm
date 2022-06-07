// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const IconoSchema = new mongoose.Schema({
    iconoClass:{type:String, required:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Icono',IconoSchema)