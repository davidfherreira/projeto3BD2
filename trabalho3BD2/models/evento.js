const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  dataInicio: {
    type: Date,
    required: true
  },
  dataFim: {
    type: Date,
    required: true
  },
  localizacao: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  }
});

eventoSchema.index({ titulo: 'text', descricao: 'text' }, { weights: { titulo: 2, descricao: 1 } });

const Evento = mongoose.model('Evento', eventoSchema);

module.exports = Evento;
