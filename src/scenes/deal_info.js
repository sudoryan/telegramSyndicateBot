const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { getSyndicateCount, getSyndicates } = require('../database/syndicate');
const { getAllICO, getICOByName } = require('../database/deal');
const getDealExchangeRate = require('../contract/getDealExchangeRate');
const getRemainingCap = require('../contract/getRemainingCap');
const { getMembers } = require('../database/member');
const { getAccountAddress } = require('../database/linkAccount');
const getInvestorBalance = require('../contract/getInvestorBalance');
var dateFormat = require('dateformat');

const dealInfoScene = new WizardScene('deal-info',
  async (ctx) => {
    let ICOList = [];
    let data = await getAllICO(ctx.from.username);
    if (data.val() == null) {
      await ctx.reply(`You currently have no active deals`);
      ctx.flow.wizard.selectStep(0);
      await ctx.flow.reenter('ico-deals');
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
      ctx.flow.wizard.next();
    }
  },
  async (ctx) => {
    if (ctx.callbackQuery) {
      let deal = ctx.callbackQuery.data;
      let dealInfo = await getICOByName(ctx.from.username, deal);
      let startTime = new Date(dealInfo.startTime);
      let endTime = new Date(dealInfo.endTime);
      startTime = dateFormat(startTime, "dddd, mmmm dS, yyyy, h:MM:ss TT");
      endTime = dateFormat(endTime, "dddd, mmmm dS, yyyy, h:MM:ss TT");
      let exchangeRate = await getDealExchangeRate(ctx.from.username, deal);
      let members = await getMembers(ctx.from.username);
      let balances = '';
      for (let member in members) {
        let accountAddress = await getAccountAddress(member);
        if (accountAddress) {
          let balance = await getInvestorBalance(ctx.from.username, deal, accountAddress);
          if (balance > 0) {
            balances += `${member}: ${balance} eth\n`;
          }
        }
      };
      exchangeRate = exchangeRate == 0 ? 'Not Set' : exchangeRate + ' eth';
      let remainingCap = await getRemainingCap(ctx.from.username, deal);
      await ctx.reply(`${deal}\n\n` + 
        `Address: ${dealInfo.contractAddress}\n` + 
        `Max Cap: ${dealInfo.maxCap} eth\n` + 
        `Remaining Cap: ${remainingCap} eth\n` + 
        `Exchange Rate: ${exchangeRate}\n` +
        `Start: ${startTime}\n` +
        `End: ${endTime}\n\n` + 
        'Balances:\n' + (balances == '' ? 'Empty' : balances)
      );
      ctx.flow.wizard.selectStep(0);
      await ctx.flow.reenter('deal-info');
    }
  }
)

module.exports = dealInfoScene;
