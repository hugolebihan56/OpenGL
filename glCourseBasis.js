
// =====================================================
var gl;
var shadersLoaded = 0;
var vertShaderTxt;
var fragShaderTxt;
var shaderProgram = null;
var vertexBuffer;
var colorBuffer;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var objMatrix = mat4.create();
mat4.identity(objMatrix);
var ALPHA  = 1.0;
var TRANCHE = 0;
var UneTRANCHE = 0;
var texNames = [];
var texImages = [];
var ModeTranche = false;
var SEUIL = 0.0;
var COUCHE1 = [0.067, 0.133, 0.933,1.0];
var COUCHE2 = [1.0, 1.0, 0.0,1.0];
var COUCHE3 = [1.0, 0.0, 0.0,1.0];
var trueColor = false;
var CONTOUR = false;

// =====================================================
function webGLStart() {
	loadImages('images','image','jpg');
	var canvas = document.getElementById("WebGL-test");
	canvas.onmousedown = handleMouseDown; // en bleu fonctions dans le callbcks.js 
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	initGL(canvas);
	initBuffers(); // creation geometrie et stockage carte graphique 
	initTexture(); // chargement texture et stock sur memoire carte graphique 
	loadShaders('shader'); // appel de vertex shader (utilise liste sommets donné par vertex buffer)	
	// coordonnees d'un point vu de la carte graphique entre -1 (gauche) et 1 (droite). lie depuis disque dur les shaders
	// puis envoy a la carte graphique 
	gl.clearColor(0.7, 0.7, 0.7, 1.0); // reinitialise l'image à une certaine couleur 
	gl.enable(gl.DEPTH_TEST); // gestion de la profondeur.
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	tick();
}

// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl"); // recup contexte a partir du canvas
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height); // zone de dessin dans la totalité du canvas
		// possible ici de separer si 4 vues différentes par exemple de decouper 
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
function initBuffers() {
	// Vertices (array)
	vertices = [
		-0.3, -0.3, 0.0,
		-0.3,  0.3, 0.0,
		 0.3,  0.3, 0.0,
		 0.3, -0.3, 0.0];
	vertexBuffer = gl.createBuffer(); // creation du buffer et recup d'un identifiant
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // envoi tableau sur buffer qui est bind
	vertexBuffer.itemSize = 3; // taille de chaque point en terme de coordonnees
	vertexBuffer.numItems = 4; // nombre de points

	// Texture coords (array)
	texcoords = [ 
		  0.0, 0.0, 
		  0.0, 1.0,
		  1.0, 1.0,
		  1.0, 0.0 ];
	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
	texCoordBuffer.itemSize = 2;
	texCoordBuffer.numItems = 4;
	
	// Index buffer (array)
	var indices = [ 0, 1, 2, 3];
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	indexBuffer.itemSize = 1;
	indexBuffer.numItems = indices.length;	
}

// =====================================================
function initTexture()
{		
		texNames.forEach(function(item, index) {
		var texImage = new Image();
		texImage.src = texNames[index];
		texImages.push(gl.createTexture());
		texImages[index].image = texImage;
		texImages[index].image.onload = function () { // gestion de la lecture de l'image
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, texImages[index]);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImages[index].image); // envoi img sur carte graph possible car image deja chargée
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.uniform1i(shaderProgram.samplerUniform, 0 ); // sampler est un id que l'on utilise dans le fragshader 
		gl.activeTexture(gl.TEXTURE0);
		}
	})
}

// =====================================================
function loadImages(dir, name, ext) {
	for (var i = 0; i <= 360; i	++) {
		if (i < 10) {	
			var images = dir+'/'+name+'-0000'+i+'.'+ext;
			texNames.push(images);
		}
		else if (i < 100) {
			var images = dir+'/'+name+'-000'+i+'.'+ext;
			texNames.push(images);	
		}
		else if (i < 1000) {
			var images = dir+'/'+name+'-00'+i+'.'+ext;
			texNames.push(images);	
		}
	}
}

// =====================================================
function loadShaders(shader) {
	loadShaderText(shader,'.vs');
	loadShaderText(shader,'.fs');
}

