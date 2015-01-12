attribute vec2 aVertexPosition;
attribute vec2 aTexCoord;



varying vec2 vTexCoord;

void main() {


	gl_Position =  vec4(aVertexPosition, 0.0, 1.0);
	vTexCoord = aTexCoord;
}
