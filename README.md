# projeto3BD2

Trabalho usando a API do Google Maps, em conjunto com ExpressJS, Fetch API, Ejs, Bootstrap, mongoDB e o Neo4j. A ideia e utilizar a persistência poliglota.

Inicialização

Para inicializar a API vocês deverão:

Clonar o repositório
Criar na pasta raiz um arquivo .env

Exemplo do arquivo .env (trocar o valor da chave da API do Google Maps e a senha da conexão com o Neo4j pela sua chave válida e senha válida):

GOOGLE_MAPS_API_KEY='SUA_CHAVE_API'
SenhaNeo4j='SuasenhaNeo4j '

Obs: O USO DO MONGODB É NO DOCKER, ENTÃO VERIFIQUE SE O SEU CONTEINER ESTA RODANDO E ATENDENDO OS CRITÉRIOS DE CONEXÃO. APÓS ISSO, BASTA EXECUTAR OS SEGUINTES COMANDOS ABAIXO:

npm i
node server.js
