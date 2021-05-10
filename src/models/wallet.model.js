const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const walletSchema = new mongoose.Schema({
	userId: String,
	balance: {
		type: Number,
		default: 0
	}
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

walletSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('wallet', walletSchema);