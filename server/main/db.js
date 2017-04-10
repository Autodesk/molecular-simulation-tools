/**
 * Create the postgres database connection
 */
const assert = require('assert');
const Sequelize = require('sequelize');
const retry = require('bluebird-retry');
const log = require('../utils/log');

assert(process.env.DB_CONNECTION_URI, 'Missing env var DB_CONNECTION_URI');
const db = new Sequelize(process.env.DB_CONNECTION_URI);

module.exports = retry(
    () => db.authenticate(),
    { max_tries: 50, interval: 1000, max_interval: 10000 }
  )
  .then(() => {
    log.info('Connected to the database');
    return db;
  });
