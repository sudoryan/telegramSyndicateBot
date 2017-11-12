const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { 
  addMember, 
  removeMember,  
  getMembers, 
  getMemberCount,
  getMemberByName 
} = require('../database/member');
const { getAccountAddress } = require('../database/linkAccount');
const getFundBalance = require('../helpers/getFundBalance');
const { getWhitelistAddress, setWhitelistAddress } = require('../database/whitelist');
const deployWhitelist = require('../contract/deployWhitelist');
const addMemberToWhitelist = require('../contract/addMember');
const removeMemberFromWhitelist = require('../contract/removeMember');

async function viewAllMembers(members) {
  let output = '';
  for (let member in members) {
    let row = `${member}\n`;
    // let isLinked = await getAccountAddress(member);
    // row += isLinked ? ' / yes\n' : ' / no\n';
    output += row;
  };
  return (output == '') ? 'Empty' : output;
}

const manageMembersScene = new WizardScene('manage-members',
  // Step 0
  async (ctx) => {
    let fundBalance = await getFundBalance(ctx.from.username);
    if (fundBalance < 0.1) {
      await ctx.reply('Insufficient funds. Please make a deposit to cover gas');
      ctx.flow.leave();
    } else {
      let whitelistAddress = await getWhitelistAddress(ctx.from.username);
      if (!whitelistAddress) {
        await ctx.reply('Creating Whitelist...');
        whitelistAddress = await deployWhitelist(ctx.from.username);
        await setWhitelistAddress(ctx.from.username, whitelistAddress);
        await ctx.reply('Done');
      }
      ctx.flow.state.whitelistAddress = whitelistAddress;
      const memberCount = await getMemberCount(ctx.from.username);
      let msg = `Currently have ${memberCount} members in your syndicate\n`;
      await ctx.reply(`${msg}Please choose your action: `, Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton('Add', 'Add'),
          m.callbackButton('Remove', 'Remove'),
          m.callbackButton('View All', 'View All'),
          m.callbackButton('Cancel', 'CANCEL')
        ])
      ));
      await ctx.flow.wizard.next();      
    }        
  },
  // Step 1
  async (ctx) => {
    switch(ctx.callbackQuery.data) {
      case 'Add':
        ctx.flow.state.action = 'Add';
        ctx.reply(`Please provide telegram handle to add without @. Example: rstormsf `, Markup.inlineKeyboard([
          Markup.callbackButton('Cancel', 'CANCEL'),
        ]).extra());
        ctx.flow.wizard.next()
        break;
      case 'Remove':
        ctx.flow.state.action = 'Remove';
        ctx.reply(`Please provide telegram handle to remove without @. Example: rstormsf `, Markup.inlineKeyboard([
          Markup.callbackButton('Cancel', 'CANCEL'),
        ]).extra());
        ctx.flow.wizard.next()
        break;
      case 'View All':
        let members = await getMembers(ctx.from.username);
        let output = await viewAllMembers(members);
        await ctx.reply('Members\n' + output);
        ctx.flow.wizard.selectStep(0);
        await ctx.flow.reenter('manage-members');
        break;
      default:
        ctx.reply(`Incorrect input. Please try again `);
        break;
    }
  },
  async (ctx) => {
    if (ctx.message) {
      let user = ctx.message.text;
      let member = await getMemberByName(ctx.from.username, user);
      let isMember = (member.val() === null) ? false : true;
      if (ctx.flow.state.action == 'Add') {
        if (isMember) {
          ctx.reply(`${user} is already a member!`);
        } else {
          let userAddress = await getAccountAddress(user);
          if (!userAddress) {
            await ctx.reply(`${user} needs to link their account to be a member`)
          } else {
            await ctx.reply(`Adding ${user} to Whitelist...`)
            await addMemberToWhitelist(ctx.from.username, userAddress);
            await addMember(ctx.from.username, user);
            await ctx.reply(`${user} added!`);
          }
        }
      } else if (ctx.flow.state.action == 'Remove') {
        if (!isMember) {
          ctx.reply(`${user} is not a member.`);          
        } else {
          let userAddress = await getAccountAddress(user);
          await ctx.reply(`Removing ${user} from Whitelist...`)
          await removeMemberFromWhitelist(ctx.from.username, userAddress);
          await removeMember(ctx.from.username, user);
          await ctx.reply(`${user} removed!`);      
        }
      }
      ctx.flow.wizard.selectStep(0);
      await ctx.flow.reenter('manage-members');
    }
  }
)
module.exports = manageMembersScene;
