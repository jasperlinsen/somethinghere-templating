
plugins.wysiwyg = function(){
	
	console.log( 'WYSIWYG Editor initialised' );
	
	return function( data, Editor ){
		
		function findNearestTag( node, tagName = 'any' ){
			
			var nearest = node;
			
			if( tagName === 'any' ){
				
				while( nearest && !nearest.tagName ) nearest = nearest.parentNode;
				
			} else{
				
				while( nearest && nearest.tagName !== tagName ) nearest = nearest.parentNode;
				
			}
			
			return nearest;
			
		}
		function createButton( face ){
			
			var button = Editor.createElement( 'li' );
			var link = Editor.createElement( 'a' );
			
			link.textContent = face;
			
			button.appendChild( link );
			
			return button;
			
		}
		
		const textNodes = function(){
			
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
					
					overlay.set( textNodes, selected.node, overlayColor );
					
					active();
					enable();
				
				} else {
				
					selected = null;
					
					overlay.set( textNodes, [], overlayColor );
					
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
			var overlayColor = 'rgba(0,0,0,.2)';
			
			domElement.classList.add(
				'plugins-wysiwyg-toolbar-group',
				'plugins-wysiwyg-items-insideNode'
			);
			
			return {
				domElement, create, check, disable, enable,
				set overlayColor( color ){ return overlayColor = color; },
				get overlayColor(){ return overlayColor; }
			};
		
		}();
		const classNodes = function(){
			
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
			var overlayColor = 'rgba(0,0,255,.2)';
			
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
			
			return {
				domElement, create, check, disable, enable,
				set overlayColor( color ){ return overlayColor = color; },
				get overlayColor(){ return overlayColor; }
			};
		
		}();
		const blockNodes = function(){
			
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
				
						document.execCommand( 'insertHTML', false, element.outerHTML );
						
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
					
					let _selectedAnchor = anchorNode;
					let all = Object.keys( list );
					
					while( _selectedAnchor && all.indexOf( _selectedAnchor.tagName ) < 0 ){
						
						_selectedAnchor = _selectedAnchor.parentNode;
						
					}
					
					selected = {
						start: Math.min( anchorOffset, focusOffset ),
						end: Math.max( anchorOffset, focusOffset ),
						node: anchorNode.parentNode,
						top: _selectedAnchor,
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
				
				if( selected.top ){
					
					[ ...domElement.childNodes ].forEach(button => {
						
						let tagName = button.getAttribute( 'name' );
						
						if( tagName === selected.top.tagName ){
							
							button.classList.add( 'active', 'edit' );
							
						} else {
							
							button.classList.remove( 'active', 'edit' );
							
						}
						
					});
					
				} else if( selected.node ){
					
					
					
				}
				
				
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
			var overlayColor = 'rgba(0,255,0,.2)';
			
			domElement.classList.add(
				'plugins-wysiwyg-toolbar-group',
				'plugins-wysiwyg-items-insertableNodes'
			);
			
			return {
				domElement, create, check, disable, enable,
				set overlayColor( color ){ return overlayColor = color; },
				get overlayColor(){ return overlayColor; }
			};
		
		}();
		const overlay = function(){
			
			function set( command, nodes = [], color = '#000' ){
				
				nodes = (nodes instanceof Array ? nodes : [ nodes ]).map(node => {
				
					return findNearestTag( node ) || node;
					
				});
				
				selections.set( command, { nodes, color });
				
			}
			function draw(){
				
				// Make sure the wrapper is in view, otherwise drawing is useless.
				
				var wrapperBB = wrapper.getBoundingClientRect();
				
				if( wrapperBB.top > innerHeight || wrapperBB.bottom < 0 ){
					
					return;
					
				}
				
				domElement.width = domElement.clientWidth;
				domElement.height = domElement.clientHeight;
				
				ctx.font = fontSize + 'px sans-serif';
				ctx.textBaseline = 'top';
				ctx.textAlign = 'left';
				
				var bb = domElement.getBoundingClientRect();
				var frame = iframe.getBoundingClientRect();
				
				selections.forEach(data => {
					
					var { nodes, color } = data;
					
					nodes.forEach(node => {
						
						var text = node.tagName + (node.className ? `.${node.className}` : '');
						
						var textWidth = ctx.measureText( text ).width;
						var { left, top, width, height } = node.getBoundingClientRect();
						
						left = left + frame.left - bb.left;
						top = top + frame.top - bb.top;
						
						ctx.fillStyle = color;
						ctx.fillRect( left, top, textWidth + 4, fontSize + 4 );
						
						ctx.strokeStyle = color;
						ctx.strokeRect( left, top, width, height );
						
						ctx.fillStyle = '#fff';
						ctx.fillText( text, left + 2, top + 2 );
						
					});
					
				});
				
			}
			
			var domElement = Editor.createElement( 'canvas' );
			var ctx = domElement.getContext( '2d' );
			var selections = new Map;
			var fontSize = 10;
			
			domElement.classList.add( 'plugins-wysiwyg-overlay' );
			
			// Replace with better AF later!
			setInterval( draw, 1000 / 60 );
			
			return {
				set,
				domElement,
				set fontSize( f ){ return fontSize = f; },
				get fontSize(){ return fontSize; }
			}
			
		}()
		
		var iframe = Editor.createElement( 'iframe' );
		var wrapper = Editor.createElement( 'div' );
		var tools = Editor.createElement( 'div' );
		var content = Editor.createElement( 'div' );
		var commands = [ textNodes, classNodes, blockNodes ];
		var selection;
		var update;
		var document;
		var body;
		
		commands.forEach( command => tools.appendChild( command.domElement ) );
		
			
		// TODO:  CLassNodes: Make it so you can have multiple classes per option
		//     AKA `button primary` will check for both classNames (otherwise classList breaks!)
		
		// Command definitions need to be done dynamically somehow!
		// Adding the chosen stylesheet.
		
		textNodes.create( 'STRONG', 'Bold' );
		textNodes.create( 'EM', 'Italic' );
		textNodes.create( 'SPAN', 'Span' );
		
		classNodes.create( 'STRONG', [ 'red', 'green', 'blue' ] );
		classNodes.create( 'EM', [ 'red', 'green', 'blue' ] );
		classNodes.create( 'H1', [ 'red', 'green', 'blue' ] );
		classNodes.create( 'A', [ 'button' ] );
		
		blockNodes.create( 'A', { textContent: 'My Link', href: '#' } );
		blockNodes.create( 'IMG', { src: 'http://placehold.it/200x200', alt: 'Placeholder' } );
		
		wrapper.classList.add( 'plugins-wysiwyg' );
		tools.classList.add( 'plugins-wysiwyg-toolbar' );
		iframe.classList.add( 'plugins-wysiwyg-content' );
		
		iframe.sandbox = 'allow-same-origin allow-scripts';
		iframe.srcdoc = data;
		iframe.addEventListener( 'load', event => {
			
			document = iframe.contentDocument;
			body = document.body;
			
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
		wrapper.appendChild( overlay.domElement );
	
		return wrapper;
	
	}
	

}();