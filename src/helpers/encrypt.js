const { MASTER_KEY } = require('../../config');
// load the build-in crypto functions
var crypto = require('crypto');

/**
 * Encrypts text by given key
 * @param String text to encrypt
 * @param Buffer masterkey
 * @returns String encrypted text, base64 encoded
 */

 /**
 * Generate Master_key 
 * var crypto = require('crypto');
 * var initializationVector = crypto.randomBytes(32);
 *
 */

function encrypt (text) {
  let masterkey = Buffer.from(MASTER_KEY, 'utf8');
  console.log(masterkey);
  try {
    // random initialization vector
    var iv = crypto.randomBytes(12);

    // random salt
    var salt = crypto.randomBytes(64);

    // derive key: 32 byte key length - in assumption the masterkey is a cryptographic and NOT a password there is no need for
    // a large number of iterations. It may can replaced by HKDF
    var key = crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');

    // AES 256 GCM Mode
    var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    // encrypt the given text
    var encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // extract the auth tag
    var tag = cipher.getAuthTag();

    // generate output
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');

  } catch(e) {
    console.log(e);
  }

  // error
  return null;
}

/**
* Decrypts text by given key
* @param String base64 encoded input data
* @param Buffer masterkey
* @returns String decrypted (original) text
*/
function decrypt (data) {
  let masterkey = Buffer.from(MASTER_KEY, 'utf8');
  try {
    // base64 decoding
    var bData = new Buffer(data, 'base64');

    // convert data to buffers
    var salt = bData.slice(0, 64);
    var iv = bData.slice(64, 76);
    var tag = bData.slice(76, 92);
    var text = bData.slice(92);

    // derive key using; 32 byte key length
    var key = crypto.pbkdf2Sync(masterkey, salt , 2145, 32, 'sha512');

    // AES 256 GCM Mode
    var decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    // encrypt the given text
    var decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');

    return decrypted;
  } catch(e) {
      console.log(e);
  }
  // error
  return null;
}

module.exports = {
  encrypt,
  decrypt
}