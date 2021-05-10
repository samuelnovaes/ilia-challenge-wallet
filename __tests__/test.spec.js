require('dotenv').config({
	path: '.env.test'
});

const mongoose = require('mongoose');

const walletControllerTests = require('./controllers/wallet.controller.test');
const walletsRouteTests = require('./routes/wallets.route.test');
const { connect, disconnect } = require('../src/kafka');

const setupMongooseConnection = () => {
	beforeAll((done) => {
		mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
			authSource: 'admin'
		});
		mongoose.connection.once('open', async () => {
			await connect();
			done();
		});
	}, 120000);
	afterAll(async () => {
		const collections = await mongoose.connection.db.collections();
		for(const collection of collections) {
			await collection.drop();
		}
		mongoose.connection.close();
		await disconnect();
	}, 120000);
};

describe('User controller', () => {
	setupMongooseConnection();
	walletControllerTests();
});

describe('User route', () => {
	setupMongooseConnection();
	walletsRouteTests();
});