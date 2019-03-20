const keystone = require("keystone");
const User = keystone.list("User");
const SLACK_INVITER_URL =
	process.env.SLACK_INVITER_URL || "https://jsnz-wheelie.herokuapp.com/signup";
const request = require("request");
const TEAM_ID = process.env.TEAM_ID || "T09HZENRK";
/**
 * Rules and Conduct aren't part of the user model so have to be validated
 * seperately. Returns values that can be used to mimic the return validation
 * object from a model update.
 */
function validateAcceptance(agreeConduct) {
	const errors = {};
	const messages = [];

	if (!agreeConduct) {
		messages.push("Please agree to the JavaScript NZ Code of Conduct");
		errors.agreeConduct = {
			path: "agreeConduct"
		};
	}

	if (!messages.length) {
		return;
	}

	return {
		errors,
		messages
	};
}

exports = module.exports = function(req, res) {
	const view = new keystone.View(req, res),
		locals = res.locals;

	locals.section = "slack";
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.joinSubmitted = false;
	view.on("post", { action: "slack" }, function joinSlack(next) {
		const agreeConduct = req.body.agreeConduct === "on";
		console.log({ agreeConduct });
		const agreementValidation = validateAcceptance(agreeConduct);
		if (!req.body.name) {
			req.flash("error", {
				title: "There was a problem submitting your sign up request:",
				list: ["Please let us know your name"]
			});
			locals.validationErrors.name = {
				path: "name"
			};
			next();
			return;
		}
		if (!req.body.email) {
			req.flash("error", {
				title: "There was a problem submitting your sign up request:",
				list: ["Please let us know your email address"]
			});
			locals.validationErrors.email = {
				path: "email"
			};
			next();
			return;
		}
		if (agreementValidation !== undefined) {
			req.flash("error", {
				title: "There was a problem submitting your sign up request:",
				list: agreementValidation.messages
			});
			locals.validationErrors = agreementValidation.errors;
			next();
			return;
		}
		request.post(
			{
				url: `${SLACK_INVITER_URL}`,
				form: {
					name: req.body.name,
					email: req.body.email,
					team_id: TEAM_ID,
					coc: req.body.agreeConduct,
					about: req.body.about
				}
			},
			(err, res) => {
				if (err) {
					req.flash("error", {
						title: "There was a problem submitting your sign up request:",
						list: err.message
					});
					next();
					return;
				} else {
					locals.joinSubmitted = true;
					next();
				}
			}
		);
	});
	view.render("slack");
};
