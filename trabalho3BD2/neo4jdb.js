const neo4j = require('neo4j-driver');
const env = require('dotenv');
require('dotenv').config();

const driver = neo4j.driver(
  'neo4j+s://2215d3a3.databases.neo4j.io',
  neo4j.auth.basic('neo4j',process.env.SenhaNeo4j)
);

const createSession = () => {
  return driver.session();
};

module.exports = createSession;
