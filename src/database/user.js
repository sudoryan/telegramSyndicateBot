const { database } = require('../db');

function login(username) {
  database.ref(`users/${username}/log`).set({ 
    lastTime: Date.now() 
  });
}

module.exports = {
  login,
};
