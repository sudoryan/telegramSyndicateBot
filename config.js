if (process.env.NODE_ENV === 'dev') {
  require("dotenv-json")();
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV, 
  MASTER_KEY: process.env.MASTER_KEY, 
  ICOBOT_TOKEN: process.env.ICOBOT_TOKEN,
  KOVAN_RPC_URL: process.env.KOVAN_RPC_URL,
  PORT: process.env.PORT,
  FIREBASE_URL: process.env.FIREBASE_URL,
  private_key: process.env.private_key,
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url
};
