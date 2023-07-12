const express = require('express');
const Evento = require('../models/evento');
const usuarioController = require('../controllers/usuarioController');
const router = express.Router();
const autenticacao = require('../middlewares/autenticacao');
const createSession = require("../neo4jdb");
const Usuario = require('../models/Usuario');

router.get('/eventos', autenticacao, (req, res) => {
  Evento.find()
    .then(eventos => {
      res.json(eventos);
    })
    .catch(error => {
      console.error('Erro ao buscar eventos:', error);
      res.status(500).json({ error: 'Erro ao buscar eventos' });
    });
});

router.get('/usuario', (req, res) => {
  const usuario = req.session.usuario;
  if (usuario != undefined) {
    Usuario.findById(usuario.id)
      .then(usuario => {
        res.json(usuario);
      })
      .catch(error => {
        console.error('Erro ao buscar o usuario', error);
        res.status(500).json({ error: 'Erro ao buscar o usuario' });
      });
  }
});

router.get('/eventossalvos', autenticacao, (req, res) => {
  Evento.find()
    .then(eventos => {
      res.render('eventossalvos', { eventos });
    })
    .catch(error => {
      console.error('Erro ao buscar eventos:', error);
      res.redirect('/');
    });
});

router.post('/eventossalvos/buscar', autenticacao, (req, res) => {
  const { busca } = req.body;
  Evento.find({ $text: { $search: busca } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .then(eventos => {
      res.render('eventossalvos', { eventos });
    })
    .catch(error => {
      console.error('Erro ao buscar eventos:', error);
      res.redirect('/eventossalvos');
    });
});

router.post('/salvarevento', autenticacao, (req, res) => {
  const { titulo, descricao, dataInicio, dataFim, latitude, longitude } = req.body;

  const evento = new Evento({
    titulo,
    descricao,
    dataInicio,
    dataFim,
    localizacao: {
      latitude,
      longitude
    }
  });

  evento.save()
  .then(() => {
    console.log('Evento salvo:', evento);

    const createNodeQuery = 'CREATE (:Evento {id: $id, titulo: $titulo})';
    const params = { id: evento._id.toString(), titulo: evento.titulo };

    const session = createSession(); // Obter uma nova sessão

    session.run(createNodeQuery, params)
      .then(() => {
        console.log('Nó criado no Neo4j');
        session.close(); // Fechar a sessão após a conclusão da consulta
        res.redirect('/eventossalvos');
      })
      .catch(error => {
        console.error('Erro ao criar nó no Neo4j:', error);
        session.close(); // Fechar a sessão em caso de erro
        res.redirect('/eventossalvos');
      });
  })
  .catch(error => {
    console.error('Erro ao salvar evento:', error);
    res.redirect('/');
  });


});


router.post('/excluirevento/:id', autenticacao, (req, res) => {
  const { id } = req.params;

  Evento.findByIdAndDelete(id)
    .then(() => {
      console.log('Evento excluído:', id);
      res.redirect('/eventossalvos');
    })
    .catch(error => {
      console.error('Erro ao excluir evento:', error);
      res.redirect('/eventossalvos');
    });
});

router.get('/editarevento/:id', autenticacao, (req, res) => {
  const { id } = req.params;
  Evento.findById(id)
    .then(evento => {
      res.render('editarevento', { evento });
    })
    .catch(error => {
      console.error('Erro ao buscar evento:', error);
      res.redirect('/eventossalvos');
    });
});

router.post('/atualizarevento/:id', autenticacao, (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, dataInicio, dataFim, latitude, longitude } = req.body;

  Evento.findByIdAndUpdate(
    id,
    {
      titulo,
      descricao,
      dataInicio,
      dataFim,
      localizacao: {
        latitude,
        longitude
      }
    },
    { new: true }
  )
    .then(() => {
      res.redirect('/eventossalvos');
    })
    .catch(error => {
      console.error('Erro ao atualizar evento:', error);
      res.redirect('/eventossalvos');
    });
});

router.get('/cadastrarusuario', (req, res) => {
  res.render('cadastrarusuario');
});
router.post('/cadastrarusuario', cadastrarUsuario);


router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', fazerlogin);


router.get('/logout', fazerlogout);

// Rota para curtir um evento
router.post('/curtir', autenticacao, async (req, res) => {
  const { eventoId } = req.body;
  const usuarioId = req.session.usuario ? req.session.usuario.id : null;

  const session = createSession();

  session
    .run(
      `
      MATCH (u:Usuario), (e:Evento)
      WHERE u.id = $usuarioId AND e.id = $eventoId
      CREATE (u)-[:CURTIU]->(e)
      RETURN e
      `,
      { usuarioId, eventoId }
    )
    .then(result => {
      const evento = result.records[0].get('e').properties;
      console.log(`Relacionamento CURTIU criado entre o usuário ${usuarioId} e o evento ${eventoId}`);
      session.close();
      res.json({ message: 'Evento curtido com sucesso!', evento });
    })
    .catch(error => {
      console.error('Erro ao criar o relacionamento CURTIU:', error);
      session.close();
      res.status(500).json({ error: 'Erro ao curtir o evento' });
    });
});


// Rota para recomendar eventos
router.post('/recomendar', async (req, res) => {
  const usuarioId = req.session.usuario ? req.session.usuario.id : null;
  const { eventoId } = req.body;

  const session = createSession();

  session
    .run(
      `
      MATCH (e1:Evento)<-[:CURTIU]-(u:Usuario)-[r:CURTIU]->(e2:Evento)
      WHERE e1.id = $eventoId AND u.id = $usuarioId
      RETURN e2, count(e2) as quantidade ORDER BY quantidade DESC
      `,
      { eventoId, usuarioId }
    )
    .then(result => {
      const eventosRecomendados = result.records.map(record => record.get('e2').properties);
      session.close();
      res.json(eventosRecomendados);
    })
    .catch(error => {
      console.error('Erro ao buscar recomendações de eventos:', error);
      session.close();
      res.status(500).json({ error: 'Erro ao buscar recomendações de eventos' });
    });
});


router.post('/verificar-curtida', autenticacao, async (req, res) => {
  const { eventoId } = req.body;
  const usuarioId = req.session.usuario ? req.session.usuario.id : null;

  const session = createSession();

  session
    .run(
      `
      MATCH (u:Usuario)-[:CURTIU]->(e:Evento)
      WHERE u.id = $usuarioId AND e.id = $eventoId
      RETURN count(e) > 0 as curtido
      `,
      { usuarioId, eventoId }
    )
    .then(result => {
      const curtido = result.records[0].get('curtido');
      session.close();
      res.json({ curtido });
    })
    .catch(error => {
      console.error('Erro ao verificar curtida:', error);
      session.close();
      res.status(500).json({ error: 'Erro ao verificar curtida' });
    });
});



module.exports = router;
