const walletController = require('../../src/controllers/wallet.controller');
const { isValidObjectId } = require('mongoose');

module.exports = () => {
	let walletA = null;
	let walletB = null;
	const userA = '5fda8f8496e44b044ad84485';
	const userB = '5f90409e9da59417633a85c5';

	it('When creating new wallet, it should return the created wallet', async () => {
		walletA = await walletController.createWallet(userA);
		expect(isValidObjectId(walletA._id)).toBe(true);
		expect(walletA.balance).toBe(0);

		walletB = await walletController.createWallet(userB);
		expect(isValidObjectId(walletB._id)).toBe(true);
		expect(walletB.balance).toBe(0);
	});

	it('Deposit in the wallet', async() => {
		const walletUpdated = await walletController.deposit(userA, walletA._id, 100);
		expect(walletUpdated.balance).toBe(100);
	});

	it('Withdrawal from the wallet', async() => {
		const walletUpdated = await walletController.withdrawal(userA, walletA._id, 10);
		expect(walletUpdated.balance).toBe(90);
	});

	it('Transfer between wallets', async() => {
		const transfer = await walletController.transfer(userA, walletA._id, walletB._id, 90);
		expect(transfer.success).toBe(true);
	});

	it('List wallets from user', async() => {
		const walletsA = await walletController.listWallets(1, 10, userA);
		const walletsB = await walletController.listWallets(1, 10, userB);
		expect(walletsA.docs[0].balance).toBe(0);
		expect(walletsB.docs[0].balance).toBe(90);
	});

	it('Get wallet info', async() => {
		const wallet = await walletController.getWalletInfo(userB, walletB._id);
		expect(wallet.balance).toBe(90);
	});

	it('Remove wallet', async() => {
		const result = await walletController.removeWallet(userA, walletA._id);
		expect(result.deletedCount).toBe(1);
	});
};