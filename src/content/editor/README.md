# Editor

The editor can be used to edit any of the files defined in either `settings.EDITOR.out` (default `root` path to store your data files) or `paths.content.out` (a list of particularly root directories). Start the editor by running

	gulp editor

a the root of this repository. After that, navigate to:

	localhost:3003

Any path passed to this server that does not match either a data file or a template JSON file, will show you a list of all available files and templates.

## Template Structure

The most important part for the Editor are the templates `.json` files. They need to be in one folder in particular, defined in `settings.EDITOR.templates`. This file contains hints for the editor as to how to handle inputs. It is structured like this:

	{
		meta: {
			in:String,
			out:String,
			predefined:Object,
			self:String
		},
		data: {}
	}

### Meta

The meta object contains data regarding the template itself.

#### In

**This value is also required for the DATA JSON.**

The `in` String defines where the template is located from the root of the repository. You can define a different location for the actual files. This will point to a `nunjucks` file, which we give the extension `.njks`.

#### Out

**This value is also required for the DATA JSON.**

The `out` String defines where the template's compiled version will be output to. This string has no effect in the template's own JSON, but is important once we start building, so this will need to be filled in. It is empty in the template JSON.

#### Predefined

This `object` will tell the editor how you would like to edit certain values. It allows you to define default objects that will be used when adding to an array. As an example, let's presume I want to make a list of items. In the data object it will be stored at `items`. I want it to have a `type`, `title` and `content`. `title` is just a text string, `content` is editable HTML using a WYSIWYG editor and `type` will be a dropdown list of available types (lets say `a`, `b` and `c`). Your template JSON file will look like this:
	
	{
		"meta": {
			"predefined": {
				"list": {
					"title": "Default Title",
					"content": "Default Content",
					"type": "a"
				},
				"list.type": {
					"Type A": "a",
					"Type B": "b",
					"Type C": "c",
				},
				"list.content": "wysiwyg"
			}
		},
		"data":{
			"list":[]
		}
	}

Only `array` and `string` types of JSON values will be editable in this way. The `wysiwyg` editor will need to be included using your own scripts (currently this is not included), and can be made editable by targetting `data-editor="wysiwyg"`, as each `input` will receive this if there is a predefined string associated with its path location.

The predefined object also has a couple of values filled in only when editing. When a value, set to `null`, is predefined, it will not show up in the editor. This is how `self` and `predefined` itself get hidden from the editor interface:

	".meta.predefined": "null",
	".meta.self": "null"

The editor also adds a list of templated to the predefined for the `.meta.in` value.

### Self

Self is used by the editor to store where the file is located, and it will save to this location when prompted. By default, this is hidden in the editor. When self is empty, clicking 'save' will prompt the user to enter a filename for the content, which will then be saved at `settings.EDITOR.out`.


## Roadmap

- Move over to DELETE, PUT, MOVE and other REST commands... Somehow. Since this isn't a one-way application, that might be harder.
- Add UNDO to delete (or move) commands. Delete currently moves the file to the `./.editor-tmp/` folder anyway so no files are lost at the moment (unless they had the same name).
- Make editing more comfortable (not just basic inputs).
- Add the possibility to predefine the type of input to allow and use in `predefined`:


	`portfolio.list = { title: 'My Title', content: 'my Content' }`
	`portfolio.list.content = 'wysiwyg';`


(the above would make the content an HTML editor. This will only work if the value of the key is a string and not an object, so every specific type would need to be defined there separately.)