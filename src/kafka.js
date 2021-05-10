const { Kafka } = require('kafkajs');
const { nanoid } = require('nanoid');
const { EventEmitter } = require('events');
const CustomError = require('../src/utils/customError');

const controllers = {
	walletController: require('./controllers/wallet.controller')
};

const clientId = 'wallet';

const kafka = new Kafka({
	clientId,
	brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'ilia-group' });

const emitter = new EventEmitter();

const connect = async () => {
	await consumer.connect();
	await producer.connect();
	await consumer.subscribe({ topic: 'function-request' });
	await consumer.subscribe({ topic: 'function-response' });
	await consumer.subscribe({ topic: 'function-error' });
	await consumer.run({
		async eachMessage({ topic, message }) {
			if (topic == 'function-request') {
				const json = JSON.parse(message.value);
				if (json.api == clientId) {
					const func = controllers[json.controller][json.message];
					try {
						const response = await func(...json.args);
						producer.send({
							topic: 'function-response',
							messages: [
								{
									value: JSON.stringify({
										id: json.id,
										response
									})
								}
							]
						});
					}
					catch (error) {
						producer.send({
							topic: 'function-error',
							messages: [
								{
									value: JSON.stringify({
										id: json.id,
										error: error.message,
										code: error.code || 500
									})
								}
							]
						});
					}
				}
			}
			else if (topic == 'function-response') {
				const json = JSON.parse(message.value);
				emitter.emit(`response@${json.id}`, json.response);
			}
			else if (topic == 'function-error') {
				const json = JSON.parse(message.value);
				emitter.emit(`error@${json.id}`, json.error, json.code);
			}
		}
	});
};

const call = (api, controller, message, ...args) => {
	return new Promise((resolve, reject) => {
		const id = nanoid();
		producer.send({
			topic: 'function-request',
			messages: [
				{
					value: JSON.stringify({
						id,
						api,
						controller,
						message,
						args
					})
				}
			]
		});
		emitter.once(`response@${id}`, (response) => {
			resolve(response);
		});
		emitter.once(`error@${id}`, (error, code) => {
			reject(new CustomError(error, code));
		});
	});
};

const disconnect = async () => {
	await consumer.disconnect();
	await producer.disconnect();
};

module.exports = { producer, consumer, connect, disconnect, call };