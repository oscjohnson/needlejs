var gl; // A global variable for the WebGL context
var shaderProgram;
var image,
rectVertexPositionBuffer,
texCoordPositionBuffer,
texture,
parameters,
config = {};

// Default values for controls
config.thread = 0.1;
config.gap = 0.2;
config.nw = 64.0;
config.nh = 64.0;
config.shading = true;
config.noise = 0.0;
config.bg = [0.1, 0.1, 0.3];


function start() {
	var canvas = document.getElementById("canvas");
    
    config.resolution = {w: canvas.width, h: canvas.height};

    parameters = getURLParameters();

	initWebGL(canvas);      // Initialize the GL context

	initShaders();
    initTexture(function(){
        // Wait for image to load before init buffers
    	initBuffers();
        setInterval(draw, 15); // update every 15 milliseconds
    });
}


function draw(){
    // Update uniforms
    gl.uniform2f(shaderProgram.resolution, config.resolution.w, config.resolution.h);
    gl.uniform1f(shaderProgram.noise, config.noise);
    gl.uniform1f(shaderProgram.thread, config.thread);
    gl.uniform1f(shaderProgram.gap, config.gap);
    gl.uniform1f(shaderProgram.nw, config.nw);
    gl.uniform1f(shaderProgram.nh, config.nh);
    gl.uniform1f(shaderProgram.shading, config.shading);
    gl.uniform3f(shaderProgram.bg, config.bg[0], config.bg[1], config.bg[2]);

    // draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertexPositionBuffer.numItems);
}


function initShaders() {
	// Setup shaders
	shaderProgram = createProgram();
	gl.useProgram(shaderProgram);
}

function initTexture(callback) {
	image = new Image();

	image.onload = function () {

		texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, texture);


	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    callback();
	}

    if(parameters.image !== undefined) {
	   image.src = parameters.image; 

    } else {
       image.src = "img/pacman64.jpg"; 
    }
}

function initBuffers(image){	
    // Texture buffer
    texCoordPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      	 0.0, 0.0,
       	 1.0, 0.0,
     	 0.0, 1.0,
    	 1.0, 1.0
    ]), gl.STATIC_DRAW);


	gl.vertexAttribPointer(shaderProgram.texturePositionAttribute, 2, gl.FLOAT, false, 0, 0);


    //Send rectangle to GPU
    rectVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    rectVertexPositionBuffer.itemSize = 2;
    rectVertexPositionBuffer.numItems = 4; 

    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, rectVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertexPositionBuffer.numItems);
}

function initWebGL(canvas) {
  gl = null;
  
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
  }
  catch(e) {}
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }
  
  return gl;
}

function createShader(source, type){
    var shader;

    var source = getSourceSynch(source);
    shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function createProgram() {
    var fragmentShader = createShader('shaders/needle.frag', gl.FRAGMENT_SHADER);
    var vertexShader = createShader('shaders/pass-through.vert', gl.VERTEX_SHADER);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
    }

    // Init uniforms
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.texturePositionAttribute = gl.getAttribLocation(program, "aTexCoord");
    gl.enableVertexAttribArray(program.texturePositionAttribute);

    program.resolution = gl.getUniformLocation(program, 'iResolution');
    program.thread = gl.getUniformLocation(program, 'thread');
    program.noise = gl.getUniformLocation(program, 'gridnoiseAmplitue');
    program.gap = gl.getUniformLocation(program, 'gap');
    program.nw = gl.getUniformLocation(program, 'nw');
    program.nh = gl.getUniformLocation(program, 'nh');
    program.shading = gl.getUniformLocation(program, 'shading');
    program.bg = gl.getUniformLocation(program, 'bg');

    return program;
}









