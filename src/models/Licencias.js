const mongoose = require('mongoose')
const {Schema} = mongoose;
const bcrypt=require('bcryptjs')


const LicenciaSchema = new Schema({
    idCliente:{type: Number, required:true},
    expireDate:{type:Date,required:true},
    Token:{type:String}
})

LicenciaSchema.methods.encryptLicense= async (Token)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(Token,salt)
    return hash;
}

module.exports = mongoose.model('Licencia',LicenciaSchema)