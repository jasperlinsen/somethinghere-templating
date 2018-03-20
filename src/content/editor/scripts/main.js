function makeTabs( root = document, nav = document.querySelector( '#tabs' ) ){
	
	nav.innerHTML = '';
	
	var tabs = [ ...root.querySelectorAll( '.tab' ) ].map((tab, index) => {
		
		if( !tab.id ){
			
			let id = 0;
			
			while( document.querySelector( 'tab-' + id ) ){
				
				id++;
			
			}
			
			tab.id = 'tab-' + id;
			
		}
		
		var anchor = document.createElement( 'a' );
		var anchorItem = document.createElement( 'li' );
		
		if( index === 0 ){
			
			tab.classList.add( 'active' );
			anchor.classList.add( 'active' );
			
		}
		
		anchor.textContent = tab.id;
		anchor.href = '#' + tab.id;
		anchor.addEventListener( 'click', event => {
			
			event.preventDefault();
			
			tabs.forEach(d => {
				
				if( d.tab === tab ){
		
					d.tab.classList.add( 'active' );
					d.anchor.classList.add( 'active' );
		
				} else {
		
					d.tab.classList.remove( 'active' );
					d.anchor.classList.remove( 'active' );
		
				}
	
			});
			
		});
		
		anchorItem.appendChild( anchor );
		nav.appendChild( anchorItem );
		
		return { tab, anchor };
		
	});

};
function makeFiles( root = document ){
	
	[ ...root.querySelectorAll( 'a.file' ) ].forEach(anchor => {
		
		anchor.innerHTML = anchor.textContent.split('/').map(s => `<span>${s}</span>`).join('');
		[ ...anchor.childNodes ].pop().classList.add( 'file-name' );
		
	});
	
	[ ...root.querySelectorAll( '.file-delete' ) ].forEach(anchor => {
		
		anchor.addEventListener('click', event => {
			
			if( !confirm( 'Delete this data? (Data deleted cannot be recovered!)' ) ){
				
				event.preventDefault();
				
			}
			
		});
		
	});
	
	if( moveToPaths ){
	
		[...root.querySelectorAll( '.file-move' ) ].forEach(anchor => {
	
			var href = anchor.getAttribute( 'href' );
	
			anchor.addEventListener( 'click', event => {
		
				event.preventDefault();
				
				var file = href.split( '/' ).pop();
				var origin;
				var popover = document.createElement( 'div' );
				var wrapper = document.createElement( 'div' );
				var select = document.createElement( 'select' );
				var button = document.createElement( 'input' );
				var cancel = document.createElement( 'input' );
				
				Object.keys( moveToPaths ).map(key => {
					
					let value = moveToPaths[ key ];
					let matches = href.indexOf( value ) >= 0 ? 1 : 0;
					
					return { key, value, matches };
					
				}).sort((a,b) => b.matches - a.matches).forEach((data, index) => {
					
					var { key, value, matches } = data;
					var option = document.createElement( 'option' );
					
					option.textContent = key;
					option.value = value;
					
					select.appendChild( option );
					
					if( matches === 1 && index === 0 ){
						
						option.selected = true;
						origin = moveToPaths[ key ];
					
					}
					
					select.appendChild( option );
			
				});
				
				button.type = 'button';
				button.value = 'Move';
				button.addEventListener( 'click', event => {
					
					var message = `Move '${file}' from '${origin}' to '${select.value}'?`;
					
					if( origin !== select.value && confirm( message ) ){
						
						location.href = '/move/' + origin + file + '///' + select.value + file;
						
					} else if( origin === select.value ){
						
						popover.parentNode.removeChild( popover );
						
					}
					
				});
				
				cancel.type = 'button';
				cancel.value = 'Cancel';
				cancel.addEventListener( 'click', event => {
					
					popover.parentNode.removeChild( popover );
					
				});
				
				popover.classList.add( 'popover' );
				
				popover.appendChild( wrapper );
				wrapper.appendChild( select );
				wrapper.appendChild( button );
				wrapper.appendChild( cancel );
				
				document.body.appendChild( popover );
		
			});
	
		})
	
	}
	
}
function makeMessages( root = document ){
	
	[ ...document.querySelectorAll( '.message' ) ].forEach((message, i, a) => {
		
		console.log( 'MESSAGE: ' + message.textContent );
		
		message.style.animationDelay = 10 + 10 * i + 's';
		message.style.zIndex = 120 - i;
		message.addEventListener( 'animationend', event => {
			
			message.parentNode.removeChild( message );
			
		});
		message.addEventListener( 'click', event => {
			
			event.preventDefault();
			
			message.classList.add( 'out' );
			
		});
		
	})

}

