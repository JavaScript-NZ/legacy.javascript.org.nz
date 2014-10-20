var keystone = require('keystone'),
    fs = require('fs'),
    marked = require('marked');

var documentMap = {
  'rules': {
    file: "/external/Society-Documentation/Rules.md",
    title: "Society Rules",
    icon: "book",
  },
  'conduct': {
    file: "/external/Society-Documentation/Code_of_Conduct.md",
    title: "Code of Conduct",
    icon: "smile",
  },
}

// This assumes a few things:
// * The headings start at level 2
// * There are only two levels of headings (level 2 and level 3)
function buildHeaderTree(tokens) {
	var headingTokens = tokens.filter(function(item) { return item.type == 'heading'; });
	var toc = [];
	var rootDepth = 2;
	var parent = null;
	headingTokens.forEach(function(token) {
		depth = token.depth;
		var heading = {
			text: token.text,
			id: makeHeaderId(token.text),
			children: []
		};
		if (depth == rootDepth) {
			toc.push(heading);
			parent = heading;
		} else {
			parent.children.push(heading);
		}
	});

	return toc;
}

function makeHeaderId(text) {
	return 'doc-' + text.trim().toLowerCase().replace(/[^\w]+/g, '-');
}

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

  var documentId = req.path.slice(1);

  if (!(documentId in documentMap)) {
    req.notFound();
    return;
  }
  var doc = documentMap[documentId];

	locals.section = documentId;
  locals.title = doc.title;
  locals.icon = doc.icon;

	var fileName = keystone.get('basedir') + doc.file;
	fs.readFile(fileName, 'utf-8', function(err, data) {
		if (err || !data || data.trim().length == 0) {
			res.err(err);
			return;
		}

		try {
			// First line is a heading we don't want.
			data = data.split("\n").slice(1).join("\n").trim();

			var tokens = marked.lexer(data);
			var headings = buildHeaderTree(tokens);

			// This should probably be cached, but marked claims it's fast enough
			// to not need caching. We'll see.
			var renderer = new marked.Renderer();
			renderer.heading = function(text, level, raw) {
				var id = makeHeaderId(text);
				return '<a name="' + id + '" class="anchor"></a>' +
				       '<h' + level + '>' +
				       text +
							 '</h' + level + '>\n';
			};

			var output = marked.parser(tokens, {
				renderer: renderer
			});

			locals.document = {
				toc: headings,
				content: output
			};

			view.render('document');
		} catch (err) {
			res.err(err);
		}
	});
};
