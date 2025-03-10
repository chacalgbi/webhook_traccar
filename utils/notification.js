const axios = require('axios');
const log = require('./log');

function response_ok(response){
  log(`Notification: ${response.data.msg} ${response.status}`, 'info')

  return {msg: response.data.msg, status: response.status}
}

function response_error(error){
  const msg_error = `Error ao publicar no Notification: ${error.response ? error.response.statusText : error.message}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: error.response.status}
}

module.exports = async function notification(payload){
  log('Enviando payload para Active_admin Notification', 'info')

  try {
    const response = await axios.post(process.env.NOTIFY_URL, payload, { headers: {'Content-Type': 'application/json',} })
    return response_ok(response)
  } catch (error) {
    return response_error(error)
  }
}