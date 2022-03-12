const mongoose = require('mongoose')
const {Schema} = mongoose;


const RolSchema = new Schema({
    nombre:{type:String, required:true}
})

module.exports = mongoose.model('Rol',RolSchema)