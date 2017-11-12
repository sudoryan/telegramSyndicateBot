const config = require('../config');
const admin = require('firebase-admin')

let private_key;
if (process.env.NODE_ENV === 'prod') {
  // zeit has trouble parsing private key,
  // need to manually parse.
  private_key = '-----BEGIN PRIVATE KEY-----\n';
  let key = process.env.private_key.split(' ').join('\n');
  private_key = private_key + key + '\n-----END PRIVATE KEY-----\n';
} else {
  private_key = process.env.private_key;
}

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: private_key,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url
  }),
  databaseURL: process.env.FIREBASE_URL
})

const database = admin.database()

module.exports = { database };
