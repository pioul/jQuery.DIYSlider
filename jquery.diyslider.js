/*
 * jQuery Do It Yourself Slider
 * http://pioul.fr/jquery-diyslider/
 *
 * Copyright 2012, Philippe Masset
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function($){
	$.fn.diyslider = function(mixed){
		
		var t = $(this)
		
		//// first plugin call
		if(typeof(mixed) == 'object' || !mixed){
			
			// plugin data and functions
			var data = {
					// options
					options: $.extend(
						{},
						// default options
						{
							width: '500px',
							height: '300px',
							animationAxis: 'x', // 'x'|'y'
							animationDuration: 1000, // number|0
							animationEasing: 'swing', // 'swing'|'linear'|more if you use jQuery UI
							loop: true, // true|false
							display: 1, // number of slides displayed at once
							start: 1 // starting slide
						},
						mixed
					),
					// vars
					slider: t,
					slidesContainer: t.children("div:first"),
					slides: t.children("div:first").children("div"),
					slidesCount: 0,
					currentSlide: 1,
					dimensions: {
						w: 0,
						h: 0
					},
					// change slide
					// [to]
					move: function(arg){
						// allocate args to local vars
						var to = arg[0],
							instant = arg[1] || false;
						// compute the new slide number
						var newSlide = (parseInt(to, 10) == to)? parseInt(to, 10) : (to == 'forth')? (this.currentSlide + 1) : (to == 'back')? (this.currentSlide - 1) : false;
						// provide a safety net to this value if this.options.loop
						if(this.options.loop && newSlide !== false && newSlide > (this.slidesCount - (this.options.display - 1))) newSlide = 1;
						if(this.options.loop && newSlide !== false && newSlide <= 0) newSlide = (this.slidesCount - (this.options.display - 1));
						// animate the whole thing
						if(newSlide !== false && newSlide > 0 && newSlide <= (this.slidesCount - (this.options.display - 1)) && newSlide != this.currentSlide){
							var currentSlideNode = $(this.slides[this.currentSlide - 1]);
							this.currentSlide = newSlide;
							currentSlideNode
								.removeClass("active")
								.addClass("last-active");
							var newSlideNode = $(this.slides[newSlide - 1]).addClass("next-active");
							// move callback function
							var moveCallback = $.proxy(function(){
								currentSlideNode
									.removeClass("last-active");
								newSlideNode
									.removeClass("next-active")
									.addClass("active");
								this.slider.trigger("moved.diyslider", [newSlideNode, newSlide, true]);
							}, this);
							this.slider.trigger("moving.diyslider", [newSlideNode, newSlide, true]);
							// if instant move (no animation, used when the plugin is initialized using options.start)
							if(instant){
								this.slidesContainer.css(this.getSlidesContainerPosition());
								moveCallback();
							// if animation
							} else {
								this.slidesContainer.animate(
									this.getSlidesContainerPosition(),
									{
										queue: false,
										duration: this.options.animationDuration,
										easing: this.options.animationEasing,
										complete: moveCallback
									}
								);
							}
						// some cases might require to know when the move is complete, even if it didn't actually move
						} else if(newSlide == this.currentSlide){
							this.slider.trigger("moving.diyslider", [$(this.slides[newSlide - 1]), newSlide, false]);
							this.slider.trigger("moved.diyslider", [$(this.slides[newSlide - 1]), newSlide, false]);
						}
					},
					// resize the slider
					// [width, height]
					resize: function(arg){
						// allocate args to local vars
						var width = arg[0],
							height = arg[1];
						// save dimensions
						this.dimensions.w = width;
						this.dimensions.h = height;
						// apply them to the container and slides
						this.slider.css({
							width: this.dimensions.w,
							height: this.dimensions.h,
						});
						this.slidesContainer.css($.extend(
							this.getSlidesContainerPosition(), 
							{
								width: (this.options.animationAxis == 'x')? Math.ceil(parseInt(this.dimensions.w, 10) * this.slidesCount) +'px' : 'auto',
								height: (this.options.animationAxis == 'y')? Math.ceil(parseInt(this.dimensions.h, 10) * this.slidesCount) +'px' : 'auto',
							}
						));
						this.slides.css({
							width: (this.options.animationAxis == 'x')? Math.ceil(parseInt(this.dimensions.w, 10) / this.options.display) +'px' : this.dimensions.w,
							height: (this.options.animationAxis == 'y')? Math.ceil(parseInt(this.dimensions.h, 10) / this.options.display) +'px' : this.dimensions.h,
						});
						this.slider.trigger("resized.diyslider", [this.dimensions]);
						return t;
					},
					// update DIYslider options on the fly
					updateOptions: function(arg){
						var newOptions = arg[0],
							needCallToResize = false; // flag that tells us if an option that needs resize() to be run has been modified
						$.each(newOptions, $.proxy(function(k, v){
							// if the option exsists and has changed
							if(this.options.hasOwnProperty(k) && this.options[k] != v){
								this.options[k] = v;
								// options that need resize() to be called to be taken into account
								if(k == 'width' || k == 'height' || k == 'animationAxis' || k == 'display') needCallToResize = true;
							}
						}, this));
						if(needCallToResize) this.resize([this.options.width, this.options.height]);
						return t;
					},
					// set some basic styles to the container and slides when DIYslider is first called
					setStyles: function(){
						this.slider.css({
							position: 'relative',
							overflow: 'hidden',
						});
						this.slidesContainer.css({
							position: 'absolute',
							top: 0,
							left: 0
						});
						this.slides.css({
							'float': 'left',
							overflow: 'hidden',
							'box-sizing': 'border-box'
						});
					},
					// get the total number of slides
					getSlidesCount: function(){
						return this.slidesCount;
					},
					// get top and left position of slidesContainer
					getSlidesContainerPosition: function(){
						return {
							left: (this.options.animationAxis == 'x')? '-'+ Math.ceil((this.currentSlide - 1) * parseInt(this.dimensions.w, 10) / this.options.display) +'px' : 0,
							top: (this.options.animationAxis == 'y')? '-'+ Math.ceil((this.currentSlide - 1) * parseInt(this.dimensions.h, 10) / this.options.display) +'px' : 0
						};
					}
				};
			
			// initiate data.slidesCount
			data.slidesCount = data.slides.length;
			// set the first slide to .active
			if(data.slidesCount){
				$(data.slides[0]).addClass("active");
			// issue a warning in the console if the number of pages is false
			} else if(typeof(console) != 'undefined'){
				console.warn('No slides found for DIYslider');
			}
			// set styles
			data.setStyles();
			// initiate dimensions
			data.resize([data.options.width, data.options.height]);
			// jump to slide if options.start defined
			data.move([data.options.start, true]);
			// save data into the DOM
			data.slider.data('diyslider', data);
			
			return t;
		
		//// function call
		} else if(typeof(t.data('diyslider')[mixed]) == 'function'){
			
			return t.data('diyslider')[mixed](Array.prototype.slice.call(arguments, 1));
		
		}
		
	};
})(jQuery);