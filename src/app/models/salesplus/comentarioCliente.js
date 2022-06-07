// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const comentarioclienteSchema = new mongoose.Schema({
    idCliente:{type:String, required:true},
    comentario:{type:String, required:true},
    tipoComentario:{type:String,default:""},
    idOrganizacion:{type:String,required:true},
    usuarioCreador:{type:String,required:true},
    fechaCreacion: {type: Date,default: Date.now},
    estado:{type:String,default:true}
});

// Creating a Model from that Schema
module.exports = mongoose.model('ComentarioCliente',comentarioclienteSchema)
