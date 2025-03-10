const log = require('./log')
const redis = require('redis')
const client_redis = redis.createClient()

client_redis.on('connect',      ()  => { log(`REDIS conectado`, 'info')      })
client_redis.on('error',        (e) => { log(`REDIS error: ${e}`, 'erro')    })
client_redis.on('end',          ()  => { log('REDIS encerrado', 'alerta')    })
client_redis.on('reconnecting', ()  => { log('REDIS Reconectando', 'alerta') })
client_redis.on('ready',        ()  => { log('REDIS pronto', 'info')         })
client_redis.connect()

async function get(key) {
  let result = null
    try {
      const value = await client_redis.get(key)
      result = value ? value.toString('utf-8') : null
    } catch (err) {
      log(`REDIS GET error: ${err}`, 'erro')
      result = err
    } finally {
      return result
    }
}

async function set(key, value) {
  let result = null
    try {
      result = await client_redis.set(key, value)
    } catch (err) {
      log(`REDIS SET error: ${err}`, 'erro')
      result = err
    } finally {
      return result
    }
}

module.exports = {
  get,
  set
}