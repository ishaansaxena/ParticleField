
// Global Variables

var canvas, context, H, W, gOrigin;
var particleCount = 5000; var particles = new Array();
var scaleCoeff = 0.01, forceCoeff = 100, dragCoeff = 4;
var maxVelocity = 1; var mainloop;

// Vector
// Code from: https://codepen.io/akm2/pen/rHIsa

function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.add = function(a, b) {
	return new Vector(a.x + b.x, a.y + b.y);
};

Vector.sub = function(a, b) {
	return new Vector(a.x - b.x, a.y - b.y);
};

Vector.scale = function(v, s) {
	return v.clone().scale(s);
};

Vector.random = function() {
	return new Vector(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
	);
};

Vector.prototype = {
	set: function(x, y) {
		if (typeof x === 'object') {
			y = x.y;
			x = x.x;
		}
		this.x = x || 0;
		this.y = y || 0;
		return this;
	},

	add: function(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	},

	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},

	scale: function(s) {
		this.x *= s;
		this.y *= s;
		return this;
	},

	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	normalize: function() {
		var m = this.length();
		if (m) {
			this.x /= m;
			this.y /= m;
		}
		return this;
	},

	angle: function() {
		return Math.atan2(this.y, this.x);
	},

	clone: function() {
		return new Vector(this.x, this.y);
	},

	toString: function() {
		return '<' + this.x + ', ' + this.y + '>';
	}
};

// Particles

function Particle(x, y) {
	this.position = new Vector(x || 0, y || 0);
	this.velocity = new Vector();
	this.acceleration = new Vector();
}

Particle.random = function() {
	var p = new Particle();
	p.position = new Vector(Math.random() * /*H + (W-H)/2*/ W, Math.random() * H);
	return p;
}

Particle.prototype = {
	render: function() {
		context.beginPath();
		context.arc(this.position.x, this.position.y, 1, 0, 2*Math.PI);
		var factor = 270 * (maxVelocity - this.velocity.length())/maxVelocity;
		if (factor < 0) factor = 0;
		var hue = factor;
		context.fillStyle = 'hsl(' +  hue + ', 100%, 50%)';
		// context.fillStyle = '#FFFFFF';
		context.fill();
	},
	update: function() {
		// Acceleration
		var R = Vector.sub(gOrigin, this.position);
		var RLength = R.length();
		var RNormal = R.normalize();

		var friction = RNormal.clone().scale(-1 * dragCoeff).scale(scaleCoeff);
		var gravity = RNormal.clone().scale(forceCoeff / (1 + RLength * RLength)).scale(scaleCoeff);
		
		var v = this.velocity.length();

		this.acceleration = Vector.sub(gravity, friction).scale(Math.abs(4 * dragCoeff/(Math.pow(2.71828, dragCoeff))));

		// Velocity
		this.velocity.x += this.acceleration.x;
		this.velocity.y += this.acceleration.y;
		if (v > maxVelocity) maxVelocity = v;

		// Position
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
};

// Events
var cog = document.getElementById("cog");
var controls = document.getElementById("controls");
var particleInput = document.getElementById("particleInput");
var forceInput = document.getElementById("forceInput");
var dragInput = document.getElementById("dragInput");
var scaleInput = document.getElementById("scaleInput");

canvas.addEventListener('mousedown', function(e) {
	gOrigin.x = e.clientX;
	gOrigin.y = e.clientY;
}, false);

cog.addEventListener('mousedown', function(e) {
	cog.classList.toggle("open");
	controls.classList.toggle("open");
}, false);

controls.addEventListener('mouseleave', function(e) {
	cog.classList.remove("open");
	controls.classList.remove("open");
}, false);

particleInput.addEventListener('change', function(e) {
	var c = parseInt(particleInput.value);
	clearInterval(mainloop);
	while (c > particles.length) {
		var p = Particle.random();
		particles.push(p);
	}
	particleCount = c;
	mainloop = setInterval(loop, 10); 
}, false);

forceInput.addEventListener('change', function(e) {
	forceCoeff = parseInt(forceInput.value);
}, false);

dragInput.addEventListener('change', function(e) {
	dragCoeff = parseInt(dragInput.value);
}, false);

scaleInput.addEventListener('change', function(e) {
	scaleCoeff = parseInt(scaleInput.value);
}, false);

// Functions

function loop() {
	context.clearRect(0, 0, W, H);
	for (var i = 0; i < particleCount; i++) {
		var p = particles[i];
		p.update();
		p.render();
	}
};

function setup() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	canvas.height = H = document.body.clientHeight;
	canvas.width = W = document.body.clientWidth;

	gOrigin = new Vector(W/2, H/2);

	for (var i = 0; i < particleCount; i++) {
		var p = Particle.random();
		particles.push(p);
	}

	particleInput.setAttribute("value", particleCount);
	forceInput.setAttribute("value", forceCoeff);
	dragInput.setAttribute("value", dragCoeff);
	scaleInput.setAttribute("value", scaleCoeff);

	mainloop = setInterval(loop, 10);
};

document.onload = setup();
