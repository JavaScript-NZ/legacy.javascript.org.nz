var Email = require('keystone-email');
var emailDefaults = require('../src/defaults/email').emailDefaults;
var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Nomination Model
 * ==========
 */

var Nomination = new keystone.List('Nomination', {
	nocreate: true,
	noedit: true
});

Nomination.add('Award', {
		award: { type: String, required: true }
	},
	'Nomination details', {
		nominationType: { type: String, required: true, index: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		aka: { type: String },
		reason: { type: String, required: true },
		nominatedOn: { type: Types.Date, default: Date.now, noedit: true
	}
});


/**
 * Schema methods
 */

Nomination.schema.methods.sendCommitteeNominationEmail = function(callback) {
	var nomination = this;

	var recipientQuery = keystone.list('Nomination').model.find();

	recipientQuery.exec(function(err) {
		if (err) return callback(err);

		new Email('new-award.pug',emailDefaults).send({
			nomination: nomination,
		}, {
			to: 'awards@javascript.org.nz',
			from: {
				name: 'JavaScript NZ',
				email: 'contact@javascript.org.nz'
			},
			subject: 'A new nomination for ' + nomination.award
		}, callback);
	});
};

Nomination.defaultColumns = 'award, nominationType, firstName, lastName, aka, reason, nominatedOn';
Nomination.register();
