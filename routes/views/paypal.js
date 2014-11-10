var keystone = require('keystone')

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res),
			locals = res.locals;

	locals.section = 'paypal';
	locals.formData = req.body || {};
	locals.validationErrors = {};

	view.on('get', { action: 'return' }, function(next) {
	  console.log(req.payment);
	  next()
	});

	view.on('get', { action: 'cancel' }, function(next) {

		next()
	});

	view.render('join');

};
