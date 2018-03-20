const AFC = require( './animationFrameController.js' );
/*
 * BoundingClientRectController
 * -----------------------
 * Recalculates the DOMRect of an element if the AnimationFrameController.time has changed.
 * Otherwise it returns the already computed DOMRect.
 *
 * @method get( element:HTMLElement ) -> DOMRect
 * Get the BoundingClientRect of the element.
 * Additions to the BoundingClientRect:
 * * @value inViewport:Bool
 * * Boolean with information of whether the element is in the viewport or not.
 * * @value time:Number
 * * Number that matches the last time the DOMRect 
 * * was computed using AnimationFrameController.time
 *
 * @method overlaps( element1:HTMLElement, element2:HTMLElement ) -> Bool
 * Returns whether both elements overlap in any way. 
 */
module.exports = function(){
	
	var empty = () => {};
	var controller = new WeakMap;
	
	controller.get = function( element ){
		
		var elementData = WeakMap.prototype.get.call( controller, element );
		
		if( !elementData || elementData.time !== AFC.time ){
			
			elementData = element.getBoundingClientRect()
			elementData.time = AFC.time;
			elementData.inViewport = !(
				elementData.right < 0 ||
				elementData.bottom < 0 ||
				elementData.top > window.innerHeight ||
				elementData.left > window.innerWidth
			);
			
		}
		
		WeakMap.prototype.set.call( controller, element, elementData );
		
		return elementData;
		
	}
	controller.overlaps = function( element1, element2 ){
		
		var box1 = controller.get( element1 );
		var box2 = controller.get( element2 );
		
		return !(
			box1.right < box2.left ||
			box1.bottom < box2.top ||
			box1.top > box2.bottom ||
			box1.left > box2.left
		);
	
	}
	
	controller.set = empty;
	controller.delete = empty;
	
	return controller;
	
}();