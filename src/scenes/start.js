const { Scene } = require('telegraf-flow')
const { isAdmin } = require('../database/admin');
const { isAccountLinked } = require('../database/linkAccount');
const { Extra, Markup } = require('telegraf');

const startScene = new Scene('start');

startScene.enter(async (ctx) => {
  let isUserAdmin = await isAdmin(ctx.from.username);
  let isLinked = await isAccountLinked(ctx.from.username);
  ctx.reply('Hi there, please choose an option', Markup
    .keyboard([
      (isLinked) ? ['🔍 ICO Deals', '⭐️ My balances'] : ['🔗 Link Account'],
      // ['☸ Participate', '⭐️ My balances', '📢 Check Tx'],
      (isLinked && isUserAdmin) ? ['🤳 Manage Members', '💵 Add Funds', '📁 Manage Deals'] : []
    ])
    .oneTime()
    .resize()
    .extra()
    );
  ctx.flow.leave();
});

module.exports = startScene;
