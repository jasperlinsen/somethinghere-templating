// Constants

const MODE_DEVELOPMENT = Symbol();
const MODE_PRODUCTION = Symbol();
const SYNC_SERVER_PORT = 3000;
const SYNC_UI_SERVER_PORT = 3001;
const SAVE_SERVER_PORT = 3002;
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
	SAVE_SERVER_PORT,
	SYNC_SERVER_PORT,
	EDITOR
};