(function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;

    var postprocessing = {};

    var boxes = 350;
    var size = 200;
    var colors = [0x77ece4, 0x72ec61, 0xdd2629, 0x3435df, 0x7af0ea, 0x9000ff, 0xdd38c7]
    var colorStep = 0;
    var lights = []

    initOimoPhysics();
    initPass();
    update();

    function initPass(){
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );
        postprocessing.composer = composer;

        var width = window.innerWidth;
        var height = window.innerHeight;

        var passes = [
            // ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true],
            ["film", new THREE.FilmPass( 0.85, 0.5, 2048, false ), false],
            ['staticPass', new THREE.ShaderPass( THREE.StaticShader ), false],
            ["glitch", new THREE.GlitchPass(64, 50), true]
        ]

        // postprocessing['vignette'].uniforms[ "offset" ].value = 1.5;
        // postprocessing['vignette'].uniforms[ "darkness" ].value = 1.6;

        for (var i = 0; i < passes.length; i++) {
            postprocessing[passes[i][0]] = passes[i][1];
            if(passes[i][2]) passes[i][1].renderToScreen = passes[i][2];
            composer.addPass(passes[i][1]);
        };

        staticParams = {
            show: true,
            amount:20.10,
            size2:20.0
        }

        postprocessing['staticPass'].uniforms[ "amount" ].value = staticParams.amount;
        postprocessing['staticPass'].uniforms[ "size" ].value = staticParams.size2;
    }

    function renderPass() {
        postprocessing.composer.render(.5);
    }

    function limit(number, min, max)
    {
        return Math.min( Math.max(min,number), max );
    }

    function getNextColour()
    {
        colorStep++;
        colorStep = colorStep > colors.length - 1 ? 0 : colorStep;
        return colors[colorStep]
    }

    function buildScene() {
        scene = new THREE.Scene();
        //camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 10000);
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
        camera.position.z = 2000;
        camera.lookAt(0);
        scene.add( camera );

        var color = getNextColour();

        clock = new THREE.Clock( false );

        var material = new THREE.MeshPhongMaterial( {
            wireframe : false, 
            // ambient: 0xFFFFFF,
            // specular: 0x224d44, 
            shininess: 6, 
            color: 0xFFFFFF
        } );

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

        var canvas 

        var pointMaterial = new THREE.PointCloudMaterial({
            size: 2, sizeAttenuation: true, color: 0xFFFFFF, transparent: true,
            blending: THREE.AdditiveBlending
        })

        var radius = 8000;
        var particles = 400;
        particlesGeom = new THREE.BufferGeometry();
        var positions = new Float32Array( particles * 3 );

        for( var v = 0; v < particles; v++ ) {
            positions[ v * 3 + 0 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 1 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 2 ] = ( Math.random() * 2 - 1 ) * radius;
        }

        particlesGeom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        particleSystem = new THREE.PointCloud( particlesGeom, pointMaterial );
        scene.add( particleSystem );

        renderer = new THREE.WebGLRenderer({precision: "mediump", antialias: false, alpha: false});

        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        clock.start();

        setLights(color);

        scene.fog = new THREE.FogExp2( 0, 0.000035 );

        addControls();
    };

    function setLights(color)
    {
        // scene.add(new THREE.AmbientLight( 0xFFFFFF, .2))

        if(lights.length > 0)
        {
            for (var i = 0; i < lights.length; i++) {
                scene.remove(lights[i]);
            }
        }

        lights = [new THREE.DirectionalLight(color, 0.9), new THREE.DirectionalLight(color, 0.9)]
        var a = -1;
        for (var i = 0; i < lights.length; i++) {
            lights[i].position.set(a, 0, 0);
            scene.add(lights[i]);
            a *= -1;
        };
    }

    function addControls()
    {
        controls = new THREE.TrackballControls( camera );
        // controls.enabled = false;
        controls.maxDistance = 3000;
        controls.minDistance = 1000;
        controls.dynamicDampingFactor = .15;

        controls.addEventListener( 'change', render );
        document.addEventListener( 'mouseup', onMouseUp );
        window.addEventListener("resize", onWindowResize);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.display = 'none';
        document.body.appendChild(stats.domElement);
    }

    function initOimoPhysics(){

        // world setting:( TimeStep, BroadPhaseType, Iterations )
        // BroadPhaseType can be 
        // 1 : BruteForce
        // 2 : Sweep and prune , the default 
        // 3 : dynamic bounding volume tree

        world = new OIMO.World(1/60, 1, 2);
        world.gravity = new OIMO.Vec3(0, 0, 0);
        buildScene();
    }

    function updateOimoPhysics(force) {

        if(force == null) force = -0.0025

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
                newPosAttraction.copy(mesh.position).multiplyScalar(force * Math.random());
            } else {
                newPosAttraction.copy(mesh.position).multiplyScalar(0);
            }

            body.applyImpulse(mesh.position, newPosAttraction);
        }

        world.step();
    }

    function onMouseUp()
    {
        var color = getNextColour();

        setLights(color);

        for (var i = boxes - 1; i >= 0; i--) {
            meshs[i].material.color = new THREE.Color( color );
            meshs[i].colorsNeedUpdate = true;
        }
        updateOimoPhysics(.2);
        postprocessing['glitch'].generateTrigger();
    }

    function update() {

        particleSystem.rotation.y -= .0005;
        
        controls.update();

        render()
        
        requestAnimationFrame(update);
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