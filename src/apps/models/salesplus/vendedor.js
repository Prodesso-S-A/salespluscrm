// Creating a Schema for uploaded files
const operacionclienteSchema = new mongoose.Schema({
    idUsuario:{type:String, required:true},
    idJefe:{type:String, required:true},
    segmento:{type:String, required:true},
    meta:{type:String, required:true},
    estado:{type:Boolean, default:true}
});