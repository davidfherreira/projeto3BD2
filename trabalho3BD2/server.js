const express = require('express');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/routes');
const Evento = require('./models/evento');
const session = require('express-session');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver')

require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost/eventosDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado ao MongoDB');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });

// Configurar o Express para receber dados do formulário
app.use(express.urlencoded({ extended: true }));

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "asdfasdfasdfasdf",
  cookie:{
    maxAge: 30000000
  }
}
))

// Configurar template engine EJS
app.set('view engine', 'ejs');

app.get('/',(req,res) => {
  if (req.session.usuario != undefined) {
      res.render('index',{
          nomeUsuario: req.session.usuario.nome,
          emailUsuario: req.session.usuario.email,
          idUsuario: req.session.usuario.id
          
      })

}
  else{
      res.render("index",{
          nomeUsuario: undefined
      })
  }
  });

// Middleware para rotas relacionadas a eventos
app.use('/', eventRoutes);

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
