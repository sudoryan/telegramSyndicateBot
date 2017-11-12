const { web3 } = require('../w3');
var Tx = require('ethereumjs-tx');
var abi = require('../../contracts/abi/presale.abi.json');
const { getICOByName } = require('../database/deal');

async function getDealExchangeRate(username, icoName) {
  let icoData = await getICOByName(username, icoName);
  let contract = new web3.eth.Contract(abi, icoData['contractAddress']);
  let rate = await contract.methods.rate().call();
  let ether = await web3.utils.fromWei(rate, 'ether');
  return rate;
}

module.exports = getDealExchangeRate;
