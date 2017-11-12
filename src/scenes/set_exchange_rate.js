const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { isAccountLinked } = require('../database/linkAccount');
const { doesFundExist, getFundAddress } = require('../database/fund');
const { getAllICO } = require('../database/deal');
const setDealExchangeRate = require('../contract/setDealExchangeRate');
const getFundBalance = require('../helpers/getFundBalance');

const setExchangeRateScene = new WizardScene('set-exchange-rate',
  async (ctx) => {
    let ICOList = [];
    let data = await getAllICO(ctx.from.username);
    let fundBalance = await getFundBalance(ctx.from.username);
    if (data == null) {
      await ctx.reply('You currently have no Deals.')
      await ctx.flow.enter('manage-deals');
    } else if (fundBalance < 0.1) {
      await ctx.reply('Insufficient funds. Please make a deposit to cover gas');
      ctx.flow.leave();
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
  async (ctx) => {
    if (ctx.callbackQuery) {
      ctx.flow.state.icoName = ctx.callbackQuery.data;
      await ctx.reply('Enter exchange rate in eth for ' + ctx.flow.state.icoName, Markup.inlineKeyboard([
        Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra());
      await ctx.flow.wizard.next();   
    }
  }, 
  async (ctx) => {
    if (ctx.message) {
      if (isNaN(ctx.message.text)) {
        await ctx.reply('Please enter a valid number');
        await ctx.flow.wizard.selectStep(0);
        await ctx.flow.reenter('set-exchange-rate');
      } else {
        await ctx.reply('Setting exchange rate...');
        let receipt = await setDealExchangeRate(ctx.from.username, ctx.flow.state.icoName, ctx.message.text);
        await ctx.reply(`Exchange rate of ${ctx.flow.state.icoName} set to ${ctx.message.text}`);
        await ctx.flow.leave();        
      }
    }
  }
);

module.exports = setExchangeRateScene;