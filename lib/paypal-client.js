var PaypalStrategy = require('kaching-paypal'),
	kaching = require('kaching');
	keystone = require('keystone'),
	User = keystone.list('User')

kaching.use(new PaypalStrategy({
	host: process.env.PAYPAL_ENDPOINT_URL,     // optional
	port: '',                                  // optional
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET
}));

paymentSetup = function(req, res, next) {
	// https://github.com/gregwym/kaching-paypal
	// Setup payment detail in `req.payment`.
	User.model.findById(req.query.userId).exec(
		function(err, user) {
			if (err) {
				return next(err);
			}

			req.user = user
			req.payment = {
				amount:{
					total:    req.user.membershipType === 'student' ? '10.00' : '25.00',
					currency: 'NZD'
				},
				redirect_urls: {
					return_url: process.env.PAYPAL_RETURN_URL + '?userId=' + req.query.userId + '&action=return',
					cancel_url: process.env.PAYPAL_CANCEL_URL + '?userId=' + req.query.userId + '&action=cancel'
				},
				description: 'JavaScript New Zealand annual membership subscription.'
			};
			next();
		}
	);
};

storePayment = function(req, res, next) {
	req.user.paymentToken = req.payment;
	req.user.save(function(err) {
		if (err) {
			return next(err);
		} else {
			return next();
		}
	});
};

extractPaymentDetails = function(req, res, next) {
	console.log(req.query)
	User.model.findById(req.query.userId).exec(
		function(err, user) {
			if (err) {
				return next(err);
			}
			req.user = user;
			req.payment = req.user.paymentToken;
			req.payment.payer_id = req.query.PayerID;
			next();
		}
	);
};

deletePayment = function(req, res, next) {
	User.model.findById(req.query.userId).exec(
		function(err, user) {
			if (err) {
				return next(err);
			}

			user.paymentToken = null;
			user.save(function(err) {
				if (err) {
					return next(err);
				} else {
					return next();
				}
			});
		}
	);
};

savePayment = function(req, res, next) {
	req.user.paymentDetails = req.payment;

	if (req.payment.state === 'approved') {
		req.query.state = 'approved'
		req.user.lastPaidAt = new Date()
	} else {
		req.query.state = 'declined'
	}

	req.user.save(function(err) {
		if (err) {
			return next(err);
		}
		route = req.payment.state === 'approved' ? 'success' : 'declined';
		res.redirect('paypal/' + route)
	});
};


module.exports = {
	setup:          paymentSetup,
	create:         kaching.create('paypal', {}),
	approve:        kaching.approve('paypal'),
	execute:        kaching.execute('paypal'),
	storePayment:   storePayment,
	extractPayment: extractPaymentDetails,
	cancel:         deletePayment,
	savePayment:    savePayment
}
