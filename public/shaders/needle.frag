precision mediump float;

uniform sampler2D uImage;

varying vec2 vTexCoord;


/*
	Steg 1:
	Kvantisera bilden.


 */

void main() {
	float thread = 0.4; // Trådens bredd i förhållande till stygnet
	float gap = 0.02; // Marginal för en liten lucka mellan stygnen
	float nh = 64.0; // Antal pixels (stygn) på höjden i texturen
	float nw = 64.0; // Antal pixels (stygn) på bredden i texturen
	// string texturename = "pacman64.tx";  // Texturbild
	vec3 Cbg = vec3(0.1,0.1,0.3); // Bakgrundsfärg

	// Skalade koordinater för stygnen
	float s = vTexCoord.x*nw + 0.0;
	float t = vTexCoord.y*nh + 0.0;

	// Kvantisering av bilden. Sampla i mitten av pixeln.
	s = (floor(s) + 0.5) / nw;
	t = (floor(t) + 0.5) / nh;

	vec4 pixelValue = texture2D(uImage, vec2(s,t) );
	gl_FragColor = pixelValue;

}
