const WhatsApp = require('./zap')
const Telegram = require('./telegram')

const enable_WhatsApp = process.env.enable_WhatsApp
const enable_Telegram = process.env.enable_Telegram

module.exports = function alerta(msg, cels, event, chatIds) {
  if(enable_WhatsApp == 'true'){
    for (const cel of cels) {
      WhatsApp(msg, cel, event)
    }
  }
  if(enable_Telegram == 'true'){
    for (const chatId of chatIds) {
      Telegram(chatId, msg, event)
    }
  }
}