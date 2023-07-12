const Usuario = require("../models/Usuario");
const bcrypt = require('bcrypt');
const Evento = require('../models/evento')
const createSession = require('../neo4jdb');


cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  const useremail = await Usuario.findOne({email});

  if (useremail == undefined) {

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha,salt)

    const usuario = new Usuario({
      nome,
      email,
      senha: hash
    });

    usuario.save()
      .then(() => {
        console.log('Usuario salvo');
        res.redirect('/login');
      
        const createNodeQuery = 'CREATE (:Usuario {id: $id, nome: $nome})';
        const params = { id: usuario._id.toString(), nome: usuario.nome };

        const session = createSession(); // Obter uma nova sessão

        session.run(createNodeQuery, params)
          .then(() => {
            console.log('Nó criado no Neo4j');
            session.close();
          })
          .catch(error => {
            console.error('Erro ao criar nó no Neo4j:', error);
            session.close();
          });
      })
      .catch(error => {
        console.error('Erro ao salvar usuário:', error);
        res.redirect('/cadastrarusuario');
      });
  }
}

fazerlogin = (req,res) => {
  let email = req.body.email;
  let senha = req.body.senha;

  Usuario.findOne({email}).then(usuario =>{
    if(usuario != undefined){
      let correto = bcrypt.compareSync(senha,usuario.senha)
      if (correto){
        req.session.usuario = {
          nome: usuario.nome,
          id: usuario._id,
          email: usuario.email
        }

        const session = createSession(); // Obter uma nova sessão

        // Realizar as operações com o Neo4j aqui

        res.redirect("/");
      } 
      else {
        res.redirect('/login')
      }
    }
    else{
      res.redirect('/cadastrarusuario');
    }
  });
}

fazerlogout = (req,res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
    } else {
      const session = createSession(); // Obter uma nova sessão

      // Realizar as operações com o Neo4j aqui

      res.redirect('/');
    }
  });
}
