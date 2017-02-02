var keystone = require('keystone');
var Nomination = keystone.list('Nomination');

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res),
		locals = res.locals;

	locals.section = 'awards';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.nominationSubmitted = false;

	view.on('post', { action: 'awards' }, function nominationPost(next) {
		var newNomination = new Nomination.model(req.body);
		var updater = newNomination.getUpdateHandler(req);

		updater.process(newNomination, {
			flashErrors: true,
			fields: 'nominationType, firstName, lastName, reason',
			errorMessage: 'There was a problem submitting your nomination:'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.nominationSubmitted = true;
				newNomination.sendCommitteeNominationEmail()
			}
			next();
		});
	});

	view.render('awards');
};
