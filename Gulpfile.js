// Node Requirements

const fs = require( 'fs' );
const http = require('http');
const path = require( 'path' );
const spawn = require( 'child_process' ).spawn;
const browserSync = require( 'browser-sync' );

// Gulp Requirements

const gulp = require( 'gulp' );
const watch = require( 'gulp-watch' );
const rename = require( 'gulp-rename' );
const plumber = require( 'gulp-plumber' );

// CSS Requirements

const compass = require( 'gulp-compass' );
const iconfont = require( 'gulp-iconfont' );
const autoprefixer = require( 'gulp-autoprefixer' );

// Script Requirements

const babel = require( 'gulp-babel' );
const jslint = require( 'gulp-jslint' );
const uglify = require( 'gulp-uglify' );
const browserify = require( 'gulp-browserify' );
const sourcemaps = require( 'gulp-sourcemaps' );

// Templating Requirements

const nunjucks = require( 'nunjucks' );
const mkdirp = require( 'mkdirp' );

// Settings

const paths = require( './Gulppaths.js' );
const settings = require( './Gulpsettings.js' );

// Setup

function set_environment( mode ){
	
	switch( mode || process.argv.find(v => v === '--prd' || v === '--dev') ){
		
		case '--prd':
			console.log( 'Set mode to MODE_PRODUCTION' );
			settings.mode = settings.MODE_PRODUCTION;
			break;
		default:
			console.log( 'Set mode to MODE_DEVELOPMENT' );
			settings.mode = settings.MODE_DEVELOPMENT;
			break;
		
	}
	
}
function prepend_paths( list, prepend ){
	
	// Validate any paths
	// If a path start at root (/), we want it to be the root and no prepending.
	
	return list.map(item => {
		
		if( item instanceof Array ){
			
			return prepend_paths( item, prepend );
			
		} else if( typeof item === 'string' ){
			
			switch( item[ 0 ] ){
				
				case '!':
					return '!' + prepend + item.slice(1);
				case '/':
					return '.' + item;
				default:
					return prepend + item;
			
			}
			
		} else {
			
			return false;
			
		}
		
	}).filter(v => v !== false);
	
}
function gulp_all( IN, OUT, handle, type = false ){
	
	return Promise.all( IN.map((path, index, array) => {
		
		var out = OUT[ index ] || OUT[ OUT.length - 1 ];
		
		return new Promise( resolve => {
			
			function end(){
				
				console.log( `[V][${type}]: ${path} -> ${out}` );
		
				resolve( data.gulp );
				
			}
			function error(){
				
				console.log( `[X][${type}]: ${path} -> ${out}` );
		
				resolve( data.gulp );
				
			}
			function preventResolve(){
				
				gulpDest = false;
				
				return { end, error }
				
			}
			function pipe( handler){
				
				data.gulp = data.gulp.pipe( handler );
				
				return data.gulp;
				
			}
			
			var gulpDest = true;
			var data = {
				gulp: gulp.src( path ),
				pipe,
				in: path,
				out,
				preventResolve,
				index,
				array
			};
			
			pipe( plumber() );
			
			handle( data );
			
			if( gulpDest ){
			
				data.gulp.on( 'end', end );
				data.gulp.on( 'error', error );
				
				pipe( gulp.dest( out ) );
			
			}
		
		});
	
	}) );
	
}

// Server Task Runners

