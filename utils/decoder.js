const alerta = require('./alertas/alerta')
const log = require('./log')
const notification = require('./notification')
const { set_event, set_event_system } = require('./models/event_controller')

function milhasNauticasToKm(milhas){
  const km = milhas * 1.852
  return km.toFixed(1)
}

function isDeviceEnabled(deviceId, eventType){
  const envName = `enable_${eventType}`
  const envValue = process.env[envName]

  if (!envValue) {
    log(`Evento '${eventType}' desabilitado para id:'${deviceId}' `, 'alerta')
    return false
  }

  const enableDeviceIds = envValue.split(',').map(Number)
  if (enableDeviceIds.includes(deviceId)){
    return true
  }else{
    log(`DeviceId '${deviceId}' sem evento '${eventType}'. Conteúdo: '${envValue}' `, 'alerta')
    return false
  }
}

function parse_num_zap(number){
  if (!number) return []
  if (number.length < 5) return []
  const numbers = number.replace(/[^\d,]/g, '').split(',')
  if (numbers[0].length < 5) return []
  return numbers
}

function parse_chat_id_telegram(chatId){
  if (!chatId) return []
  if (chatId.length < 5) return []
  const chatIds = chatId.replace(/\s+/g, '').split(',')
  if (chatIds[0].length < 5) return []
  return chatIds
}

function ignitionOn(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name

  resp = `💬 INFORMAÇÃO 💬\n\nA ignição do veículo '${nome_carro}' foi 🚙LIGADA.`

  return [ resp, envio_alerta ]
}

function ignitionOff(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name

  resp = `💬 INFORMAÇÃO 💬\n\nA ignição do veículo '${nome_carro}' foi 🚗DESLIGADA.`

  return [ resp, envio_alerta ]
}

function alarm(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device?.name ?? 'Nome não disponível';
  const tipo_alarme = payload.event?.attributes?.alarm ?? 'Tipo de alarme não disponível';
  const bat_carro = payload.position?.attributes?.io1 ?? 0;
  const bat_backup = payload.position?.attributes?.io2 ?? 0;
  const latitude = payload.position?.latitude ?? 0;
  const longitude = payload.position?.longitude ?? 0;
  const velocidade = payload.position?.speed ?? 0;
  const limite = payload.device.attributes?.speedLimit ?? 0;

  const alerta = `🚨 ALERTA! 🚨\n\nO veículo '${nome_carro}'`
  const baterias = `\n- Bateria do Carro: ${bat_carro}volts.\n- Bateria de Backup: ${bat_backup}volts.`
  const local = `\n\nLocal: https://www.google.com/maps?q=${latitude},${longitude}`

  const dados = `\n\nVelocidade: ${milhasNauticasToKm(velocidade)}km/h.\nLimite de Velocidade: ${milhasNauticasToKm(limite)}km/h.`

  switch (tipo_alarme) {
    case 'powerRestored':
      resp = `${alerta} teve a energia 🔋restaurada.${baterias}${local}`
      break
    case 'powerCut':
      resp = `${alerta} teve a energia 🪫cortada.${baterias}${local}`
      break
    case 'sos':
      resp = `${alerta} disparou um alarme de 📣SOS.${local}`
      break
    case 'lowBattery':
      resp = `${alerta} está com o nivel de bateria muito baixo.${baterias}`
      break
    case 'accident':
      envio_alerta = false // Por enquanto não enviar alerta de acidente 25/12/2024
      resp = `${alerta} está indicando pelas vibrações dos acelerômetros que houve um ⚠️ACIDENTE!⚠️.${local}${dados}`
      break
    default:
      resp = `${alerta} disparou um alarme: ${tipo_alarme}`
      envio_alerta = false // alarme direto do rastreador, não enviar alerta: 'overspeed'
  }

  return [ resp, envio_alerta ]
}

function deviceUnknown(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name

  resp = `💬 INFORMAÇÃO 💬\n\nO rastreador do veículo '${nome_carro}' está 🟡Desconectado ou com status desconhecido.`
  return [ resp, envio_alerta ]
}

function deviceOffline(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name

  resp = `💬 INFORMAÇÃO 💬\n\nO rastreador do veículo '${nome_carro}' está 🔴OFF-LINE.`
  return [ resp, envio_alerta ]
}

function deviceOnline(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name

  resp = `💬 INFORMAÇÃO 💬\n\nO rastreador do veículo '${nome_carro}' está 🟢ON-LINE.`
  return [ resp, envio_alerta ]
}

function commandResult(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name
  const estado = payload.event.attributes.result.split(';')[16] == '00000001' ? '🔒Bloqueado' : '🔓Desbloqueado'
  const latitude = payload.position.latitude
  const longitude = payload.position.longitude
  const local = `https://www.google.com/maps?q=${latitude},${longitude}`

  resp = `🚨 ALERTA! 🚨\n\nO veículo '${nome_carro}' foi ${estado}.\n\nLocal: ${local}`

  return [ resp, envio_alerta ]
}

