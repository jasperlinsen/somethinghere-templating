const excludeFiles = [ '!./**/*.afdesign', '!./**/*.ai', '!./**/*.scss' ];

const css = {
	in: [
		'./src/css/*.scss'
	],
	out: [
		'./dist/css/'
	],
	watch: [
		'./src/css/**/*.scss'
	]
};
const scripts = {
	in: [
		'./src/scripts/default.js'
	],
	out: [
		'./dist/scripts/'
	],
	watch: [
		'./src/scripts/**/*.js'
	]
};
const content = {
	in: [
		'./src/content/data/'
	],
	out: [
		'./dist/',
	],
	watch: [
		'./src/content/data/*.json',
		'./src/content/templates/**/*.njks'
	]
};
const files = {
	in: [
		[ './src/files/resources/**/*', ...excludeFiles ],
		[ './src/files/images/**/*', ...excludeFiles  ],
		[ './src/files/fonts/**/*', ...excludeFiles ]
	],
	out: [
		'./dist/resources/',
		'./dist/images/',
		'./dist/fonts/'
	],
	watch: [
		'./src/files/**/*'
	]
};
const icons = {
	in: [
		'./src/icons/**.svg'
	],
	out: [
		'./src/files/fonts/'
	],
	watch: [
		'./src/icons/**.svg'
	]
};

module.exports = { css, scripts, files, content, icons };