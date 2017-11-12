const { web3 } = require('../w3');
var Tx = require('ethereumjs-tx');
var abi = require('../../contracts/abi/presale.abi.json');
const { getFundAddress, getFundPrivateKey } = require('../database/fund');
const { getICOByName } = require('../database/deal');

async function setDealExchangeRate(username, icoName, rate) {
  let fundAddress = await getFundAddress(username);
  let fundPrivateKey = await getFundPrivateKey(username);
  let icoData = await getICOByName(username, icoName);
  var privateKey = new Buffer(fundPrivateKey, 'hex');
  
  let contract = new web3.eth.Contract(abi, icoData['contractAddress']);
  let instance = await contract.methods.setExchangeRate(rate);
  let data = instance.encodeABI();
  var txcount = await web3.eth.getTransactionCount(fundAddress);
  var rawTx = {
      to: icoData['contractAddress'],
      nonce: web3.utils.toHex(txcount),
      gasPrice: web3.utils.toHex(1000099000),
      gasLimit: 123123 * 4,
      data: data
    }
  var tx = new Tx(rawTx);
  tx.sign(privateKey);
  var serializedTx = tx.serialize();
  receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  return receipt;
}

module.exports = setDealExchangeRate;
