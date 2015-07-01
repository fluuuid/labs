uniform vec2 resolution;
uniform vec3 color;
uniform float time;
uniform vec2 iMouse;

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdPlane( vec3 p )
{
    return p.y;
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
    vec3 cw = normalize(ta-ro);
    vec3 cp = vec3(sin(cr), cos(cr),0.0);
    vec3 cu = normalize( cross(cw,cp) );
    vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

vec2 opU( vec2 d1, vec2 d2 )
{
    return (d1.x<d2.x) ? d1 : d2;
}


vec2 map( in vec3 pos )
{
    // vec2 res = opU( vec2( sdPlane(     pos), 1.0 ),
    vec2 res = vec2( sdSphere( pos-vec3(0.0,0., 0.0), 0.25));
    return res;
}

vec2 castRay( in vec3 ro, in vec3 rd )
{
    float tmin = 1.0;
    float tmax = 20.0;
    
    float precis = 0.002;
    float t = tmin;
    float m = -1.0;
    for( int i=0; i<50; i++ )
    {
        vec2 res = map( ro+rd*t );
        if( res.x<precis || t>tmax ) break;
        t += res.x;
        m = res.y;
    }

    if( t>tmax ) m=-1.0;
    return vec2( t, m );
}

vec3 calcNormal( in vec3 pos )
{
    vec3 eps = vec3( 0.001, 0.0, 0.0 );
    vec3 nor = vec3(
        map(pos+eps.xyy).x - map(pos-eps.xyy).x,
        map(pos+eps.yxy).x - map(pos-eps.yxy).x,
        map(pos+eps.yyx).x - map(pos-eps.yyx).x );
    return normalize(nor);
}

float calcAO( in vec3 pos, in vec3 nor )
{
    float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float hr = 0.01 + 0.12*float(i)/4.0;
        vec3 aopos =  nor * hr + pos;
        float dd = map( aopos ).x;
        occ += -(dd-hr)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );    
}


vec3 render( in vec3 ro, in vec3 rd )
{ 
    vec3 col = color;
    vec2 res = castRay(ro,rd);
    float t = res.x;
    float m = res.y;

    if( m>-0.5 )
    {
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal( pos );
        vec3 ref = reflect( rd, nor );
        
        // material        
        col = 0.45 + 0.13*sin( vec3(0.05,0.08,0.10)*(m-1.0) );
        
        if( m<1.5 )
        {
            
            float f = mod( floor(5.0*pos.z) + floor(5.0*pos.x), 2.0);
            col = 0.14 + 0.1*f*vec3(1.0);
        }

        // // lighitng        
        // float occ = calcAO( pos, nor );
        // vec3  lig = normalize( vec3(-0.6, 0.7, -0.5) );
        // float amb = clamp( 0.5+0.5*nor.y, 0.0, 1.0 );
        // float dif = clamp( dot( nor, lig ), 0.0, 1.0 );
        // float bac = clamp( dot( nor, normalize(vec3(-lig.x,0.0,-lig.z))), 0.0, 1.0 )*clamp( 1.0-pos.y,0.0,1.0);
        // float dom = smoothstep( -0.1, 0.1, ref.y );
        // float fre = pow( clamp(1.0+dot(nor,rd),0.0,1.0), 2.0 );
        // float spe = pow(clamp( dot( ref, lig ), 0.0, 1.0 ),16.0);
        
        // // dif *= softshadow( pos, lig, 0.02, 2.5 );
        // // dom *= softshadow( pos, ref, 0.02, 2.5 );

        // vec3 brdf = vec3(0.0);
        // brdf += 1.20*dif*vec3(1.00,0.90,0.60);
        // brdf += 1.20*spe*vec3(1.00,0.90,0.60)*dif;
        // brdf += 0.30*amb*vec3(0.50,0.70,1.00)*occ;
        // brdf += 0.40*dom*vec3(0.50,0.70,1.00)*occ;
        // brdf += 0.30*bac*vec3(0.25,0.25,0.25)*occ;
        // brdf += 0.40*fre*vec3(1.00,1.00,1.00)*occ;
        // brdf += 0.02;
        // col = col*brdf;

        // col = mix( col, vec3(0.8,0.9,1.0), 1.0-exp( -0.0005*t*t ) );

    }

    return vec3( clamp(col,0.0,1.0) );
}

void main() {
    vec2 q = gl_FragCoord.xy/resolution.xy;
    vec2 p = -1.0+2.0*q;
    p.x *= resolution.x/resolution.y;

    vec2 mo = iMouse.xy/resolution.xy;

    // // camera   
    vec3 ro = vec3( 0., 6.0, 0. );
    vec3 ta = vec3( -0.5, -0.4, 0.5 );
    
    // camera-to-world transformation
    mat3 ca = setCamera( ro, ta, 0.0 );
    
    // ray direction
    vec3 rd = ca * normalize( vec3(p.xy,2.5) );

    vec3 col = render( ro, rd );

    gl_FragColor = vec4( col, 1.0 );
}