function gulp_saveServer(){
	
	// Creates a server that saves any JSON data to the path requested.
	
	function end( success = false, message, res ){
		
		res.writeHead( 200, {'Content-Type': 'text/json'} );
		
		res.write( '{"state":"' + (success?'true':'false') + '","message":"' + message + '"}' );
		res.end();
		
	}
	function write( path, data, res ){
		
		try {
			
			// If parsing of the data fails, no data will be saved.
			
			JSON.parse( data );
		
			fs.writeFile( '.' + path, data, (err, success) => {
				
				if( !err ){
				
					end( true, path, res );
				
				} else {
					
					end( false, err, res );
					
				}
			
			});
		
		} catch( e ){
			
			end( false, e, res );
			
		}
	
	}
	
	return http.createServer(function( req, res ){
		
		var [ path, query ] = req.url.split( '?' );
		
		query = (query || '').split( '&' ).reduce((object, pair) => {
			
			let [ key, value ] = pair.split( '=' );
			
			value = value || key;
			
			object[ key ] = value;
			
			return object;
			
		}, {})
		
		if( req.method == 'POST' ){
		
			let body = '';
			
			req.on('data', function (data) {
			
				body += data;
				
			});
			
			req.on('end', function () {
				
				write( path, body, res );
				
			});
			
		} else if( query.json ){
			
			write( path, query.json, res );
			
		} else {
		
			end( false, 'Failed (no data) for .' + path, res );
			
		}
	
	}).listen( settings.SAVESERVER.port );

}
function gulp_syncServer(){
	
	var browsersync = browserSync.create();
	
	var baseDir = settings.mode === settings.MODE_DEVELOPMENT
		? paths.io.out.dev + settings.SYNCSERVER.root
		: paths.io.out.prd + settings.SYNCSERVER.root;
		
	browsersync.init({
		server: {
			baseDir,
			ui: settings.SYNCSERVER.uiport,
			port: settings.SYNCSERVER.port
		},
		middleware: function( req, res, next ){
			res.setHeader('Access-Control-Allow-Origin', '*');
			next();
		}
    });
    
    return browsersync;
	
}
function gulp_editorServer(){
	
	function js( callback = () => {} ){
		
		if( js.processing ){
			
			js.processing.push( callback );
			
			return;
		
		} else {
			
			js.processing = [ callback ];
		
		}
		
		fs.readdir( src + 'scripts', ( err, scripts ) => {
		fs.readdir( src + 'plugins', ( err, plugins ) => {
			
			let data = [
				...(scripts || []).map( f => src + 'scripts/' + f ),
				...(plugins || []).map( f => src + 'plugins/' + f )
			].reduce((file, path) => {
				
				if( path.slice( -3 ) === '.js' ){
					
					let p = path.replace(src,'').replace('/', ': ').toUpperCase();
					
					file += `\n\n// ${p}\n${fs.readFileSync( path ).toString()}`;
					
				}
				
				return file;
				
			}, '// Compiled file');
			
			fs.writeFile( tmp + 'tmp.js', data, function( err, success ){
				
				console.log( '[css] Updated JS file' );
				
				js.processing.forEach(callback => callback( tmp + 'tmp.js' ));
				js.processing = false;
				
			});
			
		})});
		
	}	
	function css( callback = () => {} ){
	
		if( css.processing ){
			
			css.processing.push( callback );
			
			return;
		
		} else {
			
			css.processing = [ callback ];
		
		}
		
		fs.readdir( tmp, ( err, list ) => {
			
			let data = (list || []).reduce((file, path) => {
				
				if( path.slice( -4 ) === '.css' && path.indexOf( 'tmp' ) !== 0 ){
					
					let p = path.replace(src,'').replace('/', ': ').toUpperCase();
					
					file += `\n\n/* ${p} */\n${fs.readFileSync( tmp + path ).toString()}`;
					
				}
				
				return file;
				
			}, '/*Compiled CSS*/');
			
			fs.writeFile( tmp + 'tmp.css', data, function( err, success ){
				
				console.log( '[css] Updated CSS file' );
		
				css.processing.forEach(callback => callback( tmp + 'tmp.css' ));
				css.processing = false;
				
			});
			
		});
		
	}	
	function compass( callback = () => {} ){
		
		// Compile CSS file into a hidden temporary directory
		gulp_task_css( [ src + 'css/**/*.scss' ], [ tmp ], false );
		
		callback();
		
	}
	function list(){
		
		// Update listing of all files saved at the out locations
		
		let directories = paths.content.in.map(i => paths.io.in + i).filter( i => i !== out );
		
		directories.push( out );
		
		allTemplates = fs.readdirSync( templates ).filter(file => {
		
			return file.indexOf( '.json' ) > 0
		
		}).map(file => templates + file);
		allFiles = [].concat( ...directories.map(path => fs.readdirSync( path ).filter(file => {
		
			return file.indexOf( '.json' ) > 0
		
		}).map( file => path + file )) );
		
		console.log( '[list] Updated file and template list' );
		console.log( allTemplates );
		
	}
	function overview( messages, res ){
		
		list();
		
		let info = Object.assign( {}, settings.EDITOR, {
			paths: paths.content.in.reduce(( o, path ) => {
			
				o[ path.replace( out, '' ) || 'root' ] = path;
			
				return o;
			
			}, {}),
			messages: messages || []
		});
	
		res.writeHead( 200, {'Content-Type': 'text/html'} );
		res.write( nunjucks.render( src + 'templates/overview.njks', {
			allFiles, allTemplates, info
		} ) );
		res.end();
		
	}
	function edit( templateIndex, jsonIndex, res ){
		
		let info = Object.assign( {}, settings.EDITOR, {
			paths: paths.content.in.reduce(( o, path ) => {
			
				o[ path.replace( out, '' ) || 'root' ] = path;
			
				return o;
			
			}, {})
		});
		
		let json = allTemplates[ templateIndex ] || allFiles[ jsonIndex ]
			json = JSON.parse( fs.readFileSync( json ).toString() );
		
		// Set the `in` to the template JSON file.
		
		let template = !allTemplates[ templateIndex ]
			? JSON.parse( fs.readFileSync( json.meta.in ).toString() )
			: json;
		
		// Create some predefined things like templates to select.
		// Hide the self value and the predefined value in the editor.
				
		json.meta.predefined = json.meta.predefined || {};
		json.meta.predefined[ '.meta.predefined' ] = null;
		json.meta.predefined[ '.meta.self' ] = null;
		json.meta.predefined[ '.meta.in' ] = allTemplates.reduce((object, t) => {
			
			object[ t.split( '/' ).pop().split( '.' )[ 0 ] ] = t;
			
			return object;
			
		}, {});
		
		json.meta.out = json.meta.out || './';
		json.meta.self = allFiles[ jsonIndex ] || '';
		
		
		// Merge the existing data with the template object.
		// This will ensure that if an object changed template, it will update where necessary (if keys are not available they will be filled by the template).
		// No data will be lost when changing templates.
		
		Object.assign( json.meta.predefined, template.meta.predefined );
		Object.assign( template.data, json.data );
		Object.assign( template.meta, json.meta );
		
		json = JSON.stringify( template );
		
		res.writeHead( 200, {'Content-Type': 'text/html'} );
		res.write( nunjucks.render( src + 'templates/editor.njks', {
			json, allFiles, allTemplates, info
		} ) );
		res.end();
		
	}
	function get( req, res ){
	
		switch( req.url ){
			
			case '/css':
				
				// Serve the single CSS file
				
				function resolveCSS(){
				
					res.writeHead( 200, {'Content-Type': 'text/css'} );
					res.write( fs.readFileSync( tmp + 'tmp.css' ).toString() );
					res.end();
				
				};
				
				if( css.processing ){
				
					css( resolveCSS );
				
				} else {
					
					resolveCSS();
					
				}
				
				break;
			
			case '/script':
				
				// Serve the single JS file
				
				function resolveScript(){
				
					res.writeHead( 200, {'Content-Type': 'application/javascript'} );
					res.write( fs.readFileSync( tmp + 'tmp.js' ).toString() );
					res.end();
				
				};
				
				if( js.processing ){
				
					js( resolveScript );
				
				} else {
					
					resolveScript();
					
				}
				
				break;
			
			default: 
				
				if(
					req.url.indexOf( '/delete/' ) === 0
					|| req.url.indexOf( '/move/' ) === 0
				){
					
					// TODO: Use DELETE and MOVE in line with REST api
					
					// if URL is /delete/{something}
					// - copy file {something} to tmp/{something}
					// - delete original file
					// if URL is /move/{something}///{somewhere}
					// - copy file {something} to {somewhere}
					// - delete original file
					
					let command = req.url.indexOf( '/delete/' ) === 0
						? 'delete' : 'move';
					let end = message => overview([ message ], res );
					let url = req.url.replace( '/delete/', '' ).replace( '/move/', '' );
						url = url.split( '///' );
					
					if( !url[ 1 ] ){
						
						url[ 1 ] = tmp + url[ 0 ].split( '/' ).pop();
						
					}
					
					fs.readFile( url[ 0 ], function( err, buffer ){
						
						if( err ){
							
							end( `File to ${command} not found (${url[ 0 ]}).` );
						
						} else {
							
							fs.writeFile( url[ 1 ], buffer, err => {
								
								if( err ){
									
									end( `File to ${command} not writeable at (${url[ 1 ]}).` );
									
								} else {
									
									fs.unlink( url[ 0 ], err => {
										
										if( err ){
											
											end( `File to ${command} not deleteable (${url[ 0 ]}).` );
											
										} else {
											
											end( 'File ${command} from ${url[0]} to ${url[1]}.' );
											
										}
										
									});
									
								}
								
							})
							
						}
						
					});
					
				} else {
				
					// Serve either an overview
					// A new page based on a template description
					// Or an old page that can be edited and saved.
				
					let templateIndex = allTemplates.indexOf( '.' + req.url );
					let jsonIndex = allFiles.indexOf( '.' + req.url );
				
					if( templateIndex >= 0 || jsonIndex >= 0 ){
					
						edit( templateIndex, jsonIndex, res );
					
					} else {
					
						overview( null, res );
					
					}
				
				}
			
		}
		
	}
	function post( req, res ){
		
		function end(){
			
			list();
			
			res.writeHead( 200, { 'Content-Type': 'text/json' } );
			res.write(JSON.stringify( status ));
			res.end();
			
		}
		
		var json = {};
		var body = '';
		var status = { state: false, message: [ 'Initiated' ], stateIndex: 0, file: '' };
		
		req.on( 'data', function( data ){
		
			body += data;
			
		});
		
		req.on( 'end', function() {
			
			status.message.push( 'POST Body Assembled' );
			status.stateIndex++;
			
			try {
				
				json = JSON.parse( body );
				
				status.message.push( 'JSON Decoded' );
				status.stateIndex++;
				
			} catch( e ){
				
				status.message.push( e.message || 'JSON Decoding Failed (data not JSON)' );
				return end();
			
			}
			
			if( typeof json.meta.self !== 'undefined' ){
				
				var filename = json.meta.self;
				
				if( filename === '' ){
					
					var id = 1;
					var all = fs.readdirSync( out );
					
					while( all.indexOf( 'untitled-' + id + '.json' ) >= 0 ){
						
						id++;
					
					}
					
					filename = out + 'untitled-' + id + '.json';
					
					status.message.push( 'File output path created: ' + json.meta.self );
					status.stateIndex++;
					
				} else {
				
					status.message.push( 'File output path detected.' );
					status.stateIndex++;
				
				}
				
				// These were there to make the editor do its thing.
				// Remove when saving file.
				delete json.meta.predefined;
				delete json.meta.self;
				
				fs.writeFile( filename, JSON.stringify( json ), ( err, success ) => {
					
					if( err ){
						
						status.message.push( err.message || 'Error in fs.writeFile' );
						return end();
						
					} else {
						
						status.file = filename; 
						status.state = true;
						status.message.push( 'File saved at ' + filename );
						status.stateIndex++;
						return end();
						
					}
					
				});
			
			} else {
				
				status.message.push( 'No File output path detected.' );
				return end();
				
			}
			
		});
		
	}
	
	var { port, tmp, src, templates, out } = settings.EDITOR;
	var allTemplates = [];
	var allFiles = [];
	var wait;
	
	nunjucks.configure({ noCache: true });
	
	mkdirp( tmp );
	list();
	compass();
	css();
	js();
	
	watch( [ out + '**/*.json', templates + '**/*.json', ...paths.content.watch ], () => list() );
	watch( [ src + 'css/**/*.scss', src + 'plugins/**/*.scss' ], () => compass() );
	watch( [ tmp + '**/*.css', '!' + tmp + '**/tmp.css' ], () => css() );
	watch( [ src + 'scripts/**/*.js', src + 'plugins/**/*.js' ], () => js() );
	
	var server = http.createServer(function( req, res ){
		
		if( req.method == 'POST' ){
			
			post( req, res );
			
		} else if( req.method === 'GET' ){
			
			get( req, res );
			
		}
	
	}).listen( port );
	
	return server;
	
}

