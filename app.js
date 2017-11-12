const fs = require('fs');
const { NODE_ENV, PORT, ICOBOT_TOKEN } = require('./config');
const bot = require('./src/bot');

bot.startWebhook(`/${ICOBOT_TOKEN}`, null, PORT);

console.log(`Server is listening to localhost:${PORT}`);

process.on('unhandledRejection', (e) => {
  console.log(e);
});

process.on('uncaughtException', (e) => {
  console.log(e);
});
