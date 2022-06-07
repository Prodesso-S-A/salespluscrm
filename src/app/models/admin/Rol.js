const mongoose = require('mongoose')
const {Schema} = mongoose;


const RolSchema = new Schema({
    nombre:{type:String, required:true},
    idOrganizacion:{type: String, required:true},
    Permisos: [{
        idModulo: { type: String },
        idtipoPermiso: { type: String },
        valor: { type: Boolean }
      }]
})

module.exports = mongoose.model('Rol',RolSchema)