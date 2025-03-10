// https://github.com/yagop/node-telegram-bot-api/blob/master/examples/polling.js
const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TOKEN_BOT
const bot = new TelegramBot(token, { polling: true })
const log = require('../log')

bot.on('message', async (msg) => {
	if(msg.text == 'Id' || msg.text == 'id'){
		setTimeout(() => { bot.sendMessage(msg.chat.id, "Este número abaixo é o id de nosso chat:") }, 500)
		setTimeout(() => { bot.sendMessage(msg.chat.id, `${msg.chat.id}`) }, 1000)
	}
})


module.exports = function telegram(chat_id, msg, event) {
	bot.sendMessage(chat_id, msg).then((res) => {
		const response = `TELEGRAM Evento:${event} - De:${res.from.first_name} Para:${res.chat.first_name}`
		log(response)
	})
	.catch((err) => {
		log(err.message)
	})
}