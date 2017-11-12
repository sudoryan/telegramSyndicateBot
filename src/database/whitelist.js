const { database } = require('../db');

async function getWhitelistAddress(username) {
  const data = await database.ref(`admins/${username}/whitelist`).once('value');
  return (data.val() === null) ? false : data.val();
}

async function setWhitelistAddress(username, address) { 
  return database.ref(`admins/${username}/whitelist`).set(address);
}

module.exports = {
  getWhitelistAddress, 
  setWhitelistAddress
};
