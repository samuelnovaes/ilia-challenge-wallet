require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const { connect } = require('./kafka');

const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
	authSource: 'admin'
});

const db = mongoose.connection;

db.once('open', async () => {
	await connect();
	app.listen(port, () => {
		console.log('Wallet service running on port', port);
	});
});

db.on('error', (err) => {
	console.error(err.stack);
});