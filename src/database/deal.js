const { database } = require('../db');

async function getAllICO(admin) {
  return database.ref(`admins/${admin}/ICO/`).once('value');
}

async function getICOByName(admin, ICOName) {
  let data = await database.ref(`admins/${admin}/ICO/${ICOName}`).once('value');
  return data.val();
}

function addICO(admin, ICOName, currency, maxCap, startTime, endTime) {
  return database.ref(`admins/${admin}/ICO/${ICOName}`).set({
    currency: currency,
    maxCap: maxCap,
    startTime: startTime,
    endTime: endTime,
  })
}

function setContractAddress(admin, ICOName, address) {
  return database.ref(`admins/${admin}/ICO/${ICOName}/contractAddress`).set(address);
}

module.exports = {
  addICO,
  getICOByName,
  setContractAddress, 
  getAllICO
};
