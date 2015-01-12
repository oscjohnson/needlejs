precision mediump float;

uniform sampler2D uImage;

varying vec2 vTexCoord;

uniform float thread; // Trådens bredd i förhållande till stygnet
uniform float gap; // Marginal för en liten lucka mellan stygnen
uniform float nh; // Number of pixels (stiches) height in texture
uniform float nw; // Number of pixels (stiches) width in texture
uniform vec3 bg; // Background color
uniform float gridnoiseAmplitue; // Background color

uniform bool shading; // Show cross stitching shading or or just original image

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v) {
	const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
	                  0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
	                 -0.577350269189626,  // -1.0 + 2.0 * C.x
	                  0.024390243902439); // 1.0 / 41.0
	// First corner
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);

	// Other corners
	vec2 i1;
	//i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
	//i1.y = 1.0 - i1.x;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	// x0 = x0 - 0.0 + 0.0 * C.xx ;
	// x1 = x0 - i1 + 1.0 * C.xx ;
	// x2 = x0 - 1.0 + 2.0 * C.xx ;
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;

	// Permutations
	i = mod289(i); // Avoid truncation effects in permutation
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;

	// Gradients: 41 points uniformly over a line, mapped onto a diamond.
	// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;

	// Normalise gradients implicitly by scaling m
	// Approximation of: m *= inversesqrt( a0*a0 + h*h );
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

	// Compute final noise value at P
	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

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

	vec4 Cbg = vec4(bg, 1.0);

	// Skalade koordinater för stygnen
	float s_scaled = vTexCoord.x*nw;
	float t_scaled = vTexCoord.y*nh;

	//float gridnoiseAmplitue = 0.2;
	float s_noise = snoise(vec2(s_scaled * 0.2, t_scaled * 0.2)) * gridnoiseAmplitue;
  	float t_noise = snoise(vec2(s_scaled * 0.2 + 43.76, t_scaled * 0.2 + 3.1415)) * gridnoiseAmplitue;
	
	float s_final = s_scaled + s_noise;
  	float t_final = t_scaled + t_noise;

  	// Quantization
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
	
	// Skapa en slumpmässig ojämnhet i kanten
	// float d_noise = 0.01 * snoise(vec2(10.0 * s_scaled, 10.0 * t_scaled));
	float d = dmin;// + d_noise;

	float inside = filterstep(thread/2.0, d, 1.0/64.0);
	

	
	if(shading) { // Render cross-stich shading
		gl_FragColor = mix(C, Cbg, inside);
		// float myNoise = snoise(vec2(s_scaled, t_scaled));
		// gl_FragColor = vec4(myNoise, myNoise, myNoise, 1);
	} else { // Render original image
		gl_FragColor = texture2D(uImage, vTexCoord);
	}

}

