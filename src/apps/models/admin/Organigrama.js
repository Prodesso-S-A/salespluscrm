const mongoose = require('mongoose')
const {Schema} = mongoose;
const bcrypt=require('bcryptjs')


const OrganigramaSchema = new Schema({
    idUser:{type:String, required:true},
    idJefe:{type:String,required:true},
    meta:{type:Number,default:0},
    usuarioCreador:{type:String,required:true},
    fechaCreacion: {type: Date,default: Date.now},
    idOrganizacion:{type:String, required:true},
    estado:{type:String,default:true}
})

module.exports = mongoose.model('Organigrama',OrganigramaSchema)