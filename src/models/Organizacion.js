// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const OrganizacionSchema = new mongoose.Schema({
    Nombre:{type:String, required:true},
    RFC:{type:String, required:true},
    createdAt: {type: Date,default: Date.now}
});

// Creating a Model from that Schema
module.exports = mongoose.model('Organizacion',OrganizacionSchema)