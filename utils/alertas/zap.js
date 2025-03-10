const axios = require('axios')
const log = require('../log')

module.exports = async function zap(msg, cel, event){
  const data = {
    identidade: `Rastreamento QA. Evento: ${event}`,
    userAdmin: process.env.ZAP_USER,
    passAdmin: process.env.ZAP_PASSWORD,
    cel: cel,
    msg: msg,
  }

  try {
    const response = await axios.post(process.env.ZAP_URL, data, { headers: {'Content-Type': 'application/json',} })
    log(`WHATSAPP Evento:${event} - Para:${cel} Resposta:${response.data.msg}`)
  } catch (error) {
    log(`Erro ao enviar mensagem para o WhatsApp. StatusCode: ${error.status}`, 'erro')
    log(error.response.data)
  }
}