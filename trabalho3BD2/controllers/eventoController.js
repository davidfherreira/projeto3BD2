const Evento = require('../models/evento');

// Renderiza a página de eventos salvos
exports.eventosSalvos = async (req, res) => {
  try {
    const eventos = await Evento.find();
    res.render('eventossalvos', { eventos });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.redirect('/');
  }
};

// Renderiza a página de edição de um evento
exports.editarEvento = async (req, res) => {
  const { id } = req.params;
  try {
    const evento = await Evento.findById(id);
    res.render('editarevento', { evento });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.redirect('/eventossalvos');
  }
};

// Atualiza um evento no banco de dados
exports.atualizarEvento = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, dataInicio, dataFim, latitude, longitude } = req.body;
  try {
    const evento = await Evento.findByIdAndUpdate(
      id,
      {
        titulo,
        descricao,
        dataInicio,
        dataFim,
        latitude,
        longitude
      },
      { new: true }
    );
    res.redirect('/eventossalvos');
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.redirect('/eventossalvos');
  }
};

exports.buscarEventos = async (req, res) => {
  try {
    const { query } = req.query;
    const eventos = await Evento.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .exec();
    res.render('eventossalvos', { eventos, query });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).send('Erro ao buscar eventos.');
  }
};
