var PaypalStrategy = require('kaching-paypal'),
		kaching = require('kaching');

kaching.use(new PaypalStrategy({
	host: process.env.PAYPAL_ENDPOINT_URL,     // optional
	port: '',                                  // optional
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET
}));

paymentSetup = function(req, res, next) {
	// https://github.com/gregwym/kaching-paypal
	// Setup payment detail in `req.payment`.
  req.payment = {
    amount:{
      total: 		'20.00',
      currency: 'NZD'
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_RETURN_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL
    },
    description: 'JavaScript New Zealand annual membership subscription.'
  };
  next();
};

savePaymentDetails = function(req, res, next) {
	return next()
};

extractPaymentDetails = function(req, res, next) {
	return next()
};

module.exports = {
	setup: 		paymentSetup,
	create: 	kaching.create('paypal', {}),
	approve: 	kaching.approve('paypal'),
	execute: 	kaching.execute('paypal')
}
