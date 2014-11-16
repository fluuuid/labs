(function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;
    var curve, vectors, meshes, tube, size, lines;
    var isMouseDown, perlin = new SimplexNoise();
    var step = 0;

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
        multiPassBloomPass = new WAGNER.MultiPassBloomPass();
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
        // SSAOPass = new WAGNER.SSAOPass();
    }

    function renderPass() {
        composer.reset();
        composer.render( scene, camera );
        
        // composer.pass( dirtPass ) ;
        // composer.pass( denoisePass ) ;
        composer.pass( multiPassBloomPass );
        composer.pass( vignette2Pass ) ;
        
        composer.pass( vignettePass );

        composer.toScreen();
    }

    function limit(number, min, max)
    {
        return Math.min( Math.max(min,number), max );
    }

    function getRandomColor()
    {
        letters = '0123456789ABCDEF'.split('')
        color = '#'
        for (var i = 5; i >= 0; i--) {
            color += letters[Math.round(Math.random() * 15)]
        };
        return color
    }

    function buildScene() {
        scene = new THREE.Scene();
        //camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 10000);
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
        camera.position.z = 1800;
        camera.lookAt(0);
        scene.add( camera );

        clock = new THREE.Clock( false );

        material = new THREE.MeshPhongMaterial( {
            wireframe : false, 
            ambient: 0,
            specular: 0xfa7cff, 
            shininess: 5, 
            shading: THREE.FlatShading,
            color: 0xff7200
        } );

        lines = 10

        vectors = [];
        meshes = [];

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        // renderer.autoClearColor = true;
        // renderer.shadowMapEnabled = true;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        clock.start();

        scene.add(new THREE.AmbientLight( 0x222222 ));

        var f = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        f.position.set(0, 1, 0);
        scene.add(f);

        f = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        f.position.set(0, -1, 0);
        scene.add(f);
    };

    function addControls()
    {
        controls = new THREE.TrackballControls( camera );
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
        
        controls.update();

        if(isMouseDown)
        {
            // step++;
            // if(step % 2 != 0) return 
            if(vectors[0].length > 40) return 

            for(var i = 0; i<lines; i++){

                if(meshes[i]) scene.remove(meshes[i]);

                // size = 10;
                size = Math.round(1.8 * i)

                var next = new THREE.Vector3( 0, 0, 0 );
                var vector = vectors[i][vectors[i].length-1];

                var x = perlin.noise(vector.x, Math.random());
                var y = perlin.noise(vector.y, Math.random());
                var z = perlin.noise(vector.z, Math.random());

                x *= 300;
                y *= 300;
                z *= 300;

                next.copy(vector).add(new THREE.Vector3( x, y, z ));

                vectors[i].push(next);

                curve = new THREE.SplineCurve3(vectors[i]);

                tube = new THREE.TubeGeometry(curve, Math.round(vectors[i].length * 3 * 3), size, 3, false);
                tubeBuffer = new THREE.BufferGeometry().fromGeometry(tube);
                meshes[i] = new THREE.Mesh(tubeBuffer, material);
                // meshes[i].matrixAutoUpdate = false
                scene.add(meshes[i]);
            };
        }

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

        if(vectors.length == 0)
        {
            for(var i = 0; i<lines; i++){
                vectors.push([new THREE.Vector3 (0,0,0)]);
            };
        }

        isMouseDown = true;
    }

})();