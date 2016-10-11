// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone'),
	cons = require('consolidate'),
	nunjucks = require('nunjucks');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

nunjucks.configure(undefined, {
	watch: false
});

keystone.init({
	'name': 'JavaScript NZ',
	'brand': 'JavaScript NZ',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'html',
	'custom engine': cons.nunjucks,

	'emails': 'templates/emails',

	'404': 'errors/404',
	'500': 'errors/500',

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
	'cookie secret': 'x`PkSgeo4Z6Q<X_!$|T;+:zNZc*Q"B+}pw9,5=Rd3Iak+oS{uV`~I~oxTtK5C,}T',

	'cloudinary config': process.env.CLOUDINARY_URL || 'cloudinary://dummy:dummy@dummy',

	'mandrill api key': process.env.MANDRILL_API_KEY || 'dummy',
	'mandrill username': process.env.MANDRILL_USERNAME || 'dummy',

	'basedir': __dirname
});

// Load your project's Models

keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

// Load your project's Routes

keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

keystone.set('email locals', {
	logo_src: '/images/logo-48.png',
	logo_width: 194,
	logo_height: 76,
	theme: {
		email_bg: '#f9f9f9',
		link_color: '#2697de',
		buttons: {
			color: '#fff',
			background_color: '#2697de',
			border_color: '#1a7cb7'
		}
	}
});

// Load your project's email test routes

keystone.set('email tests', require('./routes/emails'));

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
	'posts': ['posts', 'post-categories'],
	'galleries': 'galleries',
	'enquiries': 'enquiries',
	'users': ['users', 'user-groups']
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();
