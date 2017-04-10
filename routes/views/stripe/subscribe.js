var keystone = require('keystone');
var stripe = require("stripe")("sk_test_P6xiCHLAqPLSXdc8aDXNXnnC"); // TODO  - env variable here
var User = keystone.list('User');

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res),
		locals = res.locals;

	locals.userId = req.query.userId;

	view.on('init', function(next) {
		User.model.findById(req.query.userId).exec(
			function(err, user) {
				if (err) {
					return next(err);
				}

				if (user.stripeSubscriptionActive) {
					// User has already subscribed. Return to the dashboard
					return res.redirect('/');
				}

				locals.newUser = user;
				return next();

			}
		);
	});

	view.on('post', { action: 'subscribe' }, function subscribePost(next) {
		User.model.findById(req.query.userId).exec(
			function(err, user) {
				if (err) {
					return next(err);
				}

				// First create the user in Stripe
				stripe.customers.create({
					source: req.body.stripeToken,
					email: user.email,
					metadata: {
						id: user.id,
						name: user.name
					}
				}).then(function(customer) {
					// Then associate the user with the correct subscription
					return stripe.subscriptions.create({
						customer: customer.id,
						plan: user.membershipType
					});
				}).then(function(subscription) {
					// Then update the user model to show that they have subscibed. Bam!
					user.paidOn = new Date();
					user.stripeSubscriptionActive = true;
					user.stripeSubscriptionId = subscription.id;
					user.save();

					locals.subscriptionSuccessful = true;

					next();
				});
			}
		);
	});

	view.render('stripe/subscribe');
};
