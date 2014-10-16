var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * UserGroup Model
 * ==================
 */

var UserGroup = new keystone.List('UserGroup', {
	autokey: { from: 'name', path: 'key', unique: true }
});

UserGroup.add({
	name: { type: Types.Text, required: true }
});

UserGroup.relationship({ ref: 'User', path: 'groups' });

UserGroup.register();
