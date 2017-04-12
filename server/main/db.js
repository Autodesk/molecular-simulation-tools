// 'use strict';
/**
 * Create the postgres database connection
 */
const assert = require('assert');
const Sequelize = require('sequelize');
const retry = require('bluebird-retry');
const log = require('../utils/log');

// defaults look to a running postgress container named 'db'
var config = {
  host: 'db',
  port: '5432',
  user: 'mstdbuser',
  password: 'dataStoreMST',
  database: 'mstdbv1'
};
// Connection string format:
// dbuser:mysecretpassword@db:5432/mst'

if (process.env.PGHOST != null) {
  config.host = process.env.PGHOST;
}
if (process.env.PGPORT != null) {
  config.port = parseInt(process.env.PGPORT, 10);
}
if (process.env.PGUSER != null) {
  config.user = process.env.PGUSER;
}
if (process.env.PGPASSWORD != null) {
  config.password = process.env.PGPASSWORD;
}
if (process.env.PGDATABASE != null) {
  config.database = process.env.PGDATABASE;
}

// const db = new Sequelize(process.env.DB_CONNECTION_URI);
const db = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'postgres',

  pool: { 
    max: 5,
    min: 0,
    idle: 10000
  }

});

module.exports = retry(
    () => db.authenticate(),
    { max_tries: 50, interval: 1000, max_interval: 10000 }
  )
  .then(() => {
    log.info('Connected to the database');
    return db;
  });
