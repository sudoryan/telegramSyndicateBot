const { login } = require('../database/user');

module.exports = async (ctx, next) => {
  await login(ctx.from.username);
  await next();
};
