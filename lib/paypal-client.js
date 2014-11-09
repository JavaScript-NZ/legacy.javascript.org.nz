var PaypalStrategy = require('kaching-paypal'),
		kaching = require('kaching');

kaching.use(new PaypalStrategy({
	host: process.env.PAYPAL_ENDPOINT_URL,     // optional
	port: '',                                  // optional
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET
}));

module.exports = kaching;
