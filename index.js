require('dotenv').config()
const express = require("express")
const cors = require('cors')
const app = express()
const log  = require('./utils/log')
const conectdb  = require('./utils/models/conectdb')
const decoder = require('./utils/decoder')
const traccar_session = require('./utils/traccar/session')
const traccar_positions = require('./utils/traccar/positions')
const traccar_positions_info = require('./utils/traccar/positions_info')
const traccar_allDevices = require('./utils/traccar/all_devices')
const traccar_command = require('./utils/traccar/command')
let global_cookie = 'JSESSIONID=node05666666rrdh7r38yyne5ql5h449.node0'

app.use(cors())
app.use(express.json())

app.post('/traccar_webhook_manager_route', (req, res) => {
  let payload

  try {
    payload = req.body
    if (!payload.device || !payload.device.id || !payload.device.name || !payload.event || !payload.event.type) {
      throw new Error('Payload inválido')
    }
  } catch (error) {
    const msg_error = 'Payload inválido ou faltam informações'
    log(msg_error, 'erro')
    return res.status(400).json({ message: msg_error })
  }

  const alarm_type = payload.event?.attributes?.alarm ?? '';
  const infos = `DeviceId:${payload.device.id} Nome:${payload.device.name} Evento:${payload.event.type} ${alarm_type}`

  log(`POST /webhook - ${infos}`, 'info')
  //log(JSON.stringify(payload))

  const response = decoder(infos, payload)

  res.status(200).json({ message: 'WebHook Recebido' })
})

app.get('/get_location_from_devices', async(req, res) => {
  try {
    let positionsResult = null
    const deviceId = req.query.deviceId

    if (!deviceId) {
      return res.status(400).json({ message: 'Falta informação. Informe o deviceId' })
    }

    log(`GET /get_location_from_devices - deviceId: ${deviceId}`, 'info')
    positionsResult = await traccar_positions(global_cookie, deviceId)

    if(positionsResult.status == 401){
      const sessionResult = await traccar_session()
      if (sessionResult.status == 200){
        global_cookie = sessionResult.msg
        positionsResult = await traccar_positions(global_cookie, deviceId)
      }else{
        return res.status(sessionResult.status).json({ message: 'Erro ao processar a requisição', error: sessionResult.msg })
      }
    }

    res.status(positionsResult.status).json({ message: positionsResult.msg })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a requisição', error: error.message })
  }
})

app.get('/alldevices', async(req, res) => {
  try {
    log(`GET /alldevices`, 'info')
    let response = null
    const ids = Array.isArray(req.query.id) ? req.query.id : [req.query.id].filter(Boolean)

    response = await traccar_allDevices(global_cookie, ids)

    if(response.status == 401){
      const sessionResult = await traccar_session()
      if (sessionResult.status == 200){
        global_cookie = sessionResult.msg
        response = await traccar_allDevices(global_cookie, ids)
      }else{
        return res.status(sessionResult.status).json({ message: 'Erro ao processar a requisição', error: sessionResult.msg })
      }
    }

    res.status(response.status).json(response.msg)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a requisição', error: error.message })
  }
})

app.get('/positions_info', async(req, res) => {
  try {
    let positionsResult = null
    const deviceId = req.query.deviceId

    if (!deviceId) {
      return res.status(400).json({ message: 'Falta informação. Informe o deviceId' })
    }

    log(`GET /positions_info - deviceId: ${deviceId}`, 'info')
    positionsResult = await traccar_positions_info(global_cookie, deviceId)

    if(positionsResult.status == 401){
      const sessionResult = await traccar_session()
      if (sessionResult.status == 200){
        global_cookie = sessionResult.msg
        positionsResult = await traccar_positions_info(global_cookie, deviceId)
      }else{
        return res.status(sessionResult.status).json({ message: 'Erro ao processar a requisição', error: sessionResult.msg })
      }
    }

    res.status(positionsResult.status).json(positionsResult.msg)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a requisição', error: error.message })
  }
})

app.post('/command', async(req, res) => {
  try {
    log(`POST /command`, 'info')
    let response = null

    response = await traccar_command(global_cookie, req.body)

    if(response.status == 401){
      const sessionResult = await traccar_session()
      if (sessionResult.status == 200){
        global_cookie = sessionResult.msg
        response = await traccar_command(global_cookie, req.body)
      }else{
        return res.status(sessionResult.status).json({ message: 'Erro ao processar a requisição', error: sessionResult.msg })
      }
    }

    res.status(response.status).json(response.msg)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a requisição', error: error.message })
  }
})

app.listen(process.env.API_PORT, () => {
  log(`WEBHOOK Traccar - Porta: ${process.env.API_PORT}`)
  conectdb()
})