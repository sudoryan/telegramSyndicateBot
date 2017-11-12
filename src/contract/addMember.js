const { web3 } = require('../w3');
var Tx = require('ethereumjs-tx');
var abi = require('../../contracts/abi/whitelist.abi.json');
const { getFundAddress, getFundPrivateKey } = require('../database/fund');
const { getWhitelistAddress } = require('../database/whitelist');

async function addMemberToWhitelist(manager, member) {
  let fundAddress = await getFundAddress(manager);
  let fundPrivateKey = await getFundPrivateKey(manager);
  var privateKey = new Buffer(fundPrivateKey, 'hex');
  let whitelistAddress = await getWhitelistAddress(manager);
  let contract = new web3.eth.Contract(abi, whitelistAddress);
  let instance = await contract.methods.addInvestor(member);
  let data = instance.encodeABI();
  var txcount = await web3.eth.getTransactionCount(fundAddress);
  var rawTx = {
      to: whitelistAddress, 
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

module.exports = addMemberToWhitelist;
