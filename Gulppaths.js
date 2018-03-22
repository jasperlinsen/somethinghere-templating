const excludeFiles = [ '!./**/*.afdesign', '!./**/*.ai', '!./**/*.scss' ];

const io = {
	in: './src/',
	out: {
		prd: './dist/',
		dev: './dev/'
	}
}
const css = {
	in: [
		'./css/*.scss'
	],
	out: [
		'./css/'
	],
	watch: [
		'./css/**/*.scss'
	]
};
const scripts = {
	in: [
		'./scripts/default.js'
	],
	out: [
		'./scripts/'
	],
	watch: [
		'./scripts/**/*.js'
	]
};
const content = {
	in: [
		'./content/data/'
	],
	out: [
		'./',
	],
	watch: [
		'./content/data/*.json',
		'./content/nunjucks/**/*.njks',
		'./content/templates/**/*.json'
	]
};
const files = {
	in: [
		[ './files/resources/**/*', ...excludeFiles ],
		[ './files/images/**/*', ...excludeFiles  ],
		[ './files/fonts/**/*', ...excludeFiles ]
	],
	out: [
		'./resources/',
		'./images/',
		'./fonts/'
	],
	watch: [
		'./files/**/*'
	]
};
const icons = {
	in: [
		'./icons/**.svg'
	],
	out: [
		'./files/fonts/'
	],
	watch: [
		'./icons/**.svg'
	]
};

module.exports = { io, css, scripts, files, content, icons };