const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { getAllICO } = require('../database/deal');
const { getMembers } = require('../database/member');
const { getAccountAddress } = require('../database/linkAccount');
const getInvestorBalance = require('../contract/getInvestorBalance');

const investorBalancesScene = new WizardScene('investor-balances',
  // Step 0
  async (ctx) => {
    let ICOList = [];
    let data = await getAllICO(ctx.from.username);
    if (data == null) {
      await ctx.reply('You currently have no Deals.')
      await ctx.flow.enter('manage-deals');
    } else {
      await data.forEach(function(deal) {
        let key = deal.key;
        ICOList.push(key);
      });
      ICOList.push('Last');
      ctx.reply(`Select a Deal`, Extra.HTML().markup((m) => {
        return m.inlineKeyboard(ICOList.map((name) => {
          if (name == 'Last') {
            return m.callbackButton('Cancel', 'CANCEL');
          } else {
            return m.callbackButton(name, name)
          }
        }));
      }));
    await ctx.flow.wizard.next()
    } 
  },
  // Step 1
  async (ctx) => {
    if (ctx.callbackQuery) {
      let icoName = ctx.callbackQuery.data;
      let members = await getMembers(ctx.from.username);
      let output = '';
      for (let member in members) {
        let accountAddress = await getAccountAddress(member);
        if (accountAddress) {
          let balance = await getInvestorBalance(ctx.from.username, icoName, accountAddress);
          console.log(balance);
          if (balance > 0) {
            output += `${member}: ${balance} eth\n`;
          }
        }
      };
      await ctx.reply('Balances:\n' + (output == '' ? 'Empty' : output));
      ctx.flow.wizard.selectStep(0);
      await ctx.flow.reenter('investor-balances');
    }
  }
)

module.exports = investorBalancesScene;
