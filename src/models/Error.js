const mongoose = require('mongoose')
const {Schema} = mongoose;
const User = require('../models/User')
const ErrorSchema = new Schema({
    Mensaje:{type:String,required:true},
    stack:{type:String,required:true},
    code:{type:String,required:true},
    url:{type:String,required:true},
    userid:{type:String,required:true},
    organizationid:{type:String,required:true},
    timeerror:{type:String,required:true},
})

module.exports = mongoose.model('Error',ErrorSchema)