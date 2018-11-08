var Email = require('keystone-email');
var emailDefaults = require('../src/defaults/email').emailDefaults;
var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: String, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	groups: { type: Types.Relationship, ref: 'UserGroup', many: true },
	registeredOn: { type: Types.Date, default: Date.now, noedit: true },
}, 'Membership', {
	membershipType: { type: Types.Select, options: 'unpaid, student, regular', required: true, emptyOption: false, default: 'unpaid' },
	paidUntil: { type: Date },
	stripeSubscriptionActive: { type: Boolean, label: 'Active subscription' },
	stripeSubscriptionId: { type: String, noedit: true }
}, 'Profile', {
	visibility: { type: Types.Select, options: [{value: 0, label: 'Committee only'}, {value: 1, label: 'Members only'}, {value: 2, label: 'Public'}], required: true, emptyOption: false, default: 0, initial: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true, default: false },
	committeeRole: { required: false, type: Types.Select, options: 'officer, treasurer, secretary, president, member' }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});


/**
 * Relationships
 */

User.relationship({ ref: 'Post', path: 'author' });

/**
 * Schema methods
 */

User.schema.methods.sendMembershipEmail = function(callback) {
	var user = this;

	var recipientQuery = keystone.list('User').model.find();

	recipientQuery.exec(function(err) {
		if (err) return callback(err);

		console.log('Sending committee email')
		new Email('membership-committee', emailDefaults).send({
			user: user
		}, {
			to: 'society@javascript.org.nz',
			from: {
				name: 'JavaScript NZ',
				email: 'contact@javascript.org.nz'
			},
			subject: 'New JavaScript NZ member'
		}, callback);

		console.log('Sending membership email')
		new Email('membership-user', emailDefaults).send({
			user: user
		}, {
			to: user.email,
			from: {
				name: 'JavaScript NZ',
				email: 'contact@javascript.org.nz'
			},
			subject: 'Your JavaScript NZ membership'
		}, callback);
	});
}


User.schema.methods.sendCancellationEmail = function(callback) {
	var user = this;

	var recipientQuery = keystone.list('User').model.find();

	recipientQuery.exec(function(err) {
		if (err) return callback(err);

	new Email('cancellation-user', emailDefaults).send({
			to: user.email,
			from: {
				name: 'JavaScript NZ',
				email: 'contact@javascript.org.nz'
			},
			subject: 'Your JavaScript NZ membership cancellation'
		}, {
			user: user
		}, callback);
	});
}

/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
