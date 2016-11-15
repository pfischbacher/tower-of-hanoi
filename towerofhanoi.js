/**
* @package Tower of Hanoi
* @version 1.0
* @author Philip Fischbacher
* @copyright 2015 Cool Math World - www.coolmathworld.com

* A simple game from javascript using HTML5 Canvas called Tower of Hanoi.
* A mathematical puzzle consisting of 3 pillars and a number of disks.
* The disks need to be stacked largest to smallest.
*/
	
	/* Variable Declarations */
	var game;
	var gameObjects = new Array();
	var discs = new Array();
	var totalDiscs = 5;
	var maxDiscs = 7;
	var pillars = new Array();
	var canvas;
	var ctx;
	var input;
	var j=0;
	var logo;
	var message;
	var discsNumber;

	/* Declare the main loop that updates and renders the view */	
	var mainloop = function() {
		update();
		render();
    };

	/* Initialize the game with JQuery */	
	$(document).ready(function(){
		game = new Game();
		logo = new Logo();
		message = document.getElementById("message");
		discsNumber = document.getElementById("discsNumber");
		discsNumber.innerHTML = totalDiscs;
		
		var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

		if ( animFrame !== null) {
			
			canvas = document.getElementById("gameCanvas");
			ctx = canvas.getContext('2d');
			setCanvasWindow();
			
			
			init();
			
			if ( $.browser.mozilla ) {
				var recursiveAnim = function() {
					mainloop();
					animFrame();
				};

				/* setup for multiple calls */
				window.addEventListener("MozBeforePaint", recursiveAnim, false);

				/* start the mainloop */
				animFrame();
			} else {
				var recursiveAnim = function() {
					mainloop();
					animFrame( recursiveAnim, canvas );
				};

				/* start the mainloop */
				animFrame( recursiveAnim, canvas );
			}
		} else {
			var ONE_FRAME_TIME = 1000.0 / 60.0 ;
			setInterval( mainloop, ONE_FRAME_TIME );
		}
		
	});

	/* Update the inputs from the mouse and update the Canvas window if resized */
	function update() {
		input.mousemove();
		updateCanvasWindow();
	}
	
	/* Render the Canvas */
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (i=0; i<=gameObjects.length-1; i++) {
			gameObjects[i].draw();
		}		
	}


	/* Function to initialize the game.  Create the initial game objects and locations */
	function init() {
		logo = new Logo();
		pillarWidth = canvas.width/40;
		pillarHeight = canvas.height/12 * totalDiscs;
		pillarY = canvas.height*(1/2 + 1/10);
		baseY = pillarY + pillarHeight/2;
		pillars[1] = new Pillar(1, canvas.width/6, pillarY, pillarWidth, pillarHeight );
		pillars[2] = new Pillar(2, canvas.width/2, pillarY, pillarWidth, pillarHeight);
		pillars[3] = new Pillar(3, canvas.width*5/6, pillarY, pillarWidth, pillarHeight);
		base = new Base(canvas.width/2, baseY, canvas.width *3/4, canvas.height/20 );
		
		discHeight = canvas.height/20;

		for (i=1; i <= totalDiscs; i++) {
			discs[i] = new Disc(i, 0, 150  + i * discHeight, discHeight);
		}
		
		for (i=0; i < totalDiscs; i++) {
			pillars[1].stack(discs[totalDiscs - i]);
		}
		
		input = new InputClass(gameObjects);

		/* Allow the user to customize the puzzle but increasing or decreasing the number of disks. */
		document.getElementById("reset").onclick = input.resetGame;
		document.getElementById("increaseDiscs").onclick = input.increaseDiscs;
		document.getElementById("decreaseDiscs").onclick = input.decreaseDiscs;
	}
	
	/* Function that automatically moves a disk from one pillar to another. */	
	function moveDisc(cPillar, rPillar) {
		discNum = 1;
		pillars[1].unstack();
		pillars[2].stack(discNum);
		discs[discNum].move(pillars[2].getX(), 100);
	}


	/* Function to set the size of the Canvas window. */
	function setCanvasWindow() {
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	/* Function to update the Canvas window. Include any window resizing by the user. */
	function updateCanvasWindow() {
		if (canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
			widthChange = window.innerWidth/canvas.width;
			heightChange = window.innerHeight/canvas.height;
			setCanvasWindow();
			for ( i=0; i < gameObjects.length; i++) {
				gameObjects[i].x = gameObjects[i].x * widthChange;
				gameObjects[i].y = gameObjects[i].y * heightChange;
				gameObjects[i].width = gameObjects[i].width * widthChange;
				gameObjects[i].height = gameObjects[i].height * heightChange
			}
		}
	}

	/* Function to make extending the javascript objects easier. */
	function extend(ChildClass, ParentClass) {
		ChildClass.prototype = Object.create(ParentClass.prototype);
		ChildClass.prototype.constructor = ChildClass;
	}
		
	/* Game Object */
	var Game = function() {
		this.gamestate ='start';
		this.reset = false;
	}
	
	Game.prototype.resetGame = function() {
		gameObjects = null;
		gameObjects = new Array();
		message.style.visibility = "hidden";
		init();
	}
	
	Game.prototype.gameover = function(state) {
	   this.gamestate = state;
	   this.displayEnd();	
	}
	
	Game.prototype.displayEnd = function() {
		message.innerHTML = "You did it!<br>Well Done!";
		message.style.visibility = "visible";	
	}
	
	/* Input Object
	*  To get the mouse inputs for dragging and placing the disks.
	*/
	var InputClass = function(go) {
		this.go = go;
		this.action = false;
	}
	
	InputClass.prototype.resetGame = function() {
		game.resetGame();
	}
	
	InputClass.prototype.increaseDiscs = function() {
		if (totalDiscs < maxDiscs) {
			totalDiscs = totalDiscs + 1;
		}
		discsNumber.innerHTML = totalDiscs;
		game.resetGame();
	}
	
	InputClass.prototype.decreaseDiscs = function() {
		if (totalDiscs > 1) {
			totalDiscs = totalDiscs - 1;
		}
		discsNumber.innerHTML = totalDiscs;
		game.resetGame();
	}
	
	InputClass.prototype.isTouch = function() {
		return 'ontouchstart' in window // works on most browsers 
		|| 'onmsgesturechange' in window; // works on ie10
	}
	
	InputClass.prototype.mousedown = function(self, e) {
		var mPos = self.mousePos(e);
		for (i=0; i<= self.go.length-1; i++) {
			if (self.go[i].hasAction) {
				if (mPos.x > this.go[i].x1 && mPos.x < this.go[i].x2  && mPos.y > this.go[i].y1 && mPos.y < this.go[i].y2) {
					if (this.go[i].doAction() == 'drag') {
						canvas.onmousemove = function(e) { self.go[i].move(e.pageX, e.pageY) }
					}
				}
			}
		}
	}
	
	InputClass.prototype.mousePos = function(e) {
		var rect = canvas.getBoundingClientRect();
		x = e.clientX - rect.left;
		y = e.clientY - rect.top;

		return {
		  x: e.clientX - rect.left,
		  y: e.clientY - rect.top
		};

	}
	
	InputClass.prototype.checkMousePos = function(self, e) {
		var mPos = self.mousePos(e);
		var num = null;
		for (i=0; i<= self.go.length-1; i++) {
			if (self.go[i].hasAction) {
				if (mPos.x > this.go[i].x1 && mPos.x < this.go[i].x2  && mPos.y > this.go[i].y1 && mPos.y < this.go[i].y2) {
					num = i;
					self.go[i].highlight = true;
				}
				else {
					self.go[i].highlight = false;
				}
			}
		}
		
		return num;
	}
	
	InputClass.prototype.mousemove = function() {
		var self = this;
		var i = null;

		if (!this.action) {
			this.pickup();
		}
		else {
			if (this.item != null) {
				this.drag();
			}
		}
	}
	
	InputClass.prototype.pickup = function() {
		var self = this;
		if (this.isTouch()) {
			canvas.addEventListener('touchstart', function(e) {
				var touch = e.targetTouches[0];
				
				i = self.checkMousePos(self, touch);
				if ( i != null) {
					i = self.checkMousePos(self, touch);
					if (i != null) {
						self.action = true;
						self.item = self.go[i];
					}
					else {
						self.action = false;
						self.item = null;
					}
				}
				else {
					self.action = false;
					self.item = null;
				}
				e.preventDefault();
			});
		}
		else {
			canvas.onmousemove = function (e) { i = self.checkMousePos(self, e);
				if ( i != null) {
					canvas.onmousedown = function(e) {
						i = self.checkMousePos(self, e);
						if (i != null) {
							self.action = true;
							self.item = self.go[i];
						}
						else {
							self.action = false;
							self.item = null;
						}
					};
				}
				else {
					self.action = false;
					self.item = null;
				}
			}
		}	
	}
	
	InputClass.prototype.drag = function() {
		var self = this;		
		if (this.isTouch()) {
			var lastMove = null;
			canvas.addEventListener('touchmove', function(e) {
				var touch = e.targetTouches[0];
				lastMove = touch;
				var mPos = self.mousePos(touch);
				if (self.item != null) {
					self.item.move(mPos.x, mPos.y);
				}
				e.preventDefault();
			});
			
			canvas.addEventListener('touchend', function(e) {
				var touch = e.targetTouches[0];
				if(self.item != null) {
					var mPos = self.mousePos(lastMove);
					self.dropIntoStack(self, mPos.x);
					
					self.action = false;
					self.item = null;
				}
				e.preventDefault();
			});
		} else {
			canvas.onmousemove = function(e) {
				var mPos = self.mousePos(e);
				if (self.item != null) {
					self.item.move(mPos.x, mPos.y);
				}
			};
	
			canvas.onmouseup = function(e) {
				var mPos = self.mousePos(e);
				self.dropIntoStack(self, mPos.x);
				
				self.action = false;
				self.item = null;
			};
		}
	}
	
	InputClass.prototype.dropIntoStack = function(self, x) {
		for (i=1; i<=pillars.length-1; i++) {
			var extra = canvas.width/12;
			if (x > pillars[i].x1 - extra  && x < pillars[i].x2 + extra) {
				if ( pillars[i].checkStack(self.item) ) {
					self.stack(i);
				}
				else {
					self.returnToStack();
				}
			}
			else {
				self.returnToStack();
			}
		}
		if (pillars[3].discStack.length == totalDiscs) {
			game.gameover('end');
		}
		return true;
	}
	
	InputClass.prototype.stack = function(pillar) {
		pillars[this.item.pillarID].unstack();
		pillars[pillar].stack(this.item);
	}
	
	InputClass.prototype.returnToStack = function() {
		pillars[this.item.pillarID].unstack();
		pillars[this.item.pillarID].stack(this.item);
	}
		
	/* GameObject object
	*  A base object for the game objects to inherit.
	*/
	var GameObject = function(x, y, width, height, fillStyle) {
		this.x = x,
		this.y = y,
		this.height = height,
		this.width = width;
		
		if (fillStyle === undefined ) fillStyle = 'black';
		this.fillStyle = fillStyle;
		this.fill = true;
		this.hasAction = false;
		this.highlight = false;
		gameObjects.push(this);
	}
	
	GameObject.prototype.getX = function() {
		return this.x;
	}
	
	GameObject.prototype.getY = function() {
		return this.y;
	}
	
	GameObject.prototype.drawRect = function () {
					
		if (typeof this.stroke == "undefined" ) {
			this.stroke = true;
		}
		if (typeof this.radius === "undefined") {
			this.radius = 5;
		}
		
		ctx.beginPath();
		x1 = this.x - this.width/2;
		x2 = this.x + this.width/2;
		y1 = this.y - this.height/2;
		y2 = this.y + this.height/2;
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		
		ctx.moveTo(x1 + this.radius, y1);
		ctx.lineTo(x2 - this.radius, y1);
		ctx.quadraticCurveTo(x2, y1, x2, y1 + this.radius);
		ctx.lineTo(x2, y2 - this.radius);
		ctx.quadraticCurveTo(x2, y2, x2 - this.radius, y2);
		ctx.lineTo(x1 + this.radius, y2);
		ctx.quadraticCurveTo(x1, y2, x1, y2 - this.radius);
		ctx.lineTo(x1, y1 + this.radius);
		ctx.quadraticCurveTo(x1, y1, x1 + this.radius, y1);
		ctx.closePath();
		if (this.stroke) {
			ctx.stroke();
		}
					
		ctx.fillStyle = this.fillStyle;
		
		if (this.fill) {
			ctx.fill();
		}      
	}
	
	GameObject.prototype.drawText = function(text, x, y, align, font) {
		if(x === undefined) x = this.x;
		if(y === undefined) y = this.y;
		if(font === undefined) font = 'italic bold 16px sans-serif';
		if(align === undefined) align = 'center';
		
		ctx.font = font;
		ctx.textAlign = align;
		ctx.fillStyle = '#000';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x, y);
	}
	
	/* Pillar Object
	* A class for the pillars
	*/
	var Pillar = function(id, x, y, height, width, fillStyle) {
		GameObject.call(this, x, y, height, width, fillStyle);
		this.id = id;
		this.discStack = new Array();
		this.setColour();
	}
	
	extend(Pillar, GameObject);
	
	Pillar.prototype.getX = function() {
		return this.x;
	}
	
	Pillar.prototype.draw = function() {
		this.drawRect();
	}
	
	Pillar.prototype.setColour = function() {
		this.grd = ctx.createLinearGradient(this.x, this.y - this.height/2, this.x, this.y + this.height/2);
		this.grd.addColorStop(0, '#999');   
		this.grd.addColorStop(1, '#333');
		this.fillStyle = this.grd;
	}
	
	Pillar.prototype.checkStack = function(disc) {
		check = false;
		if (this.discStack.length > 0) {
			var stackDisc = this.discStack[this.discStack.length - 1];
			if (disc.id < stackDisc.id) {
				check = true;
			}
		}
		else {
			check = true;
		}
		
		return check;
	}
	
	Pillar.prototype.stack = function(disc) {
		y = this.y + this.height/2 - (1 + this.discStack.length ) * disc.height * 1.25;
		disc.move(this.x, y);
		disc.hasAction = true;
		this.discStack.push(disc);
		disc.pillarID = this.id;
		if (this.discStack.length > 1) {
			this.discStack[this.discStack.length-2].hasAction = false;
		}
	}
	
	Pillar.prototype.unstack = function() {
		this.discStack.pop();
		if (this.discStack.length > 0) {
			this.discStack[this.discStack.length-1].hasAction = true;
		}
	}
	
	/* Disc object
	*  The discs that the user will move from pillar to pillar.
	*/
	var Disc = function(id, x, y, height) {
		if (height === undefined) height = canvas.height/40;
		width = canvas.width/20 * id;
		GameObject.call(this, x, y, width, height);
		this.id = id;
		this.radius = height/5;
		this.setColour();
		this.draggable = false;
		this.dragMode = false;
		this.input = new InputClass(this);
	}
	
	extend(Disc, GameObject);

	Disc.prototype.draw = function() {
		this.fill = true;
		this.fillStyle = this.grd;
		this.drawRect();
		this.drawText(this.id);
	}
	
	Disc.prototype.getHeight = function() {
		return this.height;
	}
	
	Disc.prototype.setColour = function() {
		var colours = new Array();
		colours[1] = {start:'#D4FF00', stop:'#FF8000'}; //Yellow
		colours[2] = {start:'#ed1c24', stop:'#aa1317'}; //Red
		colours[3] = {start:'#2A00FF', stop:'#0080FF'}; //Blue
		colours[4] = {start:'#faa51a', stop:'#f47a20'}; //Orange
		colours[5] = {start:'#C000C5', stop:'#3C00C5'}; //Purple
		colours[6] = {start:'#7db72f', stop:'#4e7d0e'}; //Green
		colours[7] = {start:'#964400', stop:'#960000'}; //Brown
		
		this.grd = ctx.createLinearGradient(this.x, this.y - this.height/2, this.x, this.y + this.height/2);
		this.grd.addColorStop(0, colours[this.id].start);
		this.grd.addColorStop(1, colours[this.id].stop);
		this.fillStyle = this.grd;
	}
	
	Disc.prototype.move = function(x, y) {
		this.x = x;
		this.y = y;
		this.setColour();
	}
	
	Disc.prototype.mousedown = function(mPos) {
		this.move(mPos.x, mPos.y);
	}
	
	Disc.prototype.doAction = function() {
			return 'drag';
	}
	
	/* Base Class
	* This is just a rectangle with displays a base plate for the pillars.
	*/
	var Base = function(x, y, width, height) {
		GameObject.call(this, x, y, width, height);
	}
	
	extend(Base, GameObject);

	Base.prototype.draw = function() {
		this.fill = true;
		this.fillStyle = this.grd;
		this.drawRect();
	}
	
	/* Logo Class 
	*  For displaying a logo. */
	var Logo = function() {
		this.logo = document.getElementsByTagName('cmw-logo');
		this.insert();
	}
	
	Logo.prototype.insert = function() {
		this.logo[0].innerHTML = '<a href="http://www.coolmathworld.com">Cool Math World<a/>';
	}
