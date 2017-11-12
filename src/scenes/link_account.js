const TelegrafFlow = require('telegraf-flow')
const { WizardScene } = TelegrafFlow;
const { Extra, Markup } = require('telegraf')
const { linkAddressToAccount } = require('../database/linkAccount');
const { verifySignature } = require('../helpers/verifySignature');

const linkAccountScene = new WizardScene('link-account',
  async (ctx) => {
    await ctx.replyWithMarkdown(`To verify your address please provide a signature\n\n` + 
      `Sign '${ctx.from.id}' [Here](https://www.myetherwallet.com/signmsg.html)` + 
      `\n\nReply with the full signature\n\nEx:\n` + 
      '{\n' + 
        '   "address": "0x5dcae98c9fc12f91a0d...",\n' +
        '   "msg": "459770067",\n' +
        '   "sig": "0xbd3f74a260491436c1d37b1...",\n' +
        '   "version": "2"\n' +
      '}');
    await ctx.flow.wizard.next()
  },
  async (ctx) => {
    if (ctx.message) {
      var isValidSig = false;
      var isValidMsg = false;
      try {
        var json = await JSON.parse(ctx.message.text);
        isValidSig = await verifySignature(json);
        isValidMsg = json.msg == ctx.from.id ? true : false;
      } catch (e) {
        isValidSig = false;
        isValidMsg = false;
      }
      if (isValidSig && isValidMsg) {
        await linkAddressToAccount(ctx.from.username, json.address);
        await ctx.reply('Account succesfully linked!');
        await ctx.flow.enter('start');
      } else {
        await ctx.reply('Invalid signature');
        ctx.flow.wizard.selectStep(0);
        await ctx.flow.reenter('link-account');
      }
    }
  },
)

module.exports = linkAccountScene;
