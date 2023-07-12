const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    allowNull: false
  },
  email: {
    type: String,
    required: true,
    allowNull: false
  },
  senha: {
    type: String,
    required: true,
    allowNull: false
  },
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;