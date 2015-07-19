var keystone = require('keystone'),
User = keystone.list('User');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res),
  locals = res.locals;

  locals.section = 'join';
  locals.formData = req.body || {};
  locals.validationErrors = {};

  view.on('post', { action: 'join' }, function(next) {
    var userData = {
      name:       req.body.name,
      email:       req.body.email,
      password:     req.body.password,
      membershipType: req.body.membershipType
     };
     var user = new User.model(userData);
     user.save(function(err) {
      if (err) {
        locals.validationErrors = err.errors;
      } else {
        return res.redirect('paypal/setup?userId=' + user.id);
      }
      next();
     });
   });

   view.render('join');

};
