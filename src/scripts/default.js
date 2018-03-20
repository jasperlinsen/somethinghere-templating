const AFC = require( './controllers/animationFrameController.js' );
const ETC = require( './controllers/eventThrottleController.js' );
const IVC = require( './controllers/inViewportController.js' );
const BCC = require( './controllers/boundingClientRectController.js' );

function select( query, root ){
	
	try {
		return [...(root||document).querySelectorAll( query )];
	} catch(e){
		return [];
	}
	
}
function getScrollTop(){
	
	return (document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop) || document.body.scrollTop || 0;
	
}
function setScrollTop( top ){

	(document.documentElement ? document.documentElement : document.body).scrollTop = top;
	document.body.scrollTop = top;
	
}
function scrollToTop( top, duration = null ){
	
	if( scrollToTop.isScrolling ) return;
	else scrollToTop.isScrolling = true;
	
	if( duration === null ){
		
		let pixelsPerMillisecond = 4;
		
		duration = Math.abs( getScrollTop() - top ) / pixelsPerMillisecond;
		
	}
	
	var start = getScrollTop();
	
	function scroll( d, p, t ){
		
		//var progress = clamp( p / duration );
		var progress = clamp( p / duration );
		var _progress = -Math.pow(progress - 1, 2) + 1;
		
		if( progress >= 1 ){
			
			setScrollTop( top );
			
			scrollToTop.isScrolling = false;
			
			endEventPrevention();
			
			return false;
			
		} else {
			
			var end = start + (top - start) * _progress;
			
			setScrollTop( end );
			
		}
		
	}
	function eventPrevention( event ){
		
		event.preventDefault();
		event.stopImmediatePropagation();
		
	}
	function endEventPrevention(){
		
		ETC.delete( document, 'wheel', eventPrevention );
		ETC.delete( document, 'touchstart', eventPrevention );
		ETC.delete( document, 'touchmove', eventPrevention );
		ETC.delete( document, 'touchend', eventPrevention );
		
	}
	
	ETC.add( document, 'wheel', eventPrevention );
	ETC.add( document, 'touchstart', eventPrevention );
	ETC.add( document, 'touchmove', eventPrevention );
	ETC.add( document, 'touchend', eventPrevention );
	
	AFC.add( scroll );
	
}
function clamp( value, ...between ){
	
	while( between.length < 2 ) between.push( between.length );
	
	var min = Math.min( ...between );
	var max = Math.max( ...between );
	
	return value < min ? min : (value > max ? max : value);
	
}
function getBreakPoint(){
	
	return (window.getComputedStyle( document.body, ':before' ).getPropertyValue( 'content' ) || (innerWidth < 800 ? 'mobile' : 'desktop')).replace( /[\"\']+/gi, '' );
	
}