function geofenceEnter(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name
  const latitude = payload.position.latitude
  const longitude = payload.position.longitude
  const local = `https://www.google.com/maps?q=${latitude},${longitude}`
  const cerca_virtual = payload.geofence.name
  resp = `💬 INFORMAÇÃO 💬\n\nO veículo '${nome_carro}' entrou na cerca virtual '${cerca_virtual}'.\n\nLocal: ${local}`
  return [ resp, envio_alerta ]
}

function geofenceExit(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name
  const latitude = payload.position.latitude
  const longitude = payload.position.longitude
  const local = `https://www.google.com/maps?q=${latitude},${longitude}`
  const cerca_virtual = payload.geofence.name
  resp = `⚠️ AVISO! ⚠️\n\nO veículo '${nome_carro}' saiu na cerca virtual '${cerca_virtual}'.\n\nLocal: ${local}`

  return [ resp, envio_alerta ]
}

function deviceStopped(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name
  const latitude = payload.position.latitude
  const longitude = payload.position.longitude
  const local = `https://www.google.com/maps?q=${latitude},${longitude}`

  resp = `💬 INFORMAÇÃO 💬\n\nO veículo '${nome_carro}' está parado.\n\nLocal: ${local}`
  return [ resp, envio_alerta ]
}

function deviceMoving(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name
  const latitude = payload.position.latitude
  const longitude = payload.position.longitude
  const velocidade = payload.position?.speed ?? 0;
  const limite = payload.device.attributes?.speedLimit ?? 0;
  const local = `\n\nLocal: https://www.google.com/maps?q=${latitude},${longitude}`
  const dados = `\n\nVelocidade: ${milhasNauticasToKm(velocidade)}km/h.\nLimite de Velocidade: ${milhasNauticasToKm(limite)}km/h.`

  resp = `💬 INFORMAÇÃO 💬\n\nO veículo '${nome_carro}' está se movendo.${local}${dados}`

  return [ resp, envio_alerta ]
}

function deviceOverspeed(payload){
  let envio_alerta = true
  let resp = ''
  const nome_carro = payload.device.name
  const latitude = payload.position.latitude
  const longitude = payload.position.longitude
  const velocidade = payload.position?.speed ?? 0;
  const limite = payload.device.attributes?.speedLimit ?? 0;
  const local = `\n\nLocal: https://www.google.com/maps?q=${latitude},${longitude}`
  const dados = `\n\nVelocidade: ${milhasNauticasToKm(velocidade)}km/h.\nLimite de Velocidade: ${milhasNauticasToKm(limite)}km/h.`

  resp = `⚠️ AVISO! ⚠️\n\nO veículo '${nome_carro}' ultrapassou o limite de velocidade.${local}${dados}`

  return [ resp, envio_alerta ]
}

module.exports = function decoder(infos, payload){
  let icones = '🚙🚗🚘🚨⚠️✅📣📢🪫📡⌛🔋🔓🔒💬🔴🟠🟡🟢🗺️'
  let number = parse_num_zap(payload.device.phone)
  let chatIdTelegram = parse_chat_id_telegram(payload.device.contact)
  let response = ''
  let envio_alerta = null
  const deviceId = payload.device.id
  const eventType = payload.event.type
  const name = payload.device.name

  switch (eventType) {
    case 'ignitionOn':
      [ response, envio_alerta ] = ignitionOn(payload)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'ignitionOff':
      [ response, envio_alerta ] = ignitionOff(payload)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'alarm':
      [ response, envio_alerta ] = alarm(payload)
      set_event_system(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'deviceUnknown':
      [ response, envio_alerta ] = deviceUnknown(payload)
      set_event_system(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'deviceOnline':
      [ response, envio_alerta ] = deviceOnline(payload)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'deviceOffline':
      [ response, envio_alerta ] = deviceOffline(payload)
      set_event_system(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'commandResult':
      [ response, envio_alerta ] = commandResult(payload)
      set_event(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'geofenceEnter':
      [ response, envio_alerta ] = geofenceEnter(payload)
      set_event_system(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'geofenceExit':
      [ response, envio_alerta ] = geofenceExit(payload)
      set_event_system(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'deviceStopped':
      [ response, envio_alerta ] = deviceStopped(payload)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'deviceMoving':
      [ response, envio_alerta ] = deviceMoving(payload)
      set_event_system(payload, response) // Deixar para testes, provavelmente não será necessário

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    case 'deviceOverspeed':
      [ response, envio_alerta ] = deviceOverspeed(payload)
      set_event_system(payload, response)

      if (isDeviceEnabled(deviceId, eventType)){
        if(envio_alerta){
          alerta(response, number, eventType, chatIdTelegram)
        }
      }else{
        response = `${eventType} desabilitado para ${name}`
      }
      break
    default:
      response = `Tipo de evento não mapeado no sistema: ${eventType}`
      log(response, 'alerta')
      notification(payload)
  }

  return {msg: response, numero: number}
}