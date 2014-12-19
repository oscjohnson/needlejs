precision mediump float;

uniform sampler2D uImage;

varying vec2 vTexCoord;

void main() {
	vec4 pixelValue = texture2D(uImage, vTexCoord);
	gl_FragColor = pixelValue;

}
