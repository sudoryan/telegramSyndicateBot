const { database } = require('../db');

async function getMembers(admin) {
  let members = await database.ref(`admins/${admin}/members`).once('value');
  return members.val();
}

function getMemberByName(admin, user) {
 return database.ref(`admins/${admin}/members/${user}`).once('value');
}

async function getMemberCount(admin) {
  const members = await database.ref(`admins/${admin}/members`).once('value');
  const memberCount = await members.numChildren();
  return memberCount === null ? 0 : memberCount;
}

async function addMember(admin, user) {
  await database.ref(`users/${user}/syndicates/${admin}`).set(true);
  await database.ref(`admins/${admin}/members/${user}`).set(true);
}

async function removeMember(admin, user) {
  await database.ref(`users/${user}/syndicates/${admin}`).remove();
  await database.ref(`admins/${admin}/members/${user}`).remove();
}

module.exports = {
  addMember, 
  removeMember,  
  getMembers,
  getMemberByName, 
  getMemberCount,
};
