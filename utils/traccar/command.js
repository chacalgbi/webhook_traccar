const axios = require('axios');
const log = require('../log');
const redis = require('../redis')

function response_ok(response){
  const info = `Comando enviado com sucesso`
  log(info, 'info')

  return {msg: info, status: response.status}
}

function response_error(error){
  const msg_error = `Error ao enviar o comando para o Traccar: ${error.response ? error.response.statusText : error.message}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: error.response.status}
}

function set_payload(data){
  let payload = null

  if (data.command == 'bloquear'){
    payload = {
      "id": 1,
      "deviceId": data.device_id,
      "description": "Bloquear veículo",
      "type": "engineStop",
      "attributes": {}
    }
  }else if (data.command == 'desbloquear'){
    payload = {
      "id": 2,
      "deviceId": data.device_id,
      "description": "Desbloquear veículo",
      "type": "engineResume",
      "attributes": {}
    }
  }

  return payload
}

function set_redis(data){
  const key = `device${data.device_id}`
  const value = `${data.device_id};${data.driver_id};${data.driver_name};${data.command}`
  redis.set(key, value)
}

module.exports = async function traccar_command(cookie, data){
  log(`Enviando comando '${data.command}' para o device '${data.device_id}'`, 'info')

  set_redis(data)

  try {
    const response = await axios.post(`${process.env.traccar_api_url}/commands/send`, set_payload(data), {headers:{Cookie: cookie}})
    return response_ok(response)
  } catch (error) {
    return response_error(error)
  }
}