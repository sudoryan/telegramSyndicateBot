const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { getAllICO } = require('../database/deal');
const { getMembers } = require('../database/member');
const { getAccountAddress } = require('../database/linkAccount');
const { getSyndicates } = require('../database/syndicate');
const getInvestorBalance = require('../contract/getInvestorBalance');
const getDealExchangeRate = require('../contract/getDealExchangeRate');

async function getBalances(syndicates, investorAddress) {
  let output = '';
  for (syndicate in syndicates.val()) {
    let icos = await getAllICO(syndicate);
    let row = await `${syndicate}:\n`;
    let tmp = '';
    for (ico in icos.val()) {
      let balance = await getInvestorBalance(syndicate, ico, investorAddress);
      let exchangeRate = await getDealExchangeRate(syndicate, ico);
      if (balance > 0) {
        if (exchangeRate > 0) {
          let tokens = (balance * exchangeRate).toPrecision(3);
          tmp += await `    ${ico}: ${balance} eth -> ${tokens} tokens\n`;
        } else {
          tmp += await `    ${ico}: ${balance} eth\n`;
        }
      }
    }
    if (tmp != '') {
      row += await tmp;
      output += await row;
    }
  };
  return output;
}

const myBalancesScene = new WizardScene('my-balances',
  async (ctx) => {
    let investorAddress = await getAccountAddress(ctx.from.username);
    let syndicates = await getSyndicates(ctx.from.username);
    let output = await getBalances(syndicates, investorAddress);
    await console.log(output);
    if (output != '') {
      await ctx.reply(output);
    } else {
      await ctx.reply('You have no investments\n');
    }
  }
);

module.exports = myBalancesScene;
