var keystone = require('keystone'),
	Enquiry = keystone.list('Enquiry');
var request = require('request');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'contact' }, function(next) {

		var newEnquiry = new Enquiry.model(),
			updater = newEnquiry.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, enquiryType, message',
			errorMessage: 'There was a problem submitting your enquiry:'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
				return next();
			}

			const url = 'https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.RECAPTCHA_SECRET+ '&response=' + req.body.recaptcha + '&remoteip=' + req.connection.remoteAddress;
			/**
			 * Validate the recaptcha value that was passed back. Even if it fails we still provide a "success" message to the user. Only difference
			 * is that the committee doesn't get spammed with rubbish.
			 */
			request(url, function (error, response, body) {
				const parsedBody = JSON.parse(body);
				console.log('Enquiry received. Recaptcha success result: ' + parsedBody.success); // Log for interests sake. Curious how much spam we stop
				if (parsedBody.success === true) {
					newEnquiry.sendNotificationEmail();
				}
				locals.enquirySubmitted = true;
				next();
			});
		});

	});

	view.render('contact');

};
