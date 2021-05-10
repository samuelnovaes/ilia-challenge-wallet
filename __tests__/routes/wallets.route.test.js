const request = require('supertest');
const app = require('../../src/app');
const { isValidObjectId } = require('mongoose');

module.exports = () => {
	const userEndpoint = 'http://localhost:3002';
	let tokenA = null;
	let tokenB = null;
	let walletA = null;
	let walletB = null;

	it('Authenticate user', async () => {
		const authUserA = await request(userEndpoint)
			.post('/user/auth')
			.send({
				username: 'usertesta',
				password: 'iliachallenge'
			})
			.expect('Content-Type', /json/)
			.expect(200);

		tokenA = authUserA.body.token;

		const authUserB = await request(userEndpoint)
			.post('/user/auth')
			.send({
				username: 'usertestb',
				password: 'iliachallenge'
			})
			.expect('Content-Type', /json/)
			.expect(200);

		tokenB = authUserB.body.token;
	});

	it('When creating new wallet, it should return the created wallet', async () => {
		const resultA = await request(app)
			.post('/wallets')
			.set('Authorization', tokenA)
			.expect('Content-Type', /json/)
			.expect(200);

		walletA = resultA.body;
		expect(isValidObjectId(walletA._id)).toBe(true);
		expect(walletA.balance).toBe(0);

		const resultB = await request(app)
			.post('/wallets')
			.set('Authorization', tokenB)
			.expect('Content-Type', /json/)
			.expect(200);

		walletB = resultB.body;
		expect(isValidObjectId(walletB._id)).toBe(true);
		expect(walletB.balance).toBe(0);
	});

	it('Deposit in the wallet', (done) => {
		request(app)
			.post(`/wallets/${walletA._id}/deposit`)
			.set('Authorization', tokenA)
			.send({
				amount: 100
			})
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).toBeFalsy();
				expect(res.body.balance).toBe(100);
				done();
			});
	});

	it('Withdrawal from the wallet', (done) => {
		request(app)
			.post(`/wallets/${walletA._id}/withdrawal`)
			.set('Authorization', tokenA)
			.send({
				amount: 10
			})
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).toBeFalsy();
				expect(res.body.balance).toBe(90);
				done();
			});
	});

	it('Transfer between wallets', (done) => {
		request(app)
			.post(`/wallets/${walletA._id}/transfer`)
			.set('Authorization', tokenA)
			.send({
				to: walletB._id,
				amount: 90
			})
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).toBeFalsy();
				expect(res.body.success).toBe(true);
				done();
			});
	});

	it('List wallets from user', async () => {
		const walletsA = await request(app)
			.get('/wallets')
			.set('Authorization', tokenA)
			.expect('Content-Type', /json/)
			.expect(200);

		const walletsB = await request(app)
			.get('/wallets')
			.set('Authorization', tokenB)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(walletsA.body.docs[0].balance).toBe(0);
		expect(walletsB.body.docs[0].balance).toBe(90);
	});

	it('Get wallet info', (done) => {
		request(app)
			.get(`/wallets/${walletB._id}`)
			.set('Authorization', tokenB)
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).toBeFalsy();
				expect(res.body.balance).toBe(90);
				done();
			});
	});

	it('Remove wallet', (done) => {
		request(app)
			.delete(`/wallets/${walletA._id}`)
			.set('Authorization', tokenA)
			.expect('Content-Type', /json/)
			.expect(200)
			.end((err, res) => {
				expect(err).toBeFalsy();
				expect(res.body.deletedCount).toBe(1);
				done();
			});
	});
};