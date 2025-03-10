module.exports = function data_hora(){
  return new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
}