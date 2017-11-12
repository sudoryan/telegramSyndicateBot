const { database } = require('../db');
const { encrypt, decrypt } = require('../helpers/encrypt');

async function doesFundExist(username) {
  const data = await database.ref(`admins/${username}/fund`).once('value');
  return (data.val() === null) ? false : true;
}

async function setFundAddress(username, address) {
  return database.ref(`admins/${username}/fund/address`).set(address);
}

async function setFundPrivateKey(username, privateKey) {
  let encryptedKey = encrypt(privateKey);
  return database.ref(`admins/${username}/fund/privateKey`).set(encryptedKey);
}

async function getFundAddress(username) {
  const data = await database.ref(`admins/${username}/fund/address`).once('value');
  return data.val();
}

async function getFundPrivateKey(username) {
  const data = await database.ref(`admins/${username}/fund/privateKey`).once('value');
  let decryptedKey = decrypt(data.val());
  return decryptedKey;
}

module.exports = {
  doesFundExist, 
  getFundAddress, 
  getFundPrivateKey,
  setFundAddress,
  setFundPrivateKey,
};
