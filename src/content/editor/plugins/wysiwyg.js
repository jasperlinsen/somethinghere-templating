
plugins.wysiwyg = function(){
	
	console.log( 'WYSIWYG Editor initialised' );
	
	return function( data, Editor ){
		
		function createButton( face ){
			
			var button = Editor.createElement( 'li' );
			var link = Editor.createElement( 'a' );
			
			link.textContent = face;
			
			button.appendChild( link );
			
			return button;
			
		}
		
		const insideNodes = function(){
			
			function clickHandlerConstructor( _tagName ){
				
				// This will allow adding of tags inside nodes.
				// They can only fire if we are _inside_ the same text node!
			
				var tag = _tagName.toLowerCase();
				var fuseTagRegex = new RegExp( `<\/${tag}>(\s{0,})<${tag}>`, 'g' );
				
				return function( event ){
					
					event.preventDefault();
					
					if( selected === null ){
					
						return;
				
					}
				
					var { end, node, start } = selected;
					var { parentNode, tagName, innerText, outerHTML, innerHTML } = node;
					
					var isEntireContent = start === 0 && end == innerText.length;
					
					if( start !== end && !isEntireContent ){
					
						if( node.tagName !== _tagName ){
					
							let newHTML = innerHTML.split('');
				
							newHTML.splice( end, 0, `</${tag}>` );
							newHTML.splice( start, 0, `<${tag}>` );
				
							node.innerHTML = newHTML.join('');
							
							selected = null;
					
							console.log( 'add', start );
						
						}
						
						parentNode.innerHTML = parentNode.innerHTML.replace( fuseTagRegex, '' );
				
					} else {
						
						// Carret is inside Node
						// Insert or remove the tag node when clicked.
							
						if( node.tagName !== _tagName ){
							
							node.innerHTML = `<${tag}>${node.innerHTML}</${tag}>`;
							
							selected.node = node.querySelector( tag );
							
						} else {
							
							parentNode.innerHTML = parentNode.innerHTML.replace(
								outerHTML,
								innerHTML
							);
							
							selected.node = parentNode;
						
						}
						
					}
					
					update();
					active();
				
				}
			
			}
			function create( tagName, buttonName ){
			
				var button = createButton( buttonName );
				var name = tagName.toUpperCase();
				
				button.setAttribute( 'name', name );
				button.addEventListener( 'click', clickHandlerConstructor( name ) )
				button.addEventListener( 'click', update )
				
				domElement.appendChild( button );
			
			}
			function check(){
				
				// Still work to do here
				
				var { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
				var singleNode = anchorNode === focusNode;
				var isCollapsed = anchorOffset !== focusOffset;
				
				if( singleNode && anchorNode.parentNode ){
				
					selected = {
						start: Math.min( anchorOffset, focusOffset ),
						end: Math.max( anchorOffset, focusOffset ),
						node: anchorNode.parentNode
					};
					
					active();
					enable();
				
				} else {
				
					selected = null;
					
					active();
					disable();
				
				}
			
			}
			function active(){
				
				[ ...domElement.childNodes ].forEach(button => {
					
					if( selected && selected.node.tagName === button.getAttribute( 'name' ) ){
						
						button.classList.add( 'active' );
						
					} else {
						
						button.classList.remove( 'active' );
						
					}
					
				});
				
			}
			function disable(){
				
				domElement.classList.add( 'disabled' );
				
			}
			function enable(){
				
				domElement.classList.remove( 'disabled' );
				
			}
			
			var selected = null;
			var domElement = Editor.createElement( 'ul' );
			
			domElement.classList.add(
				'plugins-wysiwyg-toolbar-group',
				'plugins-wysiwyg-items-insideNode'
			);
			
			return { domElement, create, check, disable, enable };
		
		}();
		const classableNodes = function(){
			
			// TODO: Make it so you can have multiple classes per option
			// AKA `button primary` will check for both classNames (otherwise classList breaks!)
			
			function create( tagName, classList ){
				
				list[ tagName.toUpperCase() ] = classList;
			
			}
			function check(){
				
				// Still work to do here
				
				var { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
				var singleNode = anchorOffset === focusOffset && anchorNode === focusNode;
				
				if( singleNode && selected !== anchorNode.parentNode ){
					
					selected = anchorNode.parentNode;
					
					console.log( selected );
					
					active();
					
				} else if( !singleNode ){
					
					disable();
					
				}
			
			}
			function active( node ){
				
				selectElement.innerHTML = '';
				
				if( selected && list[ selected.tagName.toUpperCase() ] ){
					
					let hasClass = false;
					
					list[ selected.tagName.toUpperCase() ].forEach(_class => {
						
						let option = document.createElement( 'option' );
						
						option.value = _class;
						option.textContent = _class;
						
						if( selected.classList.contains( _class ) ){
							
							hasClass = true;
							option.selected = selected.classList.contains( _class );
						
						}
						
						selectElement.appendChild( option );
						
					});
					
					let option = document.createElement( 'option' );
					
					option.textContent = 'None';
					option.value = '';
					option.selected = !hasClass;
					
					selectElement.insertBefore( option, selectElement.childNodes[ 0 ] );
					
					enable();
					
				} else {
					
					disable();
					
				}
				
			}
			function disable(){
				
				selectElement.disabled = true;
				domElement.classList.add( 'disabled' );
				
			}
			function enable(){
				
				selectElement.disabled = false;
				domElement.classList.remove( 'disabled' );
				
			}
			
			var list = {};
			var selected = null;
			var domElement = Editor.createElement( 'div' );
			var selectElement = Editor.createElement( 'select' );
			
			domElement.appendChild( selectElement );
			domElement.classList.add(
				'plugins-wysiwyg-toolbar-group',
				'plugins-wysiwyg-items-classableNodes'
			);
			
			selectElement.addEventListener( 'change', event => {
				
				if( selected && list[ selected.tagName.toUpperCase() ] ){
					
					let _list = list[ selected.tagName.toUpperCase() ];
					
					if( _list ){
						
						selected.classList.remove( ..._list );
						
						if( selectElement.value ){
						
							selected.classList.add( selectElement.value );
						
						}
					
					}
					
				}
				
			});
			
			disable();
			
			return { domElement, create, check, disable, enable };
		
		}();
		const insertableNodes = function(){
			
			function setAttributes( attributes, element ){
			
				Object.keys( attributes ).forEach(key => {
					
					switch( key ){
						
						case 'textContent':
						
							element.textContent = attributes[ key ];
							break;
							
						default:
						
							element.setAttribute( key, attributes[ key ] );
						
					}
					
				});
				
				return element;
						
			}
			function getAttributes( attributes, element ){
					
				return Object.assign( {}, Object.keys( attributes ).reduce(( object, key ) => {
					
					switch( key ){
						
						case 'textContent':
						
							object[ key ] = element.textContent || attributes.textContent;
							break;
							
						default:
						
							object[ key ] = element.getAttribute( key ) || attributes[ key ];
						
					}
					
					return object;
					
				}, {}));
				
			}
			
			function createPopup( defaultAttributes, elementOrTag ){
				
				function close(){
					
					popup.remove();
					
				}
				
				var element;
				var { start, end, node, text } = selected;
				var attributes = Object.assign( {}, defaultAttributes );
				
				var popup = Editor.createElement( 'div' );
				var popupContent = Editor.createElement( 'div' );
				var confirmButton = Editor.createElement( 'input' );
				var cancelButton = Editor.createElement( 'input' );
				var buttonWrapper = Editor.createElement( 'div' );
				
				if( typeof elementOrTag === 'string' ){
					
					/* Create a new element */
					
					element = document.createElement( elementOrTag );
					attributes = getAttributes( attributes, element );
					
					if( attributes.hasOwnProperty( 'textContent' ) && text ){
						
						element.textContent = text;
						attributes.textContent = text;
						
					}
					
					confirmButton.addEventListener('click', event => {
						
						/* Insert to where the text selection was. Remove the selected text as it is now inside the node. */
						
						setAttributes( attributes, element );
						
						node.innerHTML = node.innerHTML.slice( 0, start ) + element.outerHTML + node.innerHTML.slice( end );
						
					});
					
				} else {
					
					/* Edit an old element */

					element = elementOrTag;
					attributes = getAttributes( attributes, element );
					
					confirmButton.addEventListener('click', event => {
						
						/* Update element. */
						
						setAttributes( attributes, element );
						
					});
					
				}
				
				/* Construct a form to fill in */
				
				Object.keys( attributes ).forEach(key => {
					
					let wrapper = Editor.createElement( 'div' );
					let label = Editor.createElement( 'label' );
					let input = Editor.createElement( 'input' );
					
					label.textContent = key;
					input.type = 'text';
					input.name = key;
					input.value = attributes[ key ] || '';
					
					input.addEventListener( 'change', () => attributes[ key ] = input.value );
					
					wrapper.appendChild( label );
					wrapper.appendChild( input );
					
					popupContent.appendChild( wrapper );
					
				});
				
				/* Add buttons to the wrapper */
				
				buttonWrapper.appendChild( cancelButton );
				buttonWrapper.appendChild( confirmButton );
				
				popup.classList.add( 'plugins-wysiwyg-popup' );
				popup.appendChild( popupContent );
				
				cancelButton.type = 'button';
				cancelButton.value = 'cancel';
				cancelButton.addEventListener( 'click', close )
				
				confirmButton.type = 'button';
				confirmButton.value = 'confirm';
				confirmButton.addEventListener( 'click', close )
				
				/* Add the popup to the main element */
				
				popupContent.appendChild( buttonWrapper );
				wrapper.appendChild( popup );
				
			}
			function create( tagName, attributeList ){
				
				var name = tagName.toUpperCase();
				var button = createButton( name );
				
				button.setAttribute( 'name', name );
				button.addEventListener( 'click', event => {
					
					if( selected ){
					
						let { node, top } = selected
						let attributes = list[ name ];
						
						if( top && top.tagName === name ){
						
							/* If `top` and `top.tagName` is relevant to this button, we are editing the top element. */
						
							createPopup( attributes, top );
						
						} else if( node ){
							
							/* If there is a node, insert a new one with the tagName (name). */
							
							createPopup( attributes, name );
						
						}
					
					}
					
				})
				
				domElement.appendChild( button );
				
				list[ name ] = attributeList;
			
			}
			function check(){
				
				// Still work to do here
				
				var { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
				var singleNode = anchorNode === focusNode;
				
				if( singleNode ){
					
					let _selected = anchorNode.parentNode;
					let all = Object.keys( list );
					
					while( _selected && all.indexOf( _selected.tagName ) < 0 ){
						
						_selected = _selected.parentNode;
						
					}
					
					selected = {
						start: Math.min( anchorOffset, focusOffset ),
						end: Math.max( anchorOffset, focusOffset ),
						node: anchorNode.parentNode,
						top: _selected,
						text: selection.toString()
					};
					
					enable();
					
				} else if( !singleNode ){
					
					selected = null;
					
					disable();
					
				}
			
			}
			function active(){
				
				// Implement that the correct buttons are set to enabled or disabled. Depending on context
				
			}
			function disable(){
				
				domElement.classList.add( 'disabled' );
				
			}
			function enable(){
				
				domElement.classList.remove( 'disabled' );
				
			}
			
			var list = {};
			var selected = null;
			var domElement = Editor.createElement( 'div' );
			
			domElement.classList.add(
				'plugins-wysiwyg-toolbar-group',
				'plugins-wysiwyg-items-insertableNodes'
			);
			
			return { domElement, create, check, disable, enable };
		
		}();
		
		var iframe = Editor.createElement( 'iframe' );
		var wrapper = Editor.createElement( 'div' );
		var tools = Editor.createElement( 'div' );
		var content = Editor.createElement( 'div' );
		var commands = [ insideNodes, classableNodes, insertableNodes ];
		var selection;
		var update;
		
		commands.forEach( command => tools.appendChild( command.domElement ) );
		
		insideNodes.create( 'STRONG', 'Bold' );
		insideNodes.create( 'EM', 'Italic' );
		insideNodes.create( 'SPAN', 'Span' );
		
		classableNodes.create( 'STRONG', [ 'class--a' ] );
		classableNodes.create( 'EM', [ 'class--b' ] );
		classableNodes.create( 'H1', [ 'class--c' ] );
		classableNodes.create( 'A', [ 'button' ] );
		
		insertableNodes.create( 'A', { textContent: 'My Link', href: '#' } );
		insertableNodes.create( 'IMG', { src: 'http://placehold.it/200x200', alt: 'Placeholder' } );
		
		wrapper.classList.add( 'plugins-wysiwyg' );
		tools.classList.add( 'plugins-wysiwyg-toolbar' );
		iframe.classList.add( 'plugins-wysiwyg-content' );
		
		iframe.sandbox = 'allow-same-origin allow-scripts';
		iframe.srcdoc = data;
		iframe.addEventListener( 'load', event => {
			
			var document = iframe.contentDocument;
			var body = document.body;
			
			update = function(){
				
				Editor.update( body.innerHTML );
			
			}
			
			selection = document.getSelection();
			
			document.addEventListener( 'selectionchange', event => {
			
				commands.forEach(command => {
					
					command.check();
				
				});
			
			});
			
			body.contentEditable = true;
			body.addEventListener( 'input', update );
			
		});
		
		wrapper.appendChild( tools );
		wrapper.appendChild( iframe );
	
		return wrapper;
	
	}
	

}();