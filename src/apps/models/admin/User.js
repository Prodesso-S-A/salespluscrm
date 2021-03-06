const mongoose = require('mongoose')
const {Schema} = mongoose;
const bcrypt=require('bcryptjs')


const UserSchema = new Schema({
    nombre:{type:String, required:true},
    email:{type:String,required:true},
    foto:{type:String,default:""},
    password:{type:String,required:true},
    createdAt: {type: Date,default: Date.now},
    idOrganizacion: {type: String,required:true},
    Rol:{type:String,required:true},
    Licencia:{type:String,required:true}
})

UserSchema.methods.encryptPassword= async (password)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password,salt)
    return hash;
}
UserSchema.methods.matchPassword= async function (password){
    return await bcrypt.compare(password,this.password)
}
module.exports = mongoose.model('User',UserSchema)