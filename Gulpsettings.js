// Constants

const MODE_DEVELOPMENT = Symbol();
const MODE_PRODUCTION = Symbol();
const SAVESERVER = {
	port: 3002
};
const SYNCSERVER = {
	port: 3000,
	uiport: 3001,
	root: './'
};
const EDITOR = {
	port: 3003,
	src: './src/content/editor/',
	templates: './src/content/templates/',
	tmp: './.editor-tmp/',
	out: './src/content/data/'
};

// Variables

var mode = MODE_DEVELOPMENT; // Default mode when running gulp.

module.exports = {
	mode,
	MODE_PRODUCTION,
	MODE_DEVELOPMENT,
	SAVESERVER,
	SYNCSERVER,
	EDITOR
};