function clone_object( object ){
	
	if( typeof object === 'string' || typeof object === 'number' || typeof object === 'boolean' ){
		
		return object;
		
	} else if( object instanceof Array ){
		
		return object.map( clone_object );
		
	} else if( typeof object === 'object' ){
		
		return Object.keys( object ).reduce(( o, k ) => {
			
			o[ k ] = clone_object( object[ k ] );
			
			return o;
			
		}, {});
		
	}
	
}
function message( content, duration = null, state = null ){
	
	if( !content ){
		
		main.removeAttribute( 'data-message' );
		
	} else {
		
		main.setAttribute( 'data-message', content );
		
	}
	
	if( duration ){
		
		clearTimeout( message.timeout );
		message.timeout = setTimeout( () => message( null ), duration );
		
	}
	
	if( message.state ){
		
		document.body.classList.remove( 'state--' + message.state );
		message.state = null;
		
	}
	
	if( state ){
		
		document.body.classList.add( 'state--' + state );
		message.state = state;
		
	}
	
}
function save( data ){
	
	return new Promise(function( resolve, reject){
	
		var request = new XMLHttpRequest();

		request.addEventListener( 'error', reject );
		request.addEventListener( 'readystatechange', function(){
	
			if( request.status === 200 && request.readyState === 4 ){
			
				let success = JSON.parse( request.responseText );
			
				if( success.state === true ){
			
					resolve( success );
			
				} else {
				
					reject( success );
				
				}
	
			} else if( request.readyState === 4 ){
				
				reject({ state: false, message: [ error.message || error ] });
				
			}
	
		});

		request.open( 'POST', location.href );
		request.send( data );

	});
	
}

