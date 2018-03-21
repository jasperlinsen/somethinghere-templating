
plugins.wysiwyg = function(){
	
	console.log( 'WYSIWYG Editor initialised' );
	
	let selection = window.getSelection();
	
	return function( data, Editor ){
		
		function update(){
			
			Editor.update( content.innerHTML );
			
		}
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
			
				return function( event ){
					
					event.preventDefault();
					
					if( selected === null ){
					
						return;
				
					}
				
					var { end, node, start } = selected;
					var { parentNode, tagName, innerText, outerHTML, innerHTML } = node;
				
					if( start !== end ){
					
						if( start === 0 && end == innerText.length && tagName === _tagName ){
						
							// Selected all the content of this node.
							// Remove the outer node when clicked.
						
							parentNode.innerHTML = parentNode.innerHTML.replace(
								outerHTML,
								innerHTML
							);
						
						} else {
					
							let newHTML = innerHTML.split('');
				
							newHTML.splice( end, 0, `</${_tagName.toLowerCase()}>` );
							newHTML.splice( start, 0, `<${_tagName.toLowerCase()}>` );
				
							node.innerHTML = newHTML.join('');
						
						}
				
					}
				
				}
			
			}
			function create( tagName, buttonName ){
			
				var button = createButton( buttonName );
		
				button.addEventListener( 'click', clickHandlerConstructor( tagName ) )
				button.addEventListener( 'click', update )
				
				domElement.appendChild( button );
			
			}
			function check(){
			
				var { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
			
				if( 
					anchorNode === focusNode 
					&& anchorOffset !== focusOffset 
					&& anchorNode === focusNode
				){
				
					selected = {
						start: anchorOffset,
						end: focusOffset,
						node: anchorNode.parentNode
					}
				
					domElement.classList.remove( 'disabled' );
				
				} else {
				
					selected = null;
				
					domElement.classList.add( 'disabled' );
				
				}
			
			}
			
			var selected = null;
			var domElement = Editor.createElement( 'ul' );
			
			domElement.classList.add( 'items', 'plugins-wysiwyg-items-insideNode' );
			
			return { domElement, create, check };
		
		}();
		
		var wrapper = Editor.createElement( 'div' );
		var tools = Editor.createElement( 'div' );
		var content = Editor.createElement( 'div' );
		var commands = { insideNodes };
		
		Object.keys( commands ).forEach(key => {
			
			tools.appendChild( commands[ key ].domElement );
			
		});
		
		insideNodes.create( 'STRONG', 'Bold' );
		insideNodes.create( 'EM', 'Italic' );
		
		wrapper.classList.add( 'plugins-wysiwyg' );
		tools.classList.add( 'plugins-wysiwyg-items' );
		content.classList.add( 'plugins-wysiwyg-content' );
		
		content.innerHTML = data;
		content.contentEditable = true;
		
		document.addEventListener( 'selectionchange', event => {
			
			if( document.activeElement === content ){
				
				Object.keys( commands ).forEach( key => commands[key].check() );
			
			}
			
		});
		content.addEventListener( 'input', update );
		
		wrapper.appendChild( tools );
		wrapper.appendChild( content );
	
		return wrapper;
	
	}
	

}();