var keystone = require('keystone'),
	User = keystone.list('User')

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res),
			locals = res.locals;

	locals.section = 'join';
	locals.formData = req.body || {};
	locals.validationErrors = {};

	view.on('post', { action: 'join' }, function(next) {

		var newUser = new User.model(),
			updater = newUser.getUpdateHandler(req);
		
		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, password, membershipType',
			errorMessage: 'There was a problem creating your membership:'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				return res.redirect('/paypal/setup');
			}
			next();
		});

	});

	view.render('join');

};
