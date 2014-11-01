// (function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;
    var curve, vectors, meshes, tube, size, lines;
    var isMouseDown, perlin = new SimplexNoise();
    var particleSystem;
    var step = 0;

    var shader = {};

    WAGNER.vertexShadersPath = "../shaders/vertex-shaders";
    WAGNER.fragmentShadersPath = "../shaders/fragment-shaders";
    WAGNER.assetsPath = "../shaders/assets/";

    var dirtPass, 
        barrelBlurPass,
        invertPass,
        boxBlurPass,
        fullBoxBlurPass,
        zoomBlurPass,
        multiPassBloomPass,
        denoisePass,
        sepiaPass,
        noisePass,
        vignettePass,
        vignette2Pass,
        CGAPass,
        edgeDetectionPass,
        dirtPass,
        blendPass,
        guidedFullBoxBlurPass,
        SSAOPass;

    
    buildScene();
    initPass();
    addControls();
    update();

    function initPass(){
        composer = new WAGNER.Composer( renderer, { useRGBA: false } );
        composer.setSize( window.innerWidth, window.innerHeight );

        // invertPass = new WAGNER.InvertPass();
        // boxBlurPass = new WAGNER.BoxBlurPass();
        // fullBoxBlurPass = new WAGNER.FullBoxBlurPass();
        // zoomBlurPass = new WAGNER.ZoomBlurPass();
        // multiPassBloomPass = new WAGNER.MultiPassBloomPass();
        // denoisePass = new WAGNER.DenoisePass();
        // sepiaPass = new WAGNER.SepiaPass();
        // noisePass = new WAGNER.NoisePass();
        vignettePass = new WAGNER.VignettePass();
        vignette2Pass = new WAGNER.Vignette2Pass();
        // CGAPass = new WAGNER.CGAPass();
        // edgeDetectionPass = new WAGNER.EdgeDetectionPass();
        // dirtPass = new WAGNER.DirtPass();
        // blendPass = new WAGNER.BlendPass();
        // guidedFullBoxBlurPass = new WAGNER.GuidedFullBoxBlurPass();
        SSAOPass = new WAGNER.SSAOPass();
    }

    function renderPass() {
        composer.reset();
        composer.render( scene, camera );
        
        // composer.pass( noisePass ) ;
        // composer.pass( denoisePass ) ;
        // composer.pass( CGAPass );
        
        composer.pass( vignettePass );
        composer.pass( vignette2Pass ) ;
        composer.pass( SSAOPass );

        composer.toScreen();
    }

    function buildScene() {
        scene = new THREE.Scene();
        //camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 10000);
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 500 );
        camera.position.z = 220;
        camera.lookAt(0);
        scene.add( camera );

        projector = new THREE.Projector();

        clock = new THREE.Clock( false );

        var phongShader = {
            uniforms: THREE.UniformsUtils.merge( [

                THREE.UniformsLib[ "common" ],
                THREE.UniformsLib[ "bump" ],
                THREE.UniformsLib[ "normalmap" ],
                THREE.UniformsLib[ "fog" ],
                THREE.UniformsLib[ "lights" ],
                THREE.UniformsLib[ "shadowmap" ],
                {
                    "amount"   : { type: 'f', value: .4},
                    "time"     : { type: 'f', value: 0},
                    "ambient"  : { type: "c", value: new THREE.Color( 0x60ff00 ) },
                    "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
                    "specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
                    "shininess": { type: "f", value: 10 },
                    "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }
                }

            ] ),

            vertexShader: [

                "#define PHONG",

                "varying vec3 vViewPosition;",
                "varying vec3 vNormal;",
                "uniform float time;",
                "uniform float amount;",

                THREE.ShaderChunk[ "map_pars_vertex" ],
                THREE.ShaderChunk[ "lightmap_pars_vertex" ],
                THREE.ShaderChunk[ "envmap_pars_vertex" ],
                THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
                THREE.ShaderChunk[ "color_pars_vertex" ],
                THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
                THREE.ShaderChunk[ "skinning_pars_vertex" ],
                THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
                THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

                "void main() {",

                    // THREE.ShaderChunk[ "map_vertex" ],
                    // THREE.ShaderChunk[ "lightmap_vertex" ],
                    THREE.ShaderChunk[ "color_vertex" ],

                    THREE.ShaderChunk[ "morphnormal_vertex" ],
                    THREE.ShaderChunk[ "skinbase_vertex" ],
                    THREE.ShaderChunk[ "skinnormal_vertex" ],
                    THREE.ShaderChunk[ "defaultnormal_vertex" ],

                "   vNormal = normalize( transformedNormal );",

                    THREE.ShaderChunk[ "morphtarget_vertex" ],
                    THREE.ShaderChunk[ "skinning_vertex" ],
                    // THREE.ShaderChunk[ "default_vertex" ],

                "   vec4 mvPosition;",
                "   #ifdef USE_SKINNING",
                "       mvPosition = modelViewMatrix * skinned;",
                "   #endif",
                "   #if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )",
                "       mvPosition = modelViewMatrix * vec4( morphed, 1.0 );",
                "   #endif",
                "   #if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )",
                "       mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "   #endif",

                "   mvPosition.x += sin(position.x * time * amount);",
                "   mvPosition.y += sin(position.y * time * amount);",
                "   mvPosition.z += cos(position.z * time * amount);",
                "   gl_Position = projectionMatrix * mvPosition;",

                    THREE.ShaderChunk[ "logdepthbuf_vertex" ],

                "   vViewPosition = -mvPosition.xyz;",

                    THREE.ShaderChunk[ "worldpos_vertex" ],
                    THREE.ShaderChunk[ "envmap_vertex" ],
                    THREE.ShaderChunk[ "lights_phong_vertex" ],
                    THREE.ShaderChunk[ "shadowmap_vertex" ],

                "}"

            ].join("\n"),

            fragmentShader: [

                "#define PHONG",

                "uniform vec3 diffuse;",
                "uniform float opacity;",

                "uniform vec3 ambient;",
                "uniform vec3 emissive;",
                "uniform vec3 specular;",
                "uniform float shininess;",

                THREE.ShaderChunk[ "color_pars_fragment" ],
                THREE.ShaderChunk[ "map_pars_fragment" ],
                THREE.ShaderChunk[ "alphamap_pars_fragment" ],
                THREE.ShaderChunk[ "lightmap_pars_fragment" ],
                THREE.ShaderChunk[ "envmap_pars_fragment" ],
                THREE.ShaderChunk[ "fog_pars_fragment" ],
                THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
                THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
                THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
                THREE.ShaderChunk[ "normalmap_pars_fragment" ],
                THREE.ShaderChunk[ "specularmap_pars_fragment" ],
                THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

                "void main() {",

                "   gl_FragColor = vec4( vec3( .0, 1., 1.0 ), opacity );",

                    THREE.ShaderChunk[ "logdepthbuf_fragment" ],
                    THREE.ShaderChunk[ "map_fragment" ],
                    THREE.ShaderChunk[ "alphamap_fragment" ],
                    THREE.ShaderChunk[ "alphatest_fragment" ],
                    THREE.ShaderChunk[ "specularmap_fragment" ],

                    THREE.ShaderChunk[ "lights_phong_fragment" ],

                    THREE.ShaderChunk[ "lightmap_fragment" ],
                    THREE.ShaderChunk[ "color_fragment" ],
                    THREE.ShaderChunk[ "envmap_fragment" ],
                    THREE.ShaderChunk[ "shadowmap_fragment" ],

                    THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

                    THREE.ShaderChunk[ "fog_fragment" ],

                "}"

            ].join("\n")
        }

        material = new THREE.ShaderMaterial( {
            uniforms: phongShader.uniforms,
            vertexShader: phongShader.vertexShader,
            fragmentShader: phongShader.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            lights: true
            // wireframe: true

        } );

        ico = new THREE.IcosahedronGeometry( 50, 3 );
        icoBuffer = new THREE.BufferGeometry().fromGeometry(ico);
        mesh = new THREE.Mesh(icoBuffer, material);
        scene.add(mesh);

        uniforms = {
            color: { type: "c", value: new THREE.Color( 0xFFFFFF ) }
        };

        var shaderMaterial = new THREE.ShaderMaterial( {
            uniforms:       uniforms,
            vertexShader:   document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        });


        var radius = 200;
        var particles = 4000;
        particlesGeom = new THREE.BufferGeometry();
        var positions = new Float32Array( particles * 3 );

        for( var v = 0; v < particles; v++ ) {
            positions[ v * 3 + 0 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 1 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 2 ] = ( Math.random() * 2 - 1 ) * radius;
        }

        particlesGeom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        particleSystem = new THREE.PointCloud( particlesGeom, shaderMaterial );
        scene.add( particleSystem );


        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        renderer.autoClearColor = true;
        // renderer.shadowMapEnabled = true;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        clock.start();

        // scene.add(new THREE.AmbientLight( 0x222222 ));

        f = new THREE.DirectionalLight(0x59bde1, .8);
        f.position.set(0, 1, 1);
        scene.add(f);

        // var helperLight = new THREE.DirectionalLightHelper(f, 100);
        // scene.add(helperLight);
    };

    function addControls()
    {
        controls = new THREE.TrackballControls( camera );
        controls.maxDistance = 500;
        controls.minDistance = 150;
        controls.dynamicDampingFactor = .15;
        // controls.enabled = false;
        controls.addEventListener( 'change', render );
        document.addEventListener( 'mousedown', onMouseDown, false );
        document.addEventListener( 'mouseup', onMouseUp, false );
        document.addEventListener( 'touchstart', onMouseDown, false );
        document.addEventListener( 'touchend', onMouseUp, false );
        
        window.addEventListener("resize", onWindowResize);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        // stats.domElement.style.display = 'none';
        document.body.appendChild(stats.domElement);
    }

    function update() {
        
        requestAnimationFrame(update);
        mesh.rotation.y += .01;
        particleSystem.rotation.y += .0005;
        f.rotation.z += 0.2;
        controls.update();
        mesh.material.uniforms.time.value = clock.getElapsedTime();

        render()
    };

    function render() {
        //renderer.render( scene, camera );
        renderPass();
        stats.update();
    }

    //EVENTS
    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.left = -window.innerWidth * 0.5;
        camera.right = window.innerWidth * 0.5;
        camera.top = window.innerHeight * 0.5;
        camera.bottom = -window.innerHeight * 0.5;
        camera.updateProjectionMatrix();
    };

    function onMouseUp(event)
    {
        event.preventDefault();
        isMouseDown = false;
    }

    function onMouseDown(event)
    {
        event.preventDefault();

        step = 0;

        isMouseDown = true;
    }

// })();