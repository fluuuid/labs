varying vec2 vUv;
uniform sampler2D my_color_texture;
uniform float exposure;
uniform float power;
uniform float desaturate;
uniform float brightness;
uniform float max_vignetting;
uniform int tonemap_method;
uniform vec2 vignetting_k;
uniform int transparent;

vec3 tonemap(vec3 c)
{
	if(tonemap_method==0){
		return clamp(c,0.0,1.0);
	}else{
		return vec3(1.0,1.0,1.0)-exp(-max(1.5*c,0.0));
	}
}


void main()
{
    vec2 dist_to_edge = vec2(1.0)-2.0*abs(vUv-vec2(0.5));
    dist_to_edge = clamp(dist_to_edge*vignetting_k, 0.0, max_vignetting);
    float vignetting = dist_to_edge.x*dist_to_edge.y;
    vec3 col=texture2D(my_color_texture, vUv).rgb*exposure;
    col=clamp(col, 0.0, 10000.0);
    vec3 col_p=vec3(pow(col.r, power), pow(col.g, power), pow(col.b, power));
    float a=(desaturate*col_p.r+desaturate*col_p.g+desaturate*col_p.b)*(1.0/3.0);
    col_p=col_p*(1.0-desaturate)+vec3(a,a,a);

    if(transparent == 1)
    {
        col_p=tonemap(col_p)*vignetting;
        col_p=clamp(col_p-vec3(0.1), 0.0, 1.0);
        float brightness_f=dot(col_p, vec3(brightness));
        col_p*=clamp(brightness_f*5.0-0.2, 0.0, 1.0);
        gl_FragColor = vec4(col_p, clamp(brightness_f*2.0,0.0,1.0) );  
    } else {
        gl_FragColor = vec4(col_p, 1.0 );  
    }
}
