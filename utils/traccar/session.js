const axios = require('axios');
const log = require('../log');

module.exports = async function session(){
  log('Fazendo login no Traccar', 'info')
  const url = `${process.env.traccar_api_url}/session?token=${process.env.traccar_token_admin}`

  try {
    const response = await axios.get(url)
    const cookies = response.headers['set-cookie']
    const cookie = cookies[0].split(';')[0]

    return {msg: cookie, status: response.status}
  } catch (error) {
    const msg_error = `Error ao fazer o login em Traccar: ${error.status}`
    log(msg_error, 'erro')
    log(error.response)
    return {msg: msg_error, status: error.status}
  }
}