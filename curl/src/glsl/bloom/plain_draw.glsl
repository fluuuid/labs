varying vec2 vUv;
uniform sampler2D my_color_texture;
uniform vec3 color_multiplier;
uniform vec2 uv_scale;

void main()
{
	gl_FragColor = texture2D(my_color_texture, (vUv * uv_scale)) *vec4(color_multiplier, 1.0) ;
}
