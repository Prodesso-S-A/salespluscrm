const mongoose = require('mongoose')
const {Schema} = mongoose;
const bcrypt=require('bcryptjs')


const LicenciaSchema = new Schema({
    idOrganizacion:{type: String, required:true},
    sinceDate:{type:Date,required:true},
    expireDate:{type:Date,required:true},
    Token:{type:String,required:true},
    Activa:{type:Boolean,required:true,default: true},
    Asignada:{type:Boolean,required:true,default: false}
})

module.exports = mongoose.model('Licencia',LicenciaSchema)