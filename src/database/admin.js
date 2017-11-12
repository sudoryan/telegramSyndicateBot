const { database } = require('../db');

async function isAdmin(username) {
  const data = await database.ref(`admins/${username}`).once('value');
  return (data.val() === null) ? false : true;
}

module.exports = {
  isAdmin,
};
