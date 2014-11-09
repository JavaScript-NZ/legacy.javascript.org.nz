var keystone = require('keystone')

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res),
			locals = res.locals;

	locals.section = 'join';
	locals.formData = req.body || {};
	locals.validationErrors = {};

	view.on('post', { action: 'join' }, function(next) {
	  console.log(req.payment);
	  next()
	});

	view.render('join');

};
