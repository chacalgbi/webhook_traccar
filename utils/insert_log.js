const fs = require('fs')
const data_hora = require('./dataHora')

 module.exports = function insert_log(message) {
  const logMessage = `[${data_hora()}] ${message}\n`
  fs.appendFile('logs.log', logMessage, (err) => {
      if (err) {
          console.error('Erro ao escrever no arquivo de log:', err)
      }
  })
}