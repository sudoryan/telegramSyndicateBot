const ethUtil = require('ethereumjs-util');

function getNakedAddress(address) {
  return address.toLowerCase().replace('0x', '');
}

/**
*   Courtesy of MyEtherWallet
**/

function verifySignature(json) {
  try {
    const address = getNakedAddress(json.address);
    var sig = new Buffer(getNakedAddress(json.sig), 'hex');
    if (sig.length != 65) {
      return false;
    } else {
      sig[64] = sig[64] == 0 || sig[64] == 1 ? sig[64] + 27 : sig[64];
      var hash = json.version=='2' ? 
        ethUtil.hashPersonalMessage(ethUtil.toBuffer(json.msg)) : 
        ethUtil.sha3(json.msg);
      var pubKey = ethUtil.ecrecover(hash, sig[64], sig.slice(0, 32), sig.slice(32, 64));
      if (getNakedAddress(json.address) != ethUtil.pubToAddress(pubKey).toString('hex')) {
        return false;
      } else {
        return true;
      }
    }    
  } catch (e) {
    return false;
  }
}

module.exports = {
  verifySignature, 
};