function make_json_string( data, path ){
	
	var input = document.createElement( 'input' );
	var predefined = json.meta.predefined[ path.replace( '.data.', '' ).replace( /[0-9\[\]]+/gi, '' ) ];
	
	if( typeof predefined === 'object' ){
		
		input = document.createElement( 'select' );
		
		Object.keys( predefined ).forEach(key => {
			
			let option = document.createElement( 'option' );
			
			option.textContent = key;
			option.value = predefined[ key ];
			
			input.appendChild( option );
			
			if( option.value === data ){
				
				option.setAttribute( 'selected', true );
				
			}
			
			if( option.value === '' ){
				
				option.setAttribute( 'disabled', true );
				
			}
			
		});
		
		console.log( json, predefined, input );
		
	} else if( typeof predefined === 'string' ){
		
		input.setAttribute( 'data-editor', predefined );
		input.type = 'text';
		input.value = data;
		
	} else {
		
		input.type = 'text';
		input.value = data;
		
	}
	
	input.name = path;
	input.addEventListener( 'change', event_change_input )
	
	return input;
	
}
function make_json_boolean( data, path ){
	
	var input = document.createElement( 'input' );
	var predefined = json.meta.predefined[ path.replace( '.data.', '' ).replace( /\[[0-9]\]/gi, '[]' ) ];
	
	if( predefined === null ) return null;
	
	input.type = 'checkbox';
	input.value = data;
	input.name = path;
	input.addEventListener( 'change', event_change_input )
	
	return input;
	
}
function make_json_number( data, path ){
	
	var input = document.createElement( 'input' );
	var predefined = json.meta.predefined[ path.replace( '.data.', '' ).replace( /\[[0-9]\]/gi, '[]' ) ];
	
	if( predefined === null ) return null;
	
	input.type = 'number';
	input.value = data;
	input.name = path;
	input.addEventListener( 'change', event_change_input )
	
	return input;
	
}
function make_json_array( data, path, parent ){

	var arrayEditable = json.meta.predefined[ path.replace( '.data.', '' ).replace( /\[[0-9]\]/gi, '[]' ) ];
	
	if( arrayEditable === null ) return null;
	
	var array = document.createElement( 'div' );
	
	array.setAttribute( 'name', path );
	array.setAttribute( 'type', 'array' );
	array.addEventListener( 'click', event_click_toggle_expand );
	
	data.forEach(( item, index ) => {
		
		let p = `${path}[${index}]`;
		let predefined = json.meta.predefined[ p.replace( '.data.', '' ).replace( /\[[0-9]\]/gi, '[]' ) ];
	
		if( predefined === null ) return null;
		
		let label = document.createElement( 'label' );
		label.textContent = index;
	
		label.addEventListener( 'click', event => {
		
			label.classList.toggle( 'expand' );
		
		})
		array.appendChild( label );
		
		let s = make_json_editor( item, array, p );
		
		if( arrayEditable ){
			
			let remove = document.createElement( 'input' );
			remove.type = 'button';
			remove.value = 'remove';
			remove.addEventListener('click', e => {
				
				data.splice( index, 1 );
				array.innerHTML = '';
				make_json_editor( data, array, path );
				
			})
			
			s.appendChild( remove );
			
		}
		
	});
	
	if( arrayEditable ){
	
		let add = document.createElement( 'input' );
		add.type = 'button';
		add.value = 'add';
		add.addEventListener('click', e => {
			
			data.push( clone_object( arrayEditable ) );
			array.innerHTML = '';
			make_json_editor( data, array, path );
			
		})
		
		array.appendChild( add );
		
	}
	
	return array;
	
}
function make_json_object( data, path, parent ){
	
	var object = document.createElement( 'div' );
	
	object.setAttribute( 'name', path );
	object.setAttribute( 'type', 'object' );
	object.addEventListener( 'click', event_click_toggle_expand );
	
	Object.keys( data ).forEach(key => {
	
		let p = `${path}.${key}`;
		let predefined = json.meta.predefined[ p.replace( '.data.', '' ).replace( /\[[0-9]\]/gi, '[]' ) ];
	
		if( predefined === null ) return null;
	
		let label = document.createElement( 'label' );
		label.textContent = key;
		
		label.addEventListener( 'click', event => {
			
			label.classList.toggle( 'expand' );
			
		})
		object.appendChild( label );
		
		let s = make_json_editor( data[ key ], object, p );
		
	});
	
	return object;
	
}
function make_json_editor( data, parent, path = '' ){
	
	var predefined = json.meta.predefined[ path.replace( '.data.', '' ).replace( /\[[0-9]\]/gi, '[]' ) ];
	
	if( predefined === null || data === null ) return null;
	
	if( typeof data === 'string' ){
		
		item = make_json_string( data, path );
		
	} else if( typeof data === 'boolean' ){
		
		item = make_json_boolean( data, path );
		
	} else if( typeof data === 'number' ){
		
		item = make_json_number( data, path );
		
	} else if( data instanceof Array ){
		
		item = make_json_array( data, path, parent );
		
	} else if( typeof data === 'object' ){
		
		item = make_json_object( data, path, parent );
		
	}
	
	if( item && parent ){
	
		parent.appendChild( item );
	
	}
	
	return item;
	
}
function make_json_editor_init( data, parent ){
	
	json = data;
	parent.innerHTML = '';
	
	if( json.meta.self ){
		
		// Only allow saving when changes have happened
		saveButton.disabled = true;
		
	}
	
	title.textContent = json.meta.self.split( '/' ).pop().replace( '.json', '' );
	
	let _data = make_json_editor( json.data, null, '.data' );
	let _meta = make_json_editor( json.meta, null, '.meta' );
	
	_data.id = 'data';
	_meta.id = 'meta';
	_data.classList.add( 'tab' );
	_meta.classList.add( 'tab' );
	
	parent.appendChild( _data );
	parent.appendChild( _meta );
	
	makeTabs();
	
}

function event_click_toggle_expand( event ){
	
	var type = event.target.getAttribute( 'type' );
	
	if( type == 'array' || type == 'object' ){ 
	
		event.target.classList.toggle( 'expand' );
	
	}
	
}
function event_change_input( event ){
	
	var trace = event.target.name.split( /[\.\[\]]/gi ).filter(l => l.length);
	
	trace.filter(l => l.length).reduce(( parent, key, i, all ) => {
		
		if( !parent ) return false;
		
		if( i === all.length - 1 ){
			
			parent[ key ] = event.target.value;
			
		} else {
		
			return parent[ key ];
		
		}
		
	}, json);
	
	saveButton.disabled = false;
	
}
function event_save( event ){
	
	if( json.meta.self == '' ){
		
		let name = prompt( 'Save as...' );
		
		if( name !== null && validFilename.test( name ) ){
			
			json.meta.self = `{{info.out}}${name}.json`;
			
		} else if( name !== null ){
			
			alert( 'Not a valid filename. Please use uppercase characters, lowercase characters, numbers, - and _.' );
			
			return;
			
		} else {
			
			return;
			
		}
		
	}
	
	message( 'Saving...' );

	save( JSON.stringify( json ) ).then(reply => {
	
		history.pushState({}, reply.file, '/' + reply.file);
	
		json.meta.self = reply.file;
	
		make_json_editor_init( json, editor );
		
		saveButton.disabled = true;
	
		message( 'Saving complete', 2000, 'success' );
	
	}).catch(reply => {
	
		message( 'An error occurred while saving...', 2000, 'fail' );
		console.log( reply );
	
	});
	
}
