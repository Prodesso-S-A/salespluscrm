// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const UserRolSchema = new mongoose.Schema({
    idUser:{type: Schema.Types.ObjectId, required:true},
    idRol:{type: Schema.Types.ObjectId, required:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('UserRol',UserRolSchema)