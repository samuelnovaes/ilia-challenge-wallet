const parseError = require('../utils/parseError');
const { call } = require('../kafka');
const CustomError = require('../utils/customError');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
	try {
		const authorization = req.get('Authorization');
		if (!authorization) {
			throw new CustomError('The access token is required', 401);
		}
		const token = authorization.replace(/^bearer (.*)$/i, '$1');

		//Validate token
		try {
			await promisify(jwt.verify)(token, process.env.PRIVATE_KEY);
		}
		catch (error) {
			throw new CustomError('Invalid access token');
		}

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