// Sub Task Runners

function gulp_task_css( IN = paths.css.in, OUT = paths.css.out, useIO = true ){
	
	var path = settings.mode === settings.MODE_DEVELOPMENT ? paths.io.out.dev : paths.io.out.prd;
	
	IN = useIO ? prepend_paths( IN, paths.io.in ) : IN;
	OUT = useIO ? prepend_paths( OUT, path) : OUT;
	
	return gulp_all( IN, OUT, function( gulp ){
		
		gulp.pipe( compass({
			project: fs.realpathSync( __dirname + '/.' ),
			css: gulp.out,
			sass: gulp.in.split( '*' )[ 0 ],
			style: settings.mode === settings.MODE_DEVELOPMENT ? 'nested' : 'compressed'
		}) )
		
		gulp.pipe( rename(
			path => path.extension = '.css'
		) );

		if( settings.mode === settings.MODE_PRODUCTION ){
	
			gulp.pipe( autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false
			}) );
	
		}
		
		return gulp;
	
	}, 'css');
	
}
function gulp_task_scripts( IN = paths.scripts.in, OUT = paths.scripts.out, useIO = true ){
	
	var path = settings.mode === settings.MODE_DEVELOPMENT ? paths.io.out.dev : paths.io.out.prd;
	
	IN = useIO ? prepend_paths( IN, paths.io.in ) : IN;
	OUT = useIO ? prepend_paths( OUT, path) : OUT;
	
	return gulp_all( IN, OUT, function( gulp ){
		
		if( settings.mode === settings.MODE_DEVELOPMENT ){
		
			gulp.pipe( sourcemaps.init() );
	
		}
	
		gulp.pipe( browserify() );
	
		if( settings.mode === settings.MODE_DEVELOPMENT ){
		
			gulp.pipe( sourcemaps.write() );
	
		} else if( settings.mode === settings.MODE_PRODUCTION ){
	
			gulp.pipe( babel({ presets: ['env'] }) );
			gulp.pipe( uglify() );
	
		}
		
		return gulp;
		
	}, 'scripts' );
	
}
function gulp_task_content( IN = paths.content.in, OUT = paths.content.out, useIO = true ){
	
	function parsePath( path, info ){
		
		var { out } = info;
		
		var meta, data;
		var template;
		var njksPath;
		var output;
		var filePath;
		var folderPath;
		
		return new Promise(function( resolve, reject ){
			
			fs.readFile( path, function( err, content ){
			
				try {
				
					var all = JSON.parse( content );
				
					meta = all.meta;
					data = all.data;
				
				} catch( e ){
				
					return reject();
				
				}
				
				fs.readFile( meta.in, function( err, content ){
					
					if( err ){
						
						reject();
						
					} else {
					
						template = JSON.parse( content );
						njksPath = template.meta.in;
						filePath = (meta.out.slice( -1 ) == '/'
							? out + meta.out + 'index.html'
							: out + meta.out).replace( selfReferencePathRegex, '/' );
						folderPath = filePath.split( '/' ).slice( 0, -1 ).join( '/' );
						
						output = nunjucks.render( njksPath, data );
					
						mkdirp( folderPath, function( err ){
				
							if( err ){
				
								reject();
				
							} else {
				
								fs.writeFile( filePath, output, function( err, done ){
					
									if( err ){
						
										reject();
						
									} else {
										
										resolve();
						
									}
				
								}); // fs.writeFile (output);
				
							}
			
						}); // mkdirp
						
					}
					
				}); // fs.readFile (template.json)
		
			}); // fs.readFile (data.json)
		
		}); // Promise
	
	}
	
	var selfReferencePathRegex = /\/.\//g;
	var path = settings.mode === settings.MODE_DEVELOPMENT ? paths.io.out.dev : paths.io.out.prd;
	
	IN = useIO ? prepend_paths( IN, paths.io.in ) : IN;
	OUT = useIO ? prepend_paths( OUT, path) : OUT;
		
	nunjucks.configure({ noCache: true });
	
	return gulp_all( IN, OUT, function( gulp ){
		
		var { end, error } = gulp.preventResolve();
		
		fs.readdir( gulp.in, function( err, files ){
		
			if( err ){
			
				error();
			
			} else {

				Promise.all( files.filter(
				
					filename => (filename.indexOf( '.' ) !== 0 && filename.indexOf( 'json' ) === filename.length - 4)
					
				).map(filename => {
					
					return parsePath( gulp.in + filename, gulp )
				
				}) ).then( end ).catch( error );
			
			}
		
		});
		
	}, 'content' );
	
}
function gulp_task_files( IN = paths.files.in, OUT = paths.files.out, useIO = true ){
	
	var path = settings.mode === settings.MODE_DEVELOPMENT ? paths.io.out.dev : paths.io.out.prd;
	
	IN = useIO ? prepend_paths( IN, paths.io.in ) : IN;
	OUT = useIO ? prepend_paths( OUT, path) : OUT;
		
	return gulp_all( IN, OUT, function(){}, 'files' );
	
}
function gulp_task_icons( IN = paths.icons.in, OUT = paths.icons.out, useIO = true ){
	
	var path = settings.mode === settings.MODE_DEVELOPMENT ? paths.io.out.dev : paths.io.out.prd;
	
	IN = useIO ? prepend_paths( IN, paths.io.in ) : IN;
	OUT = useIO ? prepend_paths( OUT, path ) : OUT;
	
	return gulp_all( IN, OUT, function( gulp ){
	
		function CreateSCSSandCSSFiles( glyphs, options ){
			
			var css = `@font-face { font-family: "${options.fontName}"; src: ${options.formats.map(
				format => `url("./${options.fontName}.${format}") format("${format}")`
			).join( ',' )}; }`;
			var scss = `$${options.fontName}-listing: ( ${glyphs.map(glyph => {
				
					let character = glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
				
					return `
					${glyph.name}: "\\${character}"`;
				
				}).join( ',' ) }
				);
				
				@debug 'Be sure to also @import "[PATH]/${options.fontName}.css" to make use of this font.';
				
				@mixin ${options.fontName}( $name ){
				
					$i: map-get( $${options.fontName}-listing, $name );
					
					@if $i == null {
						
						$i: map-get( $${options.fontName}-listing, 'unknown' );
					
					}
					
					@if $i != null {
						
						content: $i;
						font-family: 'icons${i}';
						color: inherit;
					
					}
				
				};
				
			`;
			
			scss = scss.replace( /(\t{4})/g, '' );
			
			console.log( out + `_${options.fontName}.scss` );
			
			fs.writeFileSync( out + `_${options.fontName}.scss`, scss );
			fs.writeFileSync( out + `${options.fontName}.css`, css );
			
		}
		
		var { index, array, out } = gulp;
		var { end, error } = gulp.preventResolve();
		var i = array.length > 1 ? '-' + (index + 1) : '';
		var fontSettings = {
			fontName: 'icons' + i,
			prependUnicode: false,
			formats: [ 'ttf', 'eot', 'woff' ]
		};
		var out = OUT[ index ] || OUT[ OUT.length - 1 ];
		
		return gulp.pipe( iconfont( fontSettings ) ).on( 'glyphs', ( glyphs, options ) => {
			
			CreateSCSSandCSSFiles( glyphs, options );
			end();
		
		});
		
	}, 'icons' );
	
}

