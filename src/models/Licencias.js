const mongoose = require('mongoose')
const {Schema} = mongoose;
const bcrypt=require('bcryptjs')


const LicenciaSchema = new Schema({
    idOrganizacion:{type: Schema.Types.ObjectId, required:true},
    sinceDate:{type:Date,required:true},
    expireDate:{type:Date,required:true},
    Token:{type:String,required:true}
})

module.exports = mongoose.model('Licencia',LicenciaSchema)