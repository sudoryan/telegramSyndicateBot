const { web3 } = require('../w3');
const { setFundAddress, setFundPrivateKey } = require('../database/fund');

function getNakedAddress(address) {
  return address.toLowerCase().replace('0x', '');
}

module.exports = async (username) => {
  const account = await web3.eth.accounts.create();
  await setFundAddress(username, account.address);
  await setFundPrivateKey(username, getNakedAddress(account.privateKey));
}
