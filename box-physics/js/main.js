(function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;

    WAGNER.vertexShadersPath = "/shaders/vertex-shaders";
    WAGNER.fragmentShadersPath = "/shaders/fragment-shaders";
    WAGNER.assetsPath = "/shaders/assets/";

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

    initOimoPhysics();
    initPass();
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
        // vignette2Pass = new WAGNER.Vignette2Pass();
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
        
        // composer.pass( multiPassBloomPass );
        composer.pass( SSAOPass ) ;
        
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
        camera.position.z = 2000;
        camera.lookAt(0);
        scene.add( camera );

        clock = new THREE.Clock( false );

        var material = new THREE.MeshPhongMaterial( {
            wireframe : false, 
            ambient: 0,
            specular: 0xfa7cff, 
            shininess: 5, 
            shading: THREE.FlatShading,
            color: 0x9000ff
        } );

        var boxes = 350;
        var size = 200;

        var w = size;

        var box = new THREE.BoxGeometry( w, w, w, 1, 1, 1, [material], 6 );
        // var box = new THREE.IcosahedronGeometry( w, 2 );
        var boxBuffer = new THREE.BufferGeometry().fromGeometry(box);

        world.clear();
        bodys = [];
        meshs = [];

        for (var i = boxes - 1; i >= 0; i--) {

            x = Math.random() * window.innerWidth - window.innerWidth / 2;
            z = Math.random() * window.innerHeight - window.innerHeight / 2;
            y = Math.random() * window.innerWidth - window.innerWidth / 2;

            var a = 5;
            x *= a;
            z *= a;
            y *= a;

            var s = limit(Math.random(), .5, .9);
            bodys[i] = new OIMO.Body({type:'box', size:[w*s, w*s, w*s], pos:[x,y,z], move:true, world:world});
            meshs[i] = new THREE.Mesh( boxBuffer, material );
            meshs[i].scale.set(s, s, s);

            // meshs[i].receiveShadow = true;
            // meshs[i].castShadow = true;

            scene.add(meshs[i]);
        };

        renderer = new THREE.WebGLRenderer({precision: "mediump", antialias: false, alpha: false});
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

        addControls();
    };

    function addControls()
    {
        controls = new THREE.TrackballControls( camera );
        // controls.enabled = false;
        controls.addEventListener( 'change', render );
        document.addEventListener( 'mouseup', onMouseUp );
        window.addEventListener("resize", onWindowResize);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        // stats.domElement.style.display = 'none';
        document.body.appendChild(stats.domElement);
    }

    function initOimoPhysics(){

        // world setting:( TimeStep, BroadPhaseType, Iterations )
        // BroadPhaseType can be 
        // 1 : BruteForce
        // 2 : Sweep and prune , the default 
        // 3 : dynamic bounding volume tree

        world = new OIMO.World(1/60, 1, 3);
        world.gravity = new OIMO.Vec3(0, 0, 0);
        buildScene();
    }

    function updateOimoPhysics(force) {

        if(force == null) force = -0.0005

        var i = bodys.length;
        var mesh;
        var body;

        // console.log(bodys[0].body.linearVelocity);

        while (i--){
            body = bodys[i].body;
            mesh = meshs[i];

            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());

            var newPosAttraction = new THREE.Vector3();
            newPosAttraction.copy(mesh.position)

            if( Math.abs(body.linearVelocity.x) < 20 || 
                Math.abs(body.linearVelocity.y) < 20 ||
                Math.abs(body.linearVelocity.z) < 20)
            {
                newPosAttraction.copy(mesh.position).multiplyScalar(force);
            } else {
                newPosAttraction.copy(mesh.position).multiplyScalar(0);
            }

            body.applyImpulse(mesh.position, newPosAttraction);
        }

        world.step();
    }

    function onMouseUp()
    {
        updateOimoPhysics(.1);
    }

    function update() {
        
        requestAnimationFrame(update);
        controls.update();

        render()
    };

    function render() {
        updateOimoPhysics();
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

})();