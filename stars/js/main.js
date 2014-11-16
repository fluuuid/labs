// (function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;
    var curve, vectors, meshes, tube, size, lines;
    var isMouseDown, perlin = new SimplexNoise();
    var particleSystem;
    var step = 0;

    var postprocessing = {};

    buildScene();

    function initPass(){
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );
        postprocessing.composer = composer;

        var width = window.innerWidth;
        var height = window.innerHeight;

        var passes = [
            ["bloom", new THREE.BloomPass( 10.25 ), true],
            ["film", new THREE.FilmPass( 0.85, 0.5, 2048, false ), false],
            ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true]
        ]

        for (var i = 0; i < passes.length; i++) {
            postprocessing[passes[i][0]] = passes[i][1];
            if(passes[i][2]) passes[i][1].renderToScreen = passes[i][2];
        };

        postprocessing['vignette'].uniforms[ "offset" ].value = 1.5;
        postprocessing['vignette'].uniforms[ "darkness" ].value = 1.6;

        for (var i = 0; i < passes.length; i++) {
            composer.addPass(passes[i][1]);
        };

    }

    function renderPass() {
        postprocessing.composer.render();
    }

    function getRandomColor()
    {
        colors = [0x9b59b6, 0xe74c3c, 0xf1c40f, 0xd35400, 0x1abc9c, 0x95a5a6, 0x3498db]
        step++;
        return colors[step%colors.length];
    }

    function buildScene() {
        scene = new THREE.Scene();
        //camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 10000);
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 3000 );
        camera.position.z = 270;
        camera.lookAt(10);
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
                    "amount"   : { type: 'f', value: .3},
                    "time"     : { type: 'f', value: 0},
                    "ambient"  : { type: "c", value: new THREE.Color( 0xff7e00 ) },
                    "emissive" : { type: "c", value: new THREE.Color( 0xff9000 ) },
                    "specular" : { type: "c", value: new THREE.Color( 0xe4ff03 ) },
                    "shininess": { type: "f", value: 100 },
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

                "   mvPosition.x += sin(position.x * (time * .5) * amount);",
                "   mvPosition.y += sin(position.y * (time * .5) * amount);",
                // "   mvPosition.z += cos(position.z * time * amount);",
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

                "   gl_FragColor = vec4( vec3( 1., 1., .0 ), opacity );",

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
            lights: true,
            fog : true,
            wireframe: true

        } );

        ico = new THREE.IcosahedronGeometry( 100, 2 );
        icoBuffer = new THREE.BufferGeometry().fromGeometry(ico);
        mesh = new THREE.Mesh(icoBuffer, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        stars = []
        satellite = new THREE.IcosahedronGeometry( 10, 3 );

        for (var i = 0; i < 20; i++) {
            stars[i] = new THREE.Mesh(satellite, new THREE.MeshLambertMaterial( {
                color: getRandomColor(), ambient: 0x005aff
            } ));

            var size = 300

            stars[i].scale.multiplyScalar(perlin.noise(i + 1, Math.random()) * 4);
            stars[i].distance = 180 * (i + 1);
            stars[i].position.x = (Math.random() * size/2 - (size)) * Math.sin(2 * Math.PI);
            stars[i].position.y = (Math.random() * size/2 - (size/2)) * Math.sin(2 * Math.PI);
            stars[i].position.z = (Math.random() * size/2 - (size)) * Math.sin(2 * Math.PI);
            stars[i].castShadow = true;
            stars[i].receiveShadow = true;


            scene.add(stars[i]);
        };

        var particleMaterial = new THREE.PointCloudMaterial({
            size: 5,
            map: THREE.ImageUtils.loadTexture('img/particles.png'),
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        })

        var radius = 2000;
        var particles = 800;
        particlesGeom = new THREE.BufferGeometry();
        var positions = new Float32Array( particles * 3 );

        for( var v = 0; v < particles; v++ ) {
            positions[ v * 3 + 0 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 1 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 2 ] = ( Math.random() * 2 - 1 ) * radius;
        }

        particlesGeom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        particleSystem = new THREE.PointCloud( particlesGeom, particleMaterial );
        scene.add( particleSystem );


        renderer = new THREE.WebGLRenderer({antialias: false, alpha: false});
        renderer.autoClear = false;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        clock.start();

        scene.add(new THREE.AmbientLight( 0 ));

        f = new THREE.DirectionalLight(0xff8e08, .5);
        f.position.set(0, 0.1, 0);
        f.castShadow = true;
        scene.add(f);

        sun = new THREE.PointLight( 0xfff600, 1, 5000 );
        // sun.castShadow = true;
        mesh.add(sun);

        initPass();
        addControls();
        update();

        // var helperLight = new THREE.DirectionalLightHelper(f, 100);
        // scene.add(helperLight);
    };

    function addControls()
    {
        controls = new THREE.TrackballControls( camera );
        controls.maxDistance = 1000;
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
        stats.domElement.style.display = 'none';
        document.body.appendChild(stats.domElement);
    }

    function update() {
        
        requestAnimationFrame(update);
        mesh.rotation.y += .01;
        particleSystem.rotation.y -= .0005;
        // f.rotation.z += 0.2;

        for (var i = stars.length - 1; i >= 0; i--) {
            var speed = (clock.getElapsedTime() *0.1 ) * stars[i].distance / 200
            stars[i].position.x += stars[i].distance * Math.cos(2 * Math.PI * speed) - stars[i].position.x;
            // stars[i].position.y = stars[i].distance * Math.sin(2 * Math.PI * speed);
            stars[i].position.z += stars[i].distance * Math.sin(2 * Math.PI * speed) - stars[i].position.z;
            stars[i].lookAt(mesh.position);
            // stars[i].rotateY(Math.PI / 2);
            // stars[i].rotation.x += .01;
            // stars[i].rotateZ(-Math.PI / 2);
        }

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