const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { isAccountLinked } = require('../database/linkAccount');
const { doesFundExist, getFundAddress } = require('../database/fund');
const createFund = require('../helpers/createFund');
const getFundBalance = require('../helpers/getFundBalance');

const addFundsScene = new WizardScene('add-funds',
  async (ctx) => {
    let isLinked = await isAccountLinked(ctx.from.username);
    if (!isLinked) {
      await ctx.reply('Please link your account before adding funds');
      ctx.flow.leave();
    } else {
      let hasFund = await doesFundExist(ctx.from.username);
      if (!hasFund) {
        await createFund(ctx.from.username);
      }
      const fundAddress = await getFundAddress(ctx.from.username);
      const fundBalance = await getFundBalance(ctx.from.username);
      await ctx.reply(`Your current balance is ${fundBalance} eth\n\n` + 
        `Please send ether to:\n${fundAddress}`);
      ctx.flow.leave();
    }
  } 
);

module.exports = addFundsScene;