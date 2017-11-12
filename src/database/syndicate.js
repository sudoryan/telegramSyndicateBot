const { database } = require('../db');

async function getSyndicateCount(user) {
  const syndicates = await database.ref(`users/${user}/syndicates`).once('value');
  const syndicateCount = await syndicates.numChildren();
  return (syndicateCount === null) ? 0 : syndicateCount;
}

async function getSyndicates(user) {
  return database.ref(`users/${user}/syndicates`).once('value');
}

module.exports = {
  getSyndicateCount, 
  getSyndicates,
};
