/*
 * AnimationFrameController
 * -----------------------
 * Stack call for requestAnimationFrame.
 *
 * @method add( handler:Function, callback:Function ) -> Function
 * Adds the handler to the stack and calls it every frame with the following parameters:
 * * @param delta:Number
 * * The amount of milliseconds since the last frame.
 * * @param progress:Number
 * * The amount of milliseconds this handler has been active in the AF since it was added.
 * * @param time:Number
 * * The total amount of milliseconds the AnimationFrame has been active
 * If the return value of the handler is FALSE, the handler will be removed from the stack.
 * If a callback has been set, it also needs to return FALSE to remove the handler from the stack.
 *
 * @method remove( handler:Function ) -> Function
 * Removes the handler from the stack.
 *
 * @getter paused:Bool
 * @setter paused:Bool
 * Get or set the paused state of the AF.
 *
 * @getter fps:Number
 * The Frames Per Second currently recorded by the AF.
 *
 * @getter time:Number
 * The total amount of milliseconds the AnimationFrame has been active
 *
 * @getter timeSinceInception:Number
 * The total amount of time since the first request for an animation frame.
 * This corresponds to the value passed in to the actual requestAnimationFrame handler.
 */
 module.exports = function(){
	
	function AnimationFrameControllerGroup(  name = '' ){
		
		var group = new Map;
		
		group.isAnimationFrameControllerGroup = true;
		group.name = name;
		group.selfDestructible = false;
		group.add = function( handler, callback = ()=>false ){
			
			Map.prototype.set.call( group, handler, {
		
				timeRunning: 0,
				callback
			
			});
		
			return handler;
			
		}
		group.remove = function( handler ){
		
			Map.prototype.delete.call( group, handler );
		
			return handler;
		
		}
		group.forEach = function( delta, groupProgress, time ){
			
			Map.prototype.forEach.call( group, ( data, handler ) => {
				
				data.timeRunning += delta;
				
				if( handler.isAnimationFrameControllerGroup ){
					
					handler.forEach( delta, data.timeRunning, time );
					
					if( handler.selfDestructible && handler.size === 0 ){
						
						Map.prototype.delete.call( group, handler )
						
					}
					
				} else if( handler instanceof Function ){
					
					if( 
						handler( delta, data.timeRunning, timeRunning ) === false 
						&& data.callback() === false
					){
					
						Map.prototype.delete.call( group, handler );
					
					}
				
				}
				
			});
			
		}
		
		return group;
		
	}
	
	function loop( time ){
		
		var delta = time - timePaused - timeRunning;
		
		fps = 1000 / delta;
		
		if( paused || delta > 1000 ){
			
			timePaused += delta;
			
		} else {
			
			timeRunning += delta;
			
			controller.forEach( delta, timeRunning, timeRunning );
			
		}
		
		window.requestAnimationFrame( loop );
		
	}
	
	var fps = 0;
	var paused = false;
	var timePaused = 0;
	var timeRunning = 0;
	var controller = AnimationFrameControllerGroup();
	
	Object.defineProperties(controller, {
		
		Group: {
		
			get(){ return AnimationFrameControllerGroup; }
			
		},
		
		paused: {
	
			get(){ return paused; },
			set( bool ){ return paused = !!bool; }
		
		},
		
		fps: {
	
			get(){ return fps; }
		
		},
		
		time: {
	
			get(){ return timeRunning; }
		
		},
		
		timeSinceInception: {
			
			get(){ return timeRunning + timePaused; }
			
		}
	
	});
		
	window.requestAnimationFrame( loop );
	
	return controller;
	
}();