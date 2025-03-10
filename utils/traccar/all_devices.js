const axios = require('axios');
const log = require('../log');

function response_notFound(){
  const msg_error = `Não foi encontrado nenhum device cadastrado`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: 404}
}

function response_ok(response){
  const count = response.data.length
  const info = `Foram encontrados ${count} devices`
  log(info, 'info')

  return {msg: response.data, status: response.status}
}

function response_error(error){
  const msg_error = `Error ao buscar devices no Traccar: ${error.response ? error.response.statusText : error.message}`
  log(msg_error, 'alerta')
  return {msg: msg_error, status: error.response.status}
}

function addparams(ids){
  let params = ''
  if(ids.length > 0){
    params = '?'
    ids.forEach(id => {
      params += `id=${id}&`
    })
    params = params.slice(0, -1)
  }
  return params
}

module.exports = async function traccar_allDevices(cookie, ids = []){
  log(`Buscando todos os devices`, 'info')

  try {
    const response = await axios.get(`${process.env.traccar_api_url}/devices${addparams(ids)}`, {headers:{Cookie: cookie}})
    if(response.data.length === 0){ return response_notFound }
    return response_ok(response)
  } catch (error) {
    return response_error(error)
  }
}