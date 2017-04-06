/**
 * Create the postgres database connection
 */
const assert = require('assert');
const Sequelize = require('sequelize');
const log = require('../utils/log');

assert(process.env.DB_CONNECTION_URI, 'Missing env var DB_CONNECTION_URI');
const db = new Sequelize(process.env.DB_CONNECTION_URI);

module.exports = db.authenticate()
  .then(() => {
    log.info('Connected to the database');
    return db;
  });
