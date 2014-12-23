precision mediump float;

uniform sampler2D uImage;

varying vec2 vTexCoord;


/*
	Steg 1:
	X Kvantisera bilden.
	X Implement cross stitching
	Anti aliasing
	parameters 
		* Quantization only
		* Cross stitching off
		* width
		* height 
	Gör en loop för att rendera om bilden
	Skicka upp parametrar till shadern

 */

float filterstep(float edge, float x, float w) {
	if( (x+w/2.0) < edge) {
		return 0.0;
	}
	else if( (x - w/2.0) > edge) {
		return 1.0;
	}
	
	return ( (x+w/2.0) - edge ) / w;
}

float length_squared(vec2 v, vec2 w) {
	return float ((v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y));

}

float ptlined(vec2 v, vec2 w, vec2 p) {

  	// Return minimum distance between line segment vw and point p
	float l2 = length_squared(v, w);  // i.e. |w-v|^2 -  avoid a sqrt
	if (l2 == 0.0) {
		return distance(p, v);   // v == w case
	}
	// Consider the line extending the segment, parameterized as v + t (w - v).
	// We find projection of point p onto the line. 
	// It falls where t = [(p-v) . (w-v)] / |w-v|^2
   	float t = dot(p - v, w - v) / l2;
  	
  	if (t < 0.0) {
		return distance(p, v);       // Beyond the 'v' end of the segment
  	} else if (t > 1.0) {
  		return distance(p, w);  // Beyond the 'w' end of the segment
   	}
   	vec2 projection = v + t * (w - v);  // Projection falls on the segment
  	return distance(p, projection);
}


void main() {
	float thread = 0.2; // Trådens bredd i förhållande till stygnet
	float gap = 0.02; // Marginal för en liten lucka mellan stygnen
	float nh = 64.0; // Antal pixels (stygn) på höjden i texturen
	float nw = 64.0; // Antal pixels (stygn) på bredden i texturen
	// string texturename = "pacman64.tx";  // Texturbild
	vec4 Cbg = vec4(0.1, 0.1, 0.3, 1.0); // Bakgrundsfärg

	// Skalade koordinater för stygnen
	float s_scaled = vTexCoord.x*nw;
	float t_scaled = vTexCoord.y*nh;
	
	float s_final = s_scaled;
  	float t_final = t_scaled;

	vec4 C = texture2D( uImage, vec2((floor(s_final)+0.5)/nw, (floor(t_final)+0.5)/nh) );

	vec2 pos = vec2(mod(s_final, 1.0), mod(t_final, 1.0));


	// De fyra hörnpunkterna för stygnet
	vec2 p1 = vec2(gap + thread/2.0, gap + thread/2.0);
	vec2 p2 = vec2(1.0 - gap - thread/2.0, gap + thread/2.0);
	vec2 p3 = vec2(gap + thread/2.0, 1.0 - gap - thread/2.0);
	vec2 p4 = vec2(1.0 - gap - thread/2.0, 1.0 - gap - thread/2.0);

	// Avstånd till respektive delstygn (diagonala streck p1-p4, p2-p3)
	float d1 = ptlined(p1, p4, pos);
	float d2 = ptlined(p2, p3, pos);
	// Avstånd till närmaste stygn ger kryssets ytterkontur
	float dmin = min(d1, d2);
	
	float d = dmin;


	// Anti-aliasing, how?
	float inside = d;
	inside = filterstep(thread/2.0, d, 1.0/64.0);
	
	

	gl_FragColor = mix(C, Cbg, inside);

}
