/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const express = require('express');
const csv = require('csvtojson');
const path = require('path');
const Battle = require('../models/battle');

const battleroute = express.Router();

(async () => {
  try {
    // Save battles.csv to mongodb
    const jsonarray = await csv().fromFile(path.join(__dirname, '../battles.csv'));
    await Battle.deleteMany({});
    await Battle.insertMany(jsonarray);
    logger.info('Battle: Csv Data inserted into mongo successfully');
  } catch (error) {
    logger.error('Battle: Error while inserting battle.csv to mongo');
  }
})();

// Get All Blogs for homepage
battleroute.get('/', async (req, res) => {
  try {
    logger.info('Battle/: Get all blogs for home page');
    const blogs = await Battle.find({});
    res.status(200).send(blogs);
  } catch (error) {
    logger.error(`Battle/: Error while finding Battle: ${error.stack ? error.stack : error}`);
    res.status(400).send({ message: `Error while finding Battle: ${error}` });
  }
});

// Get List of  Battle locations
battleroute.get('/list/:entity', async (req, res) => {
  try {
    if (!req.params.entity) throw new Error('No entity specified');

    // req.params.entity = req.params.entity.toUpperCase();
    logger.info(`Battle/: Get list for ${req.params.entity}`);
    const entity = await Battle.find({}, { [req.params.entity]: 1 });
    res.status(200).send([...new Set(entity.map(ent => ent[req.params.entity]).filter(a => a.length > 0))]);
  } catch (error) {
    logger.error(`Battle/: Error while finding Battle ${req.params.id}: ${error.stack ? error.stack : error}`);
    res.status(400).send({
      message: `Error while finding Battle ${req.params.id}: ${error}`,
    });
  }
});

// Get total number of battles occurred.
battleroute.get('/count', async (req, res) => {
  try {
    logger.info('Battle/: Get Battles count');
    const Battles = await Battle.find({});
    res.status(200).send({ data: Battles.length });
  } catch (error) {
    logger.error(`Battle/: Error while finding Battle count : ${error.stack ? error.stack : error}`);
    res.status(400).send({ message: `Error while finding Battle count : ${error}` });
  }
});

// Get list of battles with search filter
battleroute.get('/search', async (req, res) => {
  try {
    logger.info(`Battle/: Search Battle for ${JSON.stringify(req.query)}`);
    const blogs = await Battle.find(req.query, { _id: 0 });
    if (blogs.length === 0) {
      logger.warn(`Battle/search: No data found for search: ${JSON.stringify(req.query)}`);
      res.status(204).send({
        message: `No data found for search: ${JSON.stringify(req.query)}`,
      });
    } else {
      res.status(200).send(JSON.stringify(blogs));
    }
  } catch (error) {
    logger.error(`Battle/: Error while searching battle for: ${JSON.stringify(req.query)}: ${error.stack ? error.stack : error}`);
    res.status(400).send({
      message: `Error while searching battle for: ${JSON.stringify(req.query)}: ${error}`,
    });
  }
});

module.exports = battleroute;
