const { web3 } = require('../w3');
var Tx = require('ethereumjs-tx');
var abi = require('../../contracts/abi/whitelist.abi.json');
const { whitelist } = require('../../contracts/abi/bytecode');
const { getFundAddress, getFundPrivateKey } = require('../database/fund');

async function deployWhitelist(username) {
  const fundPrivateKey = await getFundPrivateKey(username);
  const fundAddress = await getFundAddress(username);
  let contract = new web3.eth.Contract(abi);
  let instance = await contract.deploy({data:  whitelist});
  let gasEstimate = await instance.estimateGas();
  var privateKey = new Buffer(fundPrivateKey, 'hex');
  var txcount = await web3.eth.getTransactionCount(fundAddress);
  var rawTx = {
    nonce: web3.utils.toHex(txcount),
    gasPrice: web3.utils.toHex(1000099000),
    gasLimit: gasEstimate * 4,
    data:  whitelist
  }
  var tx = new Tx(rawTx);
  tx.sign(privateKey);
  
  var serializedTx = tx.serialize();
  
  receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  return receipt['contractAddress'];
}

module.exports = deployWhitelist;
