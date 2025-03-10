const Event = require('./events')
const log  = require('../log')
const redis = require('../redis')

async function set_event(payload, msg) {
  const deviceId = payload.device.id
  const name = payload.device.name
  const eventType = payload.event.type
  const value = await redis.get(`device${deviceId}`)
  const values = value.split(';')

  await Event.create({
    car_id: deviceId,
    car_name: name,
    driver_id: values[1],
    driver_name: values[2],
    event_type: eventType,
    event_name: values[3],
    message: msg
  })
  .then((res) => {
    log(`Evento ${values[3]} para o device ${deviceId} gravado com sucesso no banco de dados`, 'info')
  })
  .catch((e) => {
    log(`Erro ao gravar evento no banco de dados:\n\n${e}`, 'erro')
  })
}

async function set_event_system(payload, msg) {
  const deviceId = payload.device.id
  const name = payload.device.name

  await Event.create({
    car_id: deviceId,
    car_name: name,
    driver_id: "",
    driver_name: "Sistema",
    event_type: "",
    event_name: "",
    message: msg
  })
  .then((res) => {
    log(`Evento de Sistema para o device ${deviceId} gravado com sucesso no banco de dados`, 'info')
  })
  .catch((e) => {
    log(`Erro ao gravar evento no banco de dados:\n\n${e}`, 'erro')
  })
}

module.exports = {
  set_event,
  set_event_system
}