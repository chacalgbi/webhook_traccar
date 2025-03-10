const axios = require('axios');
const log = require('../log');

function response_notFound(deviceId){
  const msg_error = `Não foi encontrado detalhes para o deviceId: ${deviceId}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: 404}
}

function response_ok(response){
  const resp = response.data[0]

  const deviceId = resp?.deviceId ?? 'n/a'
  const geofence = resp?.geofenceIds ?? []
  const satelite = resp?.attributes?.sat ?? 'n/a'
  const battery  = resp?.attributes?.io1 ?? 'n/a'
  const bat_bckp = resp?.attributes?.io2 ?? 'n/a'
  const altitude = resp?.attributes?.io6 ?? 'n/a'
  const type     = resp?.attributes?.type ?? 'n/a'
  const ignition = resp?.attributes?.ignition ?? false
  const version  = resp?.attributes?.versionFw ?? 'n/a'

  log(`Detalhes do device: ${deviceId} encontrados. Type:${type} Bat:${battery} Sat:${satelite} Bat_bkp:${bat_bckp} Altitude:${altitude}`, 'info')

  payload = {
    deviceId: deviceId,
    satelite: satelite,
    battery: battery,
    bat_bckp: bat_bckp,
    altitude: altitude,
    geofenceIds: geofence,
    ignition: ignition,
    version: version,
    type: type
  }

  return {msg: payload, status: response.status}
}

function response_error(error){
  const msg_error = `Error ao buscar detalhes no Traccar: ${error.response ? error.response.statusText : error.message}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: error.response.status}
}

module.exports = async function traccar_positions_info(cookie, deviceId){
  log(`Buscando detalhes do device: ${deviceId}`, 'info')

  try {
    const response = await axios.get(`${process.env.traccar_api_url}/positions?deviceId=${deviceId}`, {headers:{Cookie: cookie}})
    if(response.data.length === 0){ return response_notFound(deviceId) }
    return response_ok(response)
  } catch (error) {
    return response_error(error)
  }
}