// Global Task Runners

function gulp_task_watch(){
	
	var bs = gulp_syncServer();
	var save = gulp_saveServer();
	
	function start( task ){
		
		return function(){
			
			return gulp.start( task, () => bs.reload() );
		
		}
		
	}
    
	watch( prepend_paths( paths.css.watch, paths.io.in ), start( 'css' ) ),
	watch( prepend_paths( paths.scripts.watch, paths.io.in ), start( 'scripts' ) );
	watch( prepend_paths( paths.content.watch, paths.io.in ), start( 'content' ) );
	watch( prepend_paths( paths.files.watch, paths.io.in ), start( 'files' ) );
	
	return [ bs, save ];
	
}
function gulp_task_debug(){
	
	function destroyProcess(){
		
		if( _process ){
			
			_process.kill();
			_process = null;
			
		}
		
	}
	function makeProcess(){
		
		if( _process ){
			
			destroyProcess();
			
		}
		
		console.log( `[ DEBUG: gulp ${tasks.join(' ')} ]` );
		
		_process = spawn( 'gulp', tasks, {
			stdio: 'inherit'
		} );
		_process.on( 'close', destroyProcess );
		
	}
	
	
	var _process = null;
	var tasks = process.argv.join( ' ' )
		.split( 'debug' ).pop()
		.split( '-task' ).pop()
		.split( '-t' ).pop()
		.split( '=' ).pop()
		.split( ',' )
		.filter( t => !!t )
		.map( t => t.trim() );
		
	if( tasks.length >= 1 ){
	
		watch( './Gulpfile.js', makeProcess );
	
		makeProcess();
	
	} else {
		
		console.log( '[debug]: gulp debug --task=task1[,task2,..]' );
		
	}
	
}
function gulp_task_development(){
	
	set_environment( '--dev' );
	
	return Promise.all([
		gulp_task_css(),
		gulp_task_scripts(),
		gulp_task_files(),
		gulp_task_content()
	]).then( gulp_task_watch );
	
}
function gulp_task_production(){
	
	set_environment( '--prd' );
	
	return Promise.all([
		gulp_task_css(),
		gulp_task_scripts(),
		gulp_task_files(),
		gulp_task_content()
	]).then( gulp_task_watch );
	
}
function gulp_task_default(){
	
	// Select the task to run based on the default setting
	// or the passed in `--prd` or `--dev` parameter.	
	
	return settings.mode === settings.MODE_PRODUCTION
		? gulp_task_production()
		: gulp_task_development();
	
}

set_environment();

// Tasks

gulp.task( 'css', () => gulp_task_css() );
gulp.task( 'scripts', () => gulp_task_scripts() );
gulp.task( 'files', () => gulp_task_files() );
gulp.task( 'icons', () => gulp_task_icons() );
gulp.task( 'content', () => gulp_task_content() );

gulp.task( 'save', gulp_saveServer );
gulp.task( 'watch', gulp_task_watch );
gulp.task( 'debug', gulp_task_debug );

// General Tasks
// Set `settings.mode` and run all tasks once, reverting to `watch` after.

gulp.task( 'dev', gulp_task_development );
gulp.task( 'prd', gulp_task_production );
gulp.task( 'default', gulp_task_default );

gulp.task( 'editor', gulp_editorServer );