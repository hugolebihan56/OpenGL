
attribute vec3 aVertexPosition; // pos qui vien du 1er vertex buffer
attribute vec2 texCoords; 
attribute vec3 uPeau;

uniform mat4 uMVMatrix; // matrice 
uniform mat4 uPMatrix; // matrice 
uniform float zCoord;

varying vec2 tCoords;

void main(void) {
	tCoords = texCoords; // texcoord= coord d'un point dans la texture entre 0 et 1
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.xy, zCoord, 1.0);

}
