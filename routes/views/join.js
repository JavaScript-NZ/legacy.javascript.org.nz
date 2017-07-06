const keystone = require('keystone');
const stripe = require("stripe")(process.env.STRIPE_KEY); // TODO  - env variable here
const User = keystone.list('User');

/**
 * Rules and Conduct aren't part of the user model so have to be validated
 * seperately. Returns values that can be used to mimic the return validation
 * object from a model update.
 */
function validateAcceptance(agreeRules, agreeConduct) {
	const errors = {};
	const messages = [];

	if (!agreeRules) {
		messages.push('Please agree to the JavaScript NZ Rules')
		errors.agreeRules = {
			path: 'agreeRules'
		};
	}

	if (!agreeConduct) {
		messages.push('Please agree to the JavaScript NZ Code of Conduct');
		errors.agreeConduct = {
			path: 'agreeConduct'
		};
	}

	if (!messages.length) {
		return;
	}

	return {
		errors,
		messages
	};
}

exports = module.exports = function(req, res) {
	const view = new keystone.View(req, res),
			locals = res.locals;

	locals.section = 'join';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.joinSubmitted = false;

	view.on('post', { action: 'join' }, function joinPost(next) {
		const newUser = new User.model(Object.assign({}, req.body, {
			password: 'dummyPassword',
			agreeRules: req.body.agreeRules !== undefined,
			agreeConduct: req.body.agreeConduct !== undefined
		}));
		const updater = newUser.getUpdateHandler(req);

		// Check agreement validation seperately from the user validation
		const agreeRules = req.body.agreeRules === 'on';
		const agreeConduct = req.body.agreeConduct === 'on';
		const agreementValidation = validateAcceptance(agreeRules, agreeConduct);

		if (agreementValidation !== undefined) {
			req.flash('error', {
				title: 'There was a problem submitting your membership request:',
				list: agreementValidation.messages
			});
			locals.validationErrors = agreementValidation.errors;
			next();
			return;
		}

		updater.process(newUser, {
			flashErrors: true,
			fields: 'name, email, membershipType',
			errorMessage: 'There was a problem submitting your membership request:'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.joinSubmitted = true;

				return res.redirect('account/subscribe?userId=' + newUser.id);
			}
			next();
		});
	});

	view.render('join');
};
