# Something Here Templating

For my site (somethinghere.net) I have been working at making a standardised templating system using a combination of Nunjucks and my own node stuff. This includes a convenient template editor (allows you to edit and add data files), default SASS/Compass compiler, Javascript compiler and Nunjucks processor.

__This document was last updated 20/03/2018. At this time I have not chosen a license yet, so this code is currently (C) Something Here 2018.__

## Install

Run the following commands in your terminal:

	npm install

Make sure `compass` is updated to the latest version, as well as `sass`.

## Run

Use the following command to do a default run:

	gulp

Use one of the following to run as production or development:

	gulp --prd
	gulp --dev

__Internally this will set settings.mode to MODE_PRODUCTION or MODE_DEVELOPMENT__

Use one of the following commands to run sub tasks:

	gulp css
	gulp scripts
	gulp content
	gulp files
	gulp icons

Append any of the above tasks with `--prd` or `--dev` to run their production and development counterparts, which will minimise code and file size where available.

Alternatively, there is also a way to edit content in `gulp editor`. See `Editor` below.

## Gulp Structure

### Gulpsettings.js

Use this to set global settings used by Gulp, such as server ports and default modes. Do not touch the constants unless you know what you are doing.

### Gulppaths.js

This file contains all paths it needs to read and output `css`, `scripts`, `nunjucks` and `files`. The following structure is uniform across this file:

#### In

	Array[ String [, ...]]

An array of **file** selection paths. Every path can contain multiple files, but each path will be read separately by the builder. This way you can run to many different paths in one go. Each of these pahts will be output in the `out` section (see below) at their corresponding index. If there is no corresponding index, the last `out` path available will be used.

__Example__ `[ './src/css/*.scss' ]`

#### Out

	Array[ String [, ...]]

An array of **directory** paths where the corresponding index of files must be written to. The filenames depend on the content, so these are strictly directory paths. If this array is shorter than the `in` array, any indexes in `in` larger than the length will use the last item in the `out` paths.

__Example__ `[ './dist/css/' ]`

#### Watch

	Array[ String [, ...]]

An array of **file** selection paths. The paths that must be watched for file changes to run the corresponding task.

__Example__ `[ './src/css/**/*.scss' ]`

## Gulp Details

### Scripts

Scripts are combined with Browserify and transpiled with Babel with the preset `env`. They are also compressed in `--prd` mode.

### CSS

Stylesheets are compiled through Compass, and will output as `nested` in `--dev` and `compressed` in `--prd`. In `--prd` it will also auto prefix with the preset `last 2 versions`, removing the need to write your own prefixes.

### Templating

Templates are parsed using Nunjucks, and use a custom data file with the following structure:

	{
		meta: {
			in: '[PATH/TO/TEMPLATE].njks',
			out: '[PATH/TO/OUTPUT/FROM/content.out/]',
			predefined: {},
			self: '[PATH/TO/JSON/FILE/myJSON.json]'
		},
		data: {}
	}

This is because it allows every piece of content to be stored in its own JSON file, as well as edit JSON files using the Editor (v0.1) by dropping the JSON file and saving it back out. The `meta/data` split is required for Gulp to process your files properly. It also does not accept wildcards in it's `in` or `out`, only folders, and it will read any JSON files it finds there. `predefined` is an object that contains paths of data that can be manipulated (like adding an item to an array). If, for example, you have a list which can be manipulated in the editor, it could like like this in the `predefined` object:

	mysection.mylist: { title: 'My Default Title' }

An `add` and `remove` button will be added by the editor, and clicking add will create a new instance of the predefined object.

**Every template requires a `template.json` file as well, which is an empty version of the data structure. It needs to be placed right next to the template in the template directory. This is for the editor to be able to add new pages. The editor does not really care where your templates are, it cares where the JSON files point to.**

The Editor _does_ care what `self` is pointing to, and if it is empty it will allow you to name a file that will be stored at `settings.EDITOR.out` when clicking save. In the editor, this property is hidden, as well as the `predefined` property.

### Files

Files will be copied as-is and the structure will be dumped into the respective out folder without changes.

### Icons

Icons will generate icon fonts. It will also generate these files:

	_[fontname].scss
	[fontname].css
	[fontname].woff
	[fontname].ttf
	[fontname].eot

The best way to include these in your site is to set the `out` to somewhere in a folder that is being watched by the `files` task, which will then copy them over. In your `scss`, be sure to include both the `scss` and an import to the path in the distribution. If, for example, your setup looks like this:

	css.in: src/css/main.scss
	css.out: dest/css/
	
	files.in: src/files/fonts/**/*
	files.out: dist/fonts
	
	icons.in: src/icons/**.svg
	icons.out: src/files/fonts/

Then in your `main.scss` file, use the following two lines:

	@import '../files/fonts/_icons.scss'
	@impurt url( '../fonts/icons.css' );
	
This will ensure the file is linked correctly and you can make use of this mixin in SCSS:

	@include icons( svgfilename );

Which will ensure the unicode bindings are always correct even when the svg unicode order changes.

### Gulp Roadmap

- Fix the problem of generating a `./dist` folder when one does not exists. Everything works, but with the dist folder it will start with errors.

## Editor (v.1@20-03-2018)

The editor will allow you to open the JSON files, edit them, and then save them out again, allowing easier changes to content. It will read templates and use a temporary folder defined in settings. Run the Editor with the following command:
	
	gulp editor

and then navigate to it at `localhost:3003`.

### Editor Roadmap

- Move over to DELETE, PUT, MOVE and other REST commands... Somehow. Since this isn't a one-way application, that might be harder.
- Add UNDO to delete (or move) commands. Delete currently moves the file to the `./.editor-tmp/` folder anyway so no files are lost at the moment (unless they had the same name).
- Merge the template and data object more thoroughly so changing the template itself will also change the predefined values appropriately **or** remove the predefined from the data itself altogether so it is only defined in the templates' JSON file. This will mean some data that has changed will probably become impossible to edit if it does not match the template, though it would not lose any data. (Probably going for option #2).
- Potentially include the editor default JSON in the `njks` file using a `{# json #}` header.
- Make editing more comfortable (not just basic inputs).
- Add the possibility to predefine the type of input to allow and use in `predefined`:


	`portfolio.list = { title: 'My Title', content: 'my Content' }`
	`portfolio.list.content = 'wysiwyg';`


(the above would make the content an HTML editor. This will only work if the value of the key is a string and not an object, so every specific type would need to be defined there separately.)