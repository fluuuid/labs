// (function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;
    var curve, vectors, meshes, tube, size, lines;
    var particleSystem;
    var attributes, uniforms;
    var mouse, projector, raycaster;
    var step = 0;

    var shader = {};

    WAGNER.vertexShadersPath = "/common/shaders/vertex-shaders";
    WAGNER.fragmentShadersPath = "/common/shaders/fragment-shaders";
    WAGNER.assetsPath = "/common/shaders/assets/";

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
        
        // composer.pass( vignettePass );
        // composer.pass( vignette2Pass ) ;
        // composer.pass( SSAOPass );

        composer.toScreen();
    }

    function getRandomColor()
    {
        colors = [0x9b59b6, 0xe74c3c, 0xf1c40f, 0xd35400, 0x1abc9c, 0x95a5a6, 0x3498db]
        step++;
        return colors[step%colors.length];
    }

    function buildScene() {
        scene = new THREE.Scene();
        // camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 500);
        camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 450;
        camera.lookAt(0);
        scene.add( camera );

        mouse = new THREE.Vector2( 0, 0 );
        projector = new THREE.Projector();
        raycaster = new THREE.Raycaster();

        clock = new THREE.Clock( false );

        var amount = 1.5;

        attributes = {
        }
        uniforms = {
            mouse : {type: "v2", value: new THREE.Vector2( 0, 0 )},
            amount: { type: 'f', value: amount },
            time : {type: "f", value: 0.},
            color: { type: "v4", value: new THREE.Vector4( 255, 255, 255, .2 ) }
        }

        var shaderMaterial = new THREE.ShaderMaterial( {
            attributes: attributes,
            uniforms: uniforms,
            wireframe: true,
            transparent: true,
            vertexShader:   document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        });

        //THREE.TorusGeometry( radius, tube, segmentsR, segmentsT, arc );

        ico = new THREE.TorusGeometry( 50, 10, 15, 15, 2*Math.PI );
        console.log(ico);
        // ico = new THREE.SphereGeometry( 50, 80, 80);
        // ico = new THREE.IcosahedronGeometry( 50, 3 );
        icoBuffer = new THREE.BufferGeometry().fromGeometry(ico);
        mesh = new THREE.Mesh(icoBuffer, shaderMaterial);
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        scene.add(mesh);


        var particles = ico.vertices.length;
        particlesGeom = new THREE.BufferGeometry();
        var positions = new Float32Array( particles * 3 );

        for( var v = 0; v < particles; v++ ) {
            positions[ v * 3 + 0 ] = ico.vertices[v].x;
            positions[ v * 3 + 1 ] = ico.vertices[v].y;
            positions[ v * 3 + 2 ] = ico.vertices[v].z;
        }

        textureParticle = THREE.ImageUtils.loadTexture('img/particle.png');

        particlesGeom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

        uniformsParticles = {
            mouse : {type: "v2", value: new THREE.Vector2( 0, 0 )},
            amount: { type: 'f', value: amount },
            time : {type: "f", value: 0.},
            color: { type: "v4", value: new THREE.Vector4( 255, 255, 255, .4 ) },
            texture : {type: 't', value: THREE.ImageUtils.loadTexture('img/particle.png')}
        }

        var shaderMaterialParticle = new THREE.ShaderMaterial( {
            attributes: attributes,
            uniforms: uniformsParticles,
            transparent: true,
            depthTest: false,
            vertexShader:   document.getElementById( 'vertexshaderParticle' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshaderParticle' ).textContent,
        });

        shaderMaterialParticle.uniforms.color = { type: "v4", value: new THREE.Vector4( 255, 255, 255, 1 ) }

        particleSystem = new THREE.PointCloud( particlesGeom, shaderMaterialParticle );
        scene.add( particleSystem );

        hitMesh = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshBasicMaterial( {color: 0xff0000, wireframe: true} ));
        // hitMesh.rotation.y = Math.PI/2;
        hitMesh.visible = false;
        scene.add( hitMesh );

        // var helper = new THREE.WireframeHelper( hitMesh );
        // helper.material.depthTest = false;
        // helper.material.opacity = 0.25;
        // helper.material.transparent = true;
        // scene.add( helper );


        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        renderer.autoClearColor = true;
        // renderer.shadowMapEnabled = true;
        // renderer.shadowMapType = THREE.PCFSoftShadowMap;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        clock.start();

        scene.add(new THREE.AmbientLight( 0 ));

        // f = new THREE.DirectionalLight(0xff8e08, .5);
        // f.position.set(0, 0.1, 0);
        // f.castShadow = true;
        // scene.add(f);

        // sun = new THREE.PointLight( 0xfff600, 1, 5000 );
        // // sun.castShadow = true;
        // mesh.add(sun);

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
        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'mouseup', onMouseUp, false );
        
        window.addEventListener("resize", onWindowResize);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        // stats.domElement.style.display = 'none';
        document.body.appendChild(stats.domElement);
    }

    function update() {
        
        // mesh.rotation.y += .01;
        // particleSystem.rotation.y -= .0005;
        // f.rotation.z += 0.2;

        checkHit();

        controls.update();

        uniforms.mouse.value.x = mouse.x;
        uniforms.mouse.value.y = mouse.y;

        uniformsParticles.mouse.value.x = mouse.x;
        uniformsParticles.mouse.value.y = mouse.y;

        // console.log(uniformsParticles.mouse.value);

        uniforms.time.value = clock.getElapsedTime();
        uniformsParticles.time.value = clock.getElapsedTime();


        render()
        requestAnimationFrame(update);
    };

    function checkHit() {

        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject(camera);
        raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
        var intersects = raycaster.intersectObject( hitMesh );

        if ( intersects.length > 0 ) {

            var o = intersects[0];

            // uniforms.mouse.value.x = o.point.x;
            // uniforms.mouse.value.y = o.point.y;

            // uniformsParticles.mouse.value.x = o.point.x;
            // uniformsParticles.mouse.value.y = o.point.y;

            
            // console.log(attributes.perlin.value);

            // particleSystem.position.x = o.point.x;
            // particleSystem.position.y = o.point.y;

            // follow.position.y += (o.point.y - follow.position.y)/10;
            // follow.position.z += (o.point.z - follow.position.z)/10;
            // follow.position.x += (o.point.x - follow.position.x)/10;

        }

    }


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

    function onMouseMove( event ) {
        mouse.x = event.pageX - window.innerWidth * .5;
        mouse.y = event.pageY - window.innerHeight * .5;
    }

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