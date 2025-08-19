'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else if (config.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.storage,
    logging: config.logging,
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
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
