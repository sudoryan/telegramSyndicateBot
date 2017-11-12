const { database } = require('../db');

async function isAccountLinked(username) {
  const data = await database.ref(`users/${username}/address`).once('value');
  return (data.val() === null) ? false : true;
}

async function linkAddressToAccount(username, eth_address) {
  await database.ref(`users/${username}/address`).set(eth_address);
}

async function getAccountAddress(username) {
  const data = await database.ref(`users/${username}/address`).once('value');
  return (data.val() === null) ? false : data.val();
}

module.exports = {
  isAccountLinked,
  linkAddressToAccount,
  getAccountAddress
};
