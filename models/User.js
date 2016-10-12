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
	paidUntil: { type: Date, default: new Date().setYear(new Date().getFullYear() + 1) }
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

User.schema.methods.sendCommitteeEmail = function(callback) {
	console.log('sendCommitteeEmail');
	var user = this;

	var recipientQuery = keystone.list('User').model.find();

	recipientQuery.exec(function(err) {
		if (err) return callback(err);

		new keystone.Email('user-membership').send({
			to: 'james@macfie.co.nz',
			from: {
				name: 'JavaScript NZ',
				email: 'contact@javascript.org.nz'
			},
			subject: 'JavaScript NZ membership request',
			enquiry: user
		}, callback);
	});
}


/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
