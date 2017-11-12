const { WizardScene, Scene} = require('telegraf-flow');
const { Extra, Markup } = require('telegraf');
const moment = require('moment');
const { getICOByName, addICO, setContractAddress } = require('../database/deal');
const { getWhitelistAddress, setWhitelistAddress } = require('../database/whitelist');
const fillWhitelist = require('../helpers/fillWhitelist');
const getFundBalance = require('../helpers/getFundBalance');
const deployWhitelist = require('../contract/deployWhitelist');
const deployDealContract = require('../contract/deployDealContract');
const initializeDealContract = require('../contract/initializeDealContract');
var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

const addICOScene = new WizardScene('add-ico',
  // STEP 0
  async (ctx) => {
    ctx.flow.state.startTime = null;
    ctx.flow.state.endTime = null;
    ctx.flow.state.icoName = null;
    let fundBalance = await getFundBalance(ctx.from.username);
    if (fundBalance < 0.1) {
      await ctx.reply('Insufficient funds, please make a deposit to add an ICO');
      ctx.flow.leave();
    } else {
      let whitelistAddress = await getWhitelistAddress(ctx.from.username);
      if (!whitelistAddress) {
        await ctx.reply('Creating Whitelist...');
        whitelistAddress = await deployWhitelist(ctx.from.username);
        await setWhitelistAddress(ctx.from.username, whitelistAddress);
        await ctx.reply('Done');
      }
      await ctx.replyWithMarkdown('Lets add an ICO, Please' +
        ' provide the name of the ICO:', Markup.inlineKeyboard([
          Markup.callbackButton('Cancel', 'CANCEL'),
        ]).extra());
      await ctx.flow.wizard.next()
    }
  },
  // STEP 1
  async (ctx) => {
    let icoName;
    let query;
    if (ctx.message && ctx.message.text.length === 1) {
      ctx.flow.wizard.selectStep(0);
      await ctx.flow.reenter('add-ico');
    }
    if (ctx.message) {
      let icoName;
      icoName = ctx.message.text;
      let query = await getICOByName(ctx.from.username, icoName);
      if (query) {
        await ctx.replyWithMarkdown(`*${icoName}* already added`)
        await ctx.flow.wizard.selectStep(0);
        await ctx.flow.reenter('add-ico');
      } else {
        ctx.flow.state.icoName = icoName;
        await ctx.reply('Please choose a currency in which the ICO will be' +
          ' contributed <b>ETH</b> or <i>BTC</i>', Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              m.callbackButton('ETH', 'ETH'),
              m.callbackButton('BTC', 'BTC'),
              m.callbackButton('Cancel', 'CANCEL'),
          ])));
        await ctx.flow.wizard.next();              
      }
    }
  },
  // STEP 2
  async (ctx) => {
    if (ctx.message && !ctx.flow.state.currency && ctx.message.text.length > 0) {
      ctx.flow.wizard.selectStep(1);
      await ctx.flow.reenter('add-ico');
    } else {
      if (!ctx.flow.state.currency && ctx.callbackQuery) {
        ctx.flow.state.currency = ctx.callbackQuery.data;
      }
      ctx.reply(`Enter Max Cap in ${ctx.flow.state.currency}`, Markup.inlineKeyboard([
        Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra());
      await ctx.flow.wizard.next()
    }
  },
  // STEP 3
  async (ctx) => {
    if (!ctx.message || !ctx.flow.state.maxCap &&
      !Number.isInteger(Number(ctx.message.text))
    ) {
      ctx.flow.wizard.selectStep(2);
      await ctx.flow.reenter('add-ico');
    } else {
      if (!ctx.flow.state.maxCap && ctx.message) {
        ctx.flow.state.maxCap = ctx.message.text;
      }
      // need validation
      ctx.reply(`Start Date and Time in following format month/day/year` + 
        ` hour:minute UTC time zone.\n Example: 12/31/2017 15:31`, Markup.inlineKeyboard([
        Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra());
      await ctx.flow.wizard.next()
    }
  },
  // STEP 4
  async (ctx) => {
    if (ctx.message && !ctx.flow.state.startTime) {
      let startTime = moment.utc(ctx.message.text, "MM-DD-YYYY HH:mm")
      if (startTime.toString() !== 'Invalid date'){
        ctx.flow.state.startTime = startTime.format();
      }
    }
    if (!ctx.flow.state.startTime) {
      ctx.flow.wizard.selectStep(3);
      await ctx.flow.reenter('add-ico');
    } else {
      // need validation
      await ctx.reply(`End Date and Time in the following format ` + 
        `month/day/year hour:minute UTC time zone.\n Example: 12/31/2017 15:31`, Markup.inlineKeyboard([
        Markup.callbackButton('Cancel', 'CANCEL'),
      ]).extra());
      await ctx.flow.wizard.next()
    }
  },
  // STEP 5
  async (ctx) => {
    if (!ctx.flow.state.endTime && ctx.message) {
      let endTime = moment.utc(ctx.message.text, "MM-DD-YYYY HH:mm")
      if (endTime.toString() !== 'Invalid date' && 
        endTime.isAfter(ctx.flow.state.startTime)
      ) {
        ctx.flow.state.endTime = endTime.format();
      }
    }
    if (!ctx.flow.state.endTime) {
      ctx.flow.wizard.selectStep(4);
      await ctx.flow.reenter('add-ico');
    } else {
      ctx.reply(`Please Confirm:
        Name: <b>${ctx.flow.state.icoName}</b>
        Max Cap: <b>${ctx.flow.state.maxCap} ${ctx.flow.state.currency}</b>
        Start: <b>${moment.utc(ctx.flow.state.startTime)
        .format("dddd, MMMM Do YYYY, h:mm:ss a")} GMT</b>
        End: <b>${moment.utc(ctx.flow.state.endTime)
        .format("dddd, MMMM Do YYYY, h:mm:ss a")} GMT</b>
        Currency: <b>${ctx.flow.state.currency}</b>`, 
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
          m.callbackButton('Yes', 'Yes'),
          m.callbackButton('No', 'No'),
        ]))
      );
      await ctx.flow.wizard.next();
    }
  },
  // Step 6
  async (ctx) => {
      if (ctx.callbackQuery && ctx.callbackQuery.data === 'Yes') {
        const { icoName, currency, maxCap, startTime, endTime } = ctx.flow.state;
        await addICO(
          ctx.from.username, 
          icoName, 
          currency, 
          maxCap, 
          startTime, 
          endTime
        );
        await ctx.reply('Deploying Contract...')
        const contractAddress = await deployDealContract(ctx.from.username);
        await setContractAddress(ctx.from.username, icoName, contractAddress);
        let receipt = await initializeDealContract(ctx.from.username, icoName);
        console.log(receipt);
        await ctx.replyWithMarkdown(`Your contract has been deployed at\n` + 
          `[${contractAddress}](https://kovan.etherscan.io/address/${contractAddress})`)
        await ctx.flow.leave();
      } else {
        await ctx.reply(`Your ICO was not added`)
        await ctx.flow.leave();
      }
  },
)

module.exports = addICOScene;
