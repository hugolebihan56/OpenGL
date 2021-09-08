
precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler; // id pour aller chercher pixels dans la texture

uniform float uAlpha;
uniform float uSeuil;

uniform vec4 uCouche1;
uniform vec4 uCouche2;
uniform vec4 uCouche3;
uniform vec4 uCouche4;

uniform bool trueColor;
uniform bool contour;

void main(void) {
	vec4 texCol = texture2D(uSampler, vec2(tCoords.s, tCoords.t));
	if (uSeuil != 0.0){
		if(texCol.r > uSeuil ){
			gl_FragColor = vec4(1.0,1.0,1.0,1.0);
		}
		else {
			gl_FragColor = vec4(0.0,0.0,0.0,1.0);
		}
	}
	else {

		if (!trueColor){
			if (texCol.r < 0.008 ){
				gl_FragColor = vec4(texCol.rgb,0.0);// Supprime les pixels noirs + bruits
			}
			else if (texCol.r < 0.25 ){
				gl_FragColor = vec4(uCouche1.rgba);
			}
			else if (texCol.r < 0.5 &&  texCol.r > 0.25){
				gl_FragColor = vec4(uCouche4.rgba);
			}
			else if (texCol.r > 0.5 && texCol.r < 0.7){
				gl_FragColor = vec4(uCouche2.rgba);
			}
			else {
				gl_FragColor = vec4(uCouche3.rgba);
				}
		} 
		else {
			if (!contour){
				gl_FragColor = vec4(texCol.rgb,1.0);
			}
			else {
				if (texCol.r < 0.008 ){
						gl_FragColor = vec4(texCol.rgb,0.0);
				}
				else {
					gl_FragColor = vec4(texCol.rgb,1.0);
				}			
			}

		}
	}
}

