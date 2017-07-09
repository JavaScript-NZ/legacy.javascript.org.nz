var keystone = require('keystone');
var stripe = require("stripe")(process.env.STRIPE_KEY);
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

				if (!user.stripeSubscriptionActive) {
					// User does not have an active subscription. Redirect
					return res.redirect('/');
				}

				locals.user = user;
				return next();
			}
		);
	});

	view.on('post', { action: 'cancel' }, function cancelPost(next) {
		User.model.findById(req.query.userId).exec(
			function(err, user) {
				if (err) {
					return next(err);
				}

				// Çancel the subscription
				stripe.subscriptions.del(user.stripeSubscriptionId)
				.then(function() {
					// Then update the user model to remove the subscription details
					user.stripeSubscriptionActive = false;
					user.stripeSubscriptionId = null;
					user.save();

					locals.cancellationSuccessful = true;

					next();
				});
			}
		);
	});

	view.render('stripe/cancel');
};
