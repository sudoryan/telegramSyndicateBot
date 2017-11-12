module.exports = async (ctx, next) => {
  let chat = await ctx.getChat();
  if (chat.type !== 'private') {
    ctx.reply('Please use this bot in a private chat');
  } else {
    await next()
  }
}
