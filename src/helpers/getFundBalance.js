const { web3 } = require('../w3');
const { getFundAddress } = require('../database/fund');

module.exports = async (username) => {
  let fundAddress = await getFundAddress(username);
  if (fundAddress == null) {
    return 0;
  }
  let balance = await web3.eth.getBalance(fundAddress);
  balance = web3.utils.fromWei(balance, 'ether')
  return balance;
}