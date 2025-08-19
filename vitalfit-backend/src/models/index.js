'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'production';
console.log('Selected environment:', env);
const config = require(__dirname + '/../config/config.js')[env];
console.log('Selected config:', {
  host: config.host,
  database: config.database,
  username: config.username,
  dialectOptions: config.dialectOptions,
});
const db = {};

let sequelize;
if (config && config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else if (config && config.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.storage,
    logging: config.logging,
  });
} else if (config) {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    timezone: config.timezone,
    dialectOptions: config.dialectOptions,
    pool: config.pool,
  });
} else {
  console.error('Database configuration not found for environment:', env);
  process.exit(1);
}

fs.readdirSync(__dirname)
  .filter(file => {
    const fullPath = path.join(__dirname, file);
    return (
      file !== basename &&
      file.endsWith('.js') &&
      fs.statSync(fullPath).isFile() &&
      !file.endsWith('.test.js')
    );
  })
  .forEach(file => {
    const fullPath = path.join(__dirname, file);
    const modelFactory = require(fullPath);

    if (typeof modelFactory === 'function') {
      const model = modelFactory(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } else {
      console.warn(`❗ ${file} is not a function. Skipping.`);
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
