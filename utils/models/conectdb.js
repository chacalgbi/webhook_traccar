const log  = require('../log')
const database = require('./database')

module.exports = async function testBD(){
	let isConected = false

	await database.authenticate()
	.then((res)=>{
		isConected = true
		log('Conexão com o Banco de dados estabelecida com sucesso!', 'info')
	})
	.catch((e)=>{
		log(`Erro ao conectar no Banco de dados:\n\n${e}`, 'erro')
	})

	if(isConected){
		const Events = require('./events')

		await database.sync()
		.then((res)=>{
			log('Tabelas sincronizadas!', 'info')
		})
		.catch((e)=>{
			log(`Erro ao sincronizar tabelas!\n\n${e}`, 'erro')
		})

	}
}