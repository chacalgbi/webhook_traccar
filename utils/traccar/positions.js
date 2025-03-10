const axios = require('axios');
const log = require('../log');

function response_notFound(deviceId){
  const msg_error = `Não foi encontrado coordenadas para o deviceId: ${deviceId}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: 404}
}

function response_ok(response){
  const deviceId = response.data[0].deviceId
  const local = `https://www.google.com/maps?q=${response.data[0].latitude},${response.data[0].longitude}`
  log(`Coordenadas do device: ${deviceId} encontradas: ${local}`, 'info')

  return {msg: local, status: response.status}
}

function response_error(error){
  const msg_error = `Error ao buscar coordenadas no Traccar: ${error.response ? error.response.statusText : error.message}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: error.response.status}
}

module.exports = async function traccar_positions(cookie, deviceId){
  log(`Buscando coordenadas do device: ${deviceId}`, 'info')

  try {
    const response = await axios.get(`${process.env.traccar_api_url}/positions?deviceId=${deviceId}`, {headers:{Cookie: cookie}})
    if(response.data.length === 0){ return response_notFound(deviceId) }
    return response_ok(response)
  } catch (error) {
    return response_error(error)
  }
}