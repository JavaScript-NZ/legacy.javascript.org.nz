var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	groups: { type: Types.Relationship, ref: 'UserGroup', many: true },
	registeredOn: { type: Types.Date, default: Date.now, noedit: true },
}, 'Membership', {
	membershipType: { type: Types.Select, options: 'unpaid, student, regular', required: true, emptyOption: false, default: 'unpaid' },
	paidUntil: { type: Types.Date },
}, 'Profile', {
	visibility: { type: Types.Select, options: [{value: 0, label: 'Committee only'}, {value: 1, label: 'Members only'}, {value: 2, label: 'Public'}], required: true, emptyOption: false, default: 0, initial: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	committeeRole: { type: Types.Select, options: 'officer, treasurer, secretary, president' }
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
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
