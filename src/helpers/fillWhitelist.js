const { getMembers } = require('../database/member');
const { getWhitelistAddress } = require('../database/whitelist');
const { getAccountAddress } = require('../database/linkAccount');
const addMemberListToWhitelist = require('../contract/addMemberList');
const addMemberToWhitelist = require('../contract/addMember');

async function fillWhitelist(manager) {
  let whitelistAddress = await getWhitelistAddress(manager);
  let members = await getMembers(manager);
  let memberList = [];
  for (let member in members) {
    let memberAddress = await getAccountAddress(member);
    if (memberAddress) {
      memberList.push(memberAddress);
    }
  }
  if (memberList.length > 1) {
    let receipt = await addMemberListToWhitelist(manager, memberList);  
  }
  if (memberList.length == 1) {
    let receipt = await addMemberToWhitelist(manager, memberList[0]);
  }
}

module.exports = fillWhitelist;
