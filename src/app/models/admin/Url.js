const mongoose = require('mongoose')
const {Schema} = mongoose;
const UrlSchema = new Schema({
    Url:{type:String, required:true},
    Asignada:{type:Boolean,required:true,default: false}
})
module.exports = mongoose.model('Url',UrlSchema)