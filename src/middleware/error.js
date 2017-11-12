module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    await ctx.reply('Error!');
    await ctx.reply(e);
  }
}