// =====================================================
function loadShaderText(filename,ext) {   // technique car lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
			if(ext=='.vs') { vertShaderTxt = xhttp.responseText; shadersLoaded ++; }
			if(ext=='.fs') { fragShaderTxt = xhttp.responseText; shadersLoaded ++; }
			if(shadersLoaded==2) {
				initShaders(vertShaderTxt,fragShaderTxt);
				shadersLoaded=0;
			}
    }
  }
  xhttp.open("GET", filename+ext, true);
  xhttp.send();
}

// =====================================================
function initShaders(vShaderTxt,fShaderTxt) { // doit lire les 2 fich sur disque dur, compil et faire les liens

	vshader = gl.createShader(gl.VERTEX_SHADER); // cre id pour vertex shader
	gl.shaderSource(vshader, vShaderTxt); // li
	gl.compileShader(vshader); // compil par GPU ou CPU ?
	if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(vshader));
		return null;
	}

	fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fshader, fShaderTxt);
	gl.compileShader(fshader);
	if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(fshader));
		return null;
	}

	shaderProgram = gl.createProgram(); // creation shaderporgramm
	gl.attachShader(shaderProgram, vshader);
	gl.attachShader(shaderProgram, fshader);

	gl.linkProgram(shaderProgram); // creation execitable qui va sur carte graph

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // pos sommet cad le 1er veretx buffer
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.texCoordsAttribute = gl.getAttribLocation(shaderProgram, "texCoords"); /// autre vertex buffer correspo aux ccord texture
	gl.enableVertexAttribArray(shaderProgram.texCoordsAttribute);
	
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler"); // recup id pour acceder a cette variable de texture 
	
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix"); // 
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix"); //
	shaderProgram.zCoord = gl.getUniformLocation(shaderProgram, "zCoord"); //
	shaderProgram.uAlpha = gl.getUniformLocation(shaderProgram, "uAlpha"); //
	shaderProgram.uSeuillage = gl.getUniformLocation(shaderProgram, "uSeuil"); //
	shaderProgram.uCouche1 = gl.getUniformLocation(shaderProgram, "uCouche1"); //
	shaderProgram.uCouche2 = gl.getUniformLocation(shaderProgram, "uCouche2"); //
	shaderProgram.uCouche3 = gl.getUniformLocation(shaderProgram, "uCouche3"); //
	shaderProgram.fakeColor = gl.getUniformLocation(shaderProgram, "trueColor"); //
	shaderProgram.contour = gl.getUniformLocation(shaderProgram, "contour"); //

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
     	vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.texCoordsAttribute,
      	texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
}


// =====================================================
function setUniforms(zValue, aValue) {
	if(shaderProgram != null) {
		
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		gl.uniform1f(shaderProgram.zCoord,zValue);
		gl.uniform1f(shaderProgram.uAlpha, aValue);
		gl.uniform1f(shaderProgram.uSeuillage, SEUIL);
		gl.uniform4fv(shaderProgram.uCouche1, COUCHE1);
		gl.uniform4fv(shaderProgram.uCouche2, COUCHE2);
		gl.uniform4fv(shaderProgram.uCouche3, COUCHE3);
		gl.uniform1f(shaderProgram.fakeColor, trueColor);
		gl.uniform1f(shaderProgram.contour, CONTOUR);
	}
}

// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	if(shaderProgram != null) {

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0.0, 0.0, -2.0]);
		mat4.multiply(mvMatrix, objMatrix);
		if (UneTRANCHE == 0 ) {ModeTranche = false} else {ModeTranche = true}
		if (ModeTranche){
			setUniforms(1.0*(0.5/360.0), ALPHA);		
			gl.bindTexture(gl.TEXTURE_2D, texImages[UneTRANCHE]);
			gl.drawElements(gl.TRIANGLE_FAN, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
				
		}
		else {
			for(i=0; i<360-(TRANCHE*(360/100)); i++) {
				setUniforms(-0.2+i*(0.5/360.0), ALPHA);
				gl.bindTexture(gl.TEXTURE_2D, texImages[i]);
				gl.drawElements(gl.TRIANGLE_FAN, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);				
				}		
		}
	}
}
