const Wallet = require('../models/wallet.model');
const CustomError = require('../utils/customError');
const { isValidObjectId } = require('mongoose');

class WalletController {

	async createWallet(userId) {
		if(!isValidObjectId(userId)) {
			throw new CustomError('Invalid user ID', 400);
		}
		const wallet = await Wallet.create({
			userId,
			balance: 0
		});
		return wallet;
	}

	async deposit(userId, walletId, amount) {
		//Validate amount
		if(amount <= 0) {
			throw new CustomError('The amount must be greater than zero', 400);
		}

		//Find wallet
		const wallet = await Wallet.findOne({
			_id: walletId,
			userId
		});
		if(!wallet) {
			throw new CustomError('Wallet not found', 404);
		}

		//Then increment the balance
		const walletUpdated = await Wallet.findOneAndUpdate({
			_id: wallet._id
		}, {
			$inc: {
				balance: amount
			}
		}, { new: true });

		return walletUpdated;
	}

	async withdrawal(userId, walletId, amount) {
		//Find wallet
		const wallet = await Wallet.findOne({
			_id: walletId,
			userId
		});
		if(!wallet) {
			throw new CustomError('Wallet not found', 404);
		}

		//Validate amount
		if(amount <= 0) {
			throw new CustomError('The amount must be greater than zero', 400);
		}
		if(amount > wallet.balance) {
			throw new CustomError('insufficient funds', 406);
		}

		//Then decrement the balance
		const walletUpdated = await Wallet.findOneAndUpdate({
			_id: wallet._id
		}, {
			$inc: {
				balance: -amount
			}
		}, { new: true });

		return walletUpdated;
	}

	async transfer(userId, senderWalletId, receiverWalletId, amount) {
		//Find the sender wallet
		const senderWallet = await Wallet.findOne({
			_id: senderWalletId,
			userId
		});
		if(!senderWallet) {
			throw new CustomError('Sender wallet not found', 404);
		}

		//Find the receiver wallet
		const receiverWallet = await Wallet.findOne({
			_id: receiverWalletId
		});
		if(!receiverWallet) {
			throw new CustomError('Receiver wallet not found', 404);
		}

		//Validate amount
		if(amount <= 0) {
			throw new CustomError('The amount must be greater than zero', 400);
		}
		if(amount > senderWallet.balance) {
			throw new CustomError('insufficient funds', 406);
		}

		//Decrement the sender wallet balance and increment the receiver wallet balance
		await Wallet.findOneAndUpdate({
			_id: senderWallet._id
		}, {
			$inc: {
				balance: -amount
			}
		}, { new: true });
		await Wallet.findOneAndUpdate({
			_id: receiverWallet._id
		}, {
			$inc: {
				balance: amount
			}
		}, { new: true });

		return { success: true };
	}

	async listWallets(page = 1, limit = 10, userId) {
		const wallets = await Wallet.paginate({
			userId
		}, {
			page: parseInt(page),
			limit: parseInt(limit)
		});
		return wallets;
	}

	async getWalletInfo(userId, walletId) {
		const wallet = await Wallet.findOne({
			_id: walletId,
			userId
		});
		if(!wallet) {
			throw new CustomError('Wallet not found', 404);
		}
		return wallet;
	}

	async removeWallet(userId, walletId) {
		//Find wallet
		const wallet = await Wallet.findOne({
			_id: walletId,
			userId
		});
		if(!wallet) {
			throw new CustomError('Wallet not found', 404);
		}

		//Verify if the wallet balance is zero
		if(wallet.balance != 0) {
			throw new CustomError('This wallet cannot be removed because its balance is not zero', 403);
		}

		//Remove wallet
		const removeResult = await Wallet.deleteOne({
			_id: wallet._id
		});

		return removeResult;
	}

}

module.exports = new WalletController();