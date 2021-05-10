const parseError = require('../utils/parseError');
const { call } = require('../kafka');

module.exports = async (req, res, next) => {
	try {
		const authorization = req.get('Authorization');
		req.userId = await call(
			'user',
			'userController',
			'validateToken',
			authorization
		);
		next();
	}
	catch (error) {
		parseError(error, res);
	}
};