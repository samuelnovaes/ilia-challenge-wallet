const router = require('express').Router();
const walletController = require('../controllers/wallet.controller');
const parseError = require('../utils/parseError');

router.get('/', async (req, res) => {
	try {
		const result = await walletController.listWallets(req.query.page, req.query.limit, req.userId);
		res.json(result);
	}
	catch (error) {
		parseError(error, res);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const result = await walletController.getWalletInfo(req.userId, req.params.id);
		res.json(result);
	}
	catch (error) {
		parseError(error, res);
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const result = await walletController.removeWallet(req.userId, req.params.id);
		res.json(result);
	}
	catch (error) {
		parseError(error, res);
	}
});

router.post('/', async (req, res) => {
	try {
		const result = await walletController.createWallet(req.userId);
		res.json(result);
	}
	catch(error) {
		parseError(error, res);
	}
});

router.post('/:id/deposit', async(req, res) => {
	try {
		const result = await walletController.deposit(req.userId, req.params.id, req.body.amount);
		res.json(result);
	}
	catch(error) {
		parseError(error, res);
	}
});

router.post('/:id/withdrawal', async(req, res) => {
	try {
		const result = await walletController.withdrawal(req.userId, req.params.id, req.body.amount);
		res.json(result);
	}
	catch(error) {
		parseError(error, res);
	}
});

router.post('/:id/transfer', async(req, res) => {
	try {
		const result = await walletController.transfer(req.userId, req.params.id, req.body.to, req.body.amount);
		res.json(result);
	}
	catch(error) {
		parseError(error, res);
	}
});

module.exports = router;