// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const reporteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  Dimensiones: [{
    Dimension: { type: String }
  }],
  usuarioCreador: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  idOrganizacion: { type: String, required: true }
});

// Creating a Model from that Schema
module.exports = mongoose.model('Reporte', reporteSchema)
