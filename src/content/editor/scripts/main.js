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