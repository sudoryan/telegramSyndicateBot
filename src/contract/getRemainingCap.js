const { web3 } = require('../w3');
var Tx = require('ethereumjs-tx');
var abi = require('../../contracts/abi/presale.abi.json');
const { getICOByName } = require('../database/deal');

async function getRemainingCap(username, icoName) {
  let icoData = await getICOByName(username, icoName);
  let contract = new web3.eth.Contract(abi, icoData['contractAddress']);
  let totalInvested = await contract.methods.totalInvestedInWei().call();
  let cap = await contract.methods.cap().call();
  cap = new web3.utils.BN(cap); 
  totalInvested = new web3.utils.BN(totalInvested);
  remaining = cap.sub(totalInvested);
  remaining = remaining.toString(10);
  console.log(remaining);
  let ether = web3.utils.fromWei(remaining, 'ether');
  console.log(ether);
  return ether;
}

module.exports = getRemainingCap;
