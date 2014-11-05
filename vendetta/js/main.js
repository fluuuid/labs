// (function(){

    var scene, camera, renderer, controls;
    var material, composer, clock, world;
    var mouse, projector, raycaster;
    var step = 0;
    var jsonLoader;
    var audio;
    var postprocessing = {};

    initAudio();

    function initAudio() {
        var context, source;
        context = new (AudioContext || webkitAudioContext)();
        analyser = context.createAnalyser();
        source = null;
        audio = new Audio();
        audio.src = 'audio/remember.mp3';
        audio.addEventListener('canplay', function () {
            var bufferLength;
            console.log('audio canplay');
            source = context.createMediaElementSource(audio);
            source.connect(analyser);
            source.connect(context.destination);
            bufferLength = analyser.frequencyBinCount;
            buildScene();
            return analyserDataArray = new Uint8Array(bufferLength);
        });
    };

    function initPass(){
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );
        postprocessing.composer = composer;

        var width = window.innerWidth;
        var height = window.innerHeight;

        var passes = [
            // ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true],
            ["film", new THREE.FilmPass( 0.35, 0.5, 2048, true ), false],
            ["glitch", new THREE.GlitchPass(), true],
        ]

        for (var i = 0; i < passes.length; i++) {
            postprocessing[passes[i][0]] = passes[i][1];
            if(passes[i][2]) passes[i][1].renderToScreen = passes[i][2];
            composer.addPass(passes[i][1]);
        };

        // postprocessing['vignette'].uniforms[ "offset" ].value = 0.15;
        // postprocessing['vignette'].uniforms[ "darkness" ].value = .1;
    }

    function renderPass() {
        postprocessing.composer.render(.1);
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
        camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 50;
        camera.lookAt(0);
        scene.add( camera );

        mouse = new THREE.Vector2( 0, 0 );
        raycaster = new THREE.Raycaster();

        clock = new THREE.Clock( false );

        textureMask = THREE.ImageUtils.loadTexture('img/3d/VMaskCol.jpg', {}, function(){
            jsonLoader = new THREE.JSONLoader();
            jsonLoader.load( "img/3d/mask.js", createScene );    
        });

        
    };

    function createScene(geometry, materials)
    {
        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        renderer.autoClear=false;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        clock.start();

        scene.add(new THREE.AmbientLight( 0xFFFFFF ));
        var l = new THREE.DirectionalLight( 0xFFFFFF, 2 );
        l.position.set(0, 1, 0);
        scene.add(l);

        initPass();
        addControls();

        animate();
        update();
        audio.play();
    }

    function animate()
    {
        TweenLite.to(mesh.rotation, .5, {
            y: THREE.Math.degToRad(mouse.x*.015), 
            x: THREE.Math.degToRad(-10 + mouse.y*-.01),
            ease: 'easeInOut',
            onComplete : animate
        })
    }

    function addControls()
    {
        controls = new THREE.TrackballControls( camera );
        // controls.staticMoving = true;
        controls.maxDistance = 200;
        controls.minDistance = 50;
        controls.noRoll = true;
        controls.noPan = true;
        
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

        // checkHit();

        controls.update();

        //uniformsParticles.time.value = clock.getElapsedTime();

        // console.log(particlesGeom.getAttribute('size'));

        // for( i = 0; i < particlesGeom.getAttribute('size').length; i++ ) {
        //     particlesGeom.getAttribute('size')[ i ] = 2 + 1 * Math.sin( 0.1 * i + clock.getElapsedTime() * .005 );
        // }

        // particlesGeom.getAttribute('size').needsUpdate = true;

        // console.log(particlesGeom.getAttribute('size')[ 0]);

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
        // renderer.render( scene, camera );
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
        mouse.y = -event.pageY - window.innerHeight * .5;

        animate();
    }

    function onMouseUp(event)
    {
        event.preventDefault();
    }

    function onMouseDown(event)
    {
        event.preventDefault();
    }

// })();