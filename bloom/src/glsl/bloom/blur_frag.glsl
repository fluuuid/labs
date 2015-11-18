uniform vec2 d0;
uniform vec2 d1;
uniform vec2 d2;
uniform vec2 d3;
varying vec2 vUv;
uniform sampler2D my_color_texture;
uniform vec2 uv_scale;
uniform float blurAmount;

#ifdef CUSTOM_COLOR_FUNC
CUSTOM_COLOR_FUNC
#else
vec4 customColorFunc(vec4 c){
  return clamp(c, 0.0, 60000.0);
}
#endif

void main()
{
	// blur from four samples
	vec4 c = blurAmount*(
	customColorFunc(texture2D(my_color_texture, (vUv * uv_scale)+d0))+
	customColorFunc(texture2D(my_color_texture, (vUv * uv_scale)+d1))+
	customColorFunc(texture2D(my_color_texture, (vUv * uv_scale)+d2))+
	customColorFunc(texture2D(my_color_texture, (vUv * uv_scale)+d3))
	);
  gl_FragColor=c;
}
