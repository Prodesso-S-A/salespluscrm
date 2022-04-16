// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const ModuloOrganizacionSchema = new mongoose.Schema({
    idModulo:{ type: String , required:true },
    idOrganizacion:{type: String , required:true }
});

// Creating a Model from that Schema
module.exports = mongoose.model('ModuloOrganizacion',ModuloOrganizacionSchema)