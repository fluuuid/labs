(function(){

    var scene, camera, renderer, controls;
    var composer, clock, world;
    var postprocessing = {};
    var size = 5;
    var lights = []
    var G = -10, nG = -10;
    var wakeup = false;
    var meshs = [];
    var ground;
    var grounds = [];
    var hemiLight, dirLight;
    var pix = [];
    var ToRad = Math.PI / 180;
    var buffgeoBox = new THREE.BufferGeometry();
    var mousePos = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    buffgeoBox.fromGeometry( new THREE.BoxGeometry( 1, 1, 1 ) );

    var icons = ["bells-icon.png",
                "candy-cane-icon.png",
                "christmas-tree-icon.png",
                "gift-icon.png",
                "santa-hat-icon.png",
                "santa.png",
                "santa2.png",
                "snowflake-icon.png",
                "tree.png",
                "tree2.png"]

    var positionsReverse = [];

    var theta, phi;
    var reversing = false;
    var maxReverse, frame;

    var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x050505} );
        groundMat.color.setHSL( 0.095, 1, 0.75 );

    initOimoPhysics();

    function initPass(){
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );
        postprocessing.composer = composer;

        var width = window.innerWidth;
        var height = window.innerHeight;

        var passes = [
            ["bloom", new THREE.BloomPass( .2 ), true],
            ["film", new THREE.FilmPass( 0.15, 0.2, 2048, false ), false],
            ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true],
            // ["glitch", new THREE.GlitchPass(64, 50), true],
        ]

        for (var i = 0; i < passes.length; i++) {
            postprocessing[passes[i][0]] = passes[i][1];
            if(passes[i][2]) passes[i][1].renderToScreen = passes[i][2];
        };

        postprocessing['vignette'].uniforms[ "offset" ].value = 100.;
        postprocessing['vignette'].uniforms[ "darkness" ].value = 10.5;

        for (var i = 0; i < passes.length; i++) {
            composer.addPass(passes[i][1]);
        };

    }

    function renderPass() {
        postprocessing.composer.render(.1);
    }

    function loadImageToPixel(imgURL)
    {
        img = new Image()
        img.onload = function(e)
        {
            canvas = document.createElement('canvas')
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.position = "absolute";
            canvas.style.right = '0'
            canvas.style.display = 'none'
            document.body.appendChild(canvas);

            ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            computeColours(canvas, ctx);
        }

        img.src= imgURL
    }

    function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
    function toHex(n) {
         n = parseInt(n,10);
         if (isNaN(n)) return "00";
         n = Math.max(0,Math.min(n,255));
         return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
    }

    function computeColours(canvas, context)
    {
        for (var x = 1; x < canvas.width; x+=size) {
            for (var y = 1; y < canvas.height; y+=size) {
                d = context.getImageData(x, y, 1, 1).data
                if(d[3] > 0) pix.push({x: x, y: y, color: "#" + rgbToHex(d[0], d[1], d[2])});
            }
        };

        buildScene();
    }

    function build3DPixelImage()
    {
        var config = [
                1, // The density of the shape.
                0.4, // The coefficient of friction of the shape.
                1, // The coefficient of restitution of the shape.
                1, // The bits of the collision groups to which the shape belongs.
                0xffffffff // The bits of the collision groups with which the shape collides.
            ];

        var mult = 2;
        var blockSize = size * mult;

        for (var i = pix.length - 1; i >= 0; i--) {

            var zScale = Math.min(10, Math.max(2, Math.random() * 20))

            x = pix[i].x - 70
            y = (window.innerHeight / size) - pix[i].y
            z = -100
            var m = new THREE.Mesh( buffgeoBox, 
                    new THREE.MeshLambertMaterial( {
                        specular: 0xFFFFFF, shininess: 120,
                        color: pix[i].color
                    })
                )

            m.positionsReverse = []

            m.position.x = x * mult;
            m.position.y = y * mult;
            m.position.z = z * mult;
            meshs.push(m);

            b = new OIMO.Body({type:'box', size:[blockSize, blockSize, blockSize], pos:[m.position.x,m.position.y,m.position.z], move:true, world:world,config:config})

            // mult = 1.5
            // b.body.angularVelocity.x = (Math.random() * Math.PI - Math.PI / 2) * mult
            // b.body.linearVelocity.z = (Math.random() * Math.PI - Math.PI / 2)

            bodys.push(b);

            m.scale.set(blockSize,blockSize,blockSize);

            m.castShadow = true;

            scene.add(m);
        };
    }

    function buildScene() {
        scene = new THREE.Scene();
        //camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 10000);
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
        camera.position.z = 100;
        camera.position.y = -100;
        camera.rotation.x = 10 * ToRad;
        scene.add( camera );

        clock = new THREE.Clock( false );

        clearMesh();
        world.clear();
        bodys = [];
        meshs = [];

        build3DPixelImage();

        var ground = new OIMO.Body({size:[5000, 40, 5000], pos:[0,-400,0], rot:[-Math.PI/2, 0, 0], world:world});
        addStaticBox([5000, 40, 5000], [0,-400,-100], [-Math.PI/2,0,0]);

        setLights();
        setSky();

        renderer = new THREE.WebGLRenderer({precision: "mediump", antialias: false, alpha: false});
        renderer.autoClear = false;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        addBackgroundParticles();

        addControls();

        clock.start();

        initPass();
        update();
        animateIn();
    };

    function animateIn()
    {
        var a = {v : 100, d: 10.5}
        TweenMax.to(a, 1.5, { v: 1.1, d: 1.5, delay: 1, ease: "easeOutQuad", onUpdate: function(){
            postprocessing['vignette'].uniforms[ "darkness" ].value = a.d;
            postprocessing['vignette'].uniforms[ "offset" ].value = a.v;
        }});
    }

    function addStaticBox(size, position, rotation) {
        var mesh = new THREE.Mesh( buffgeoBox, groundMat );
        mesh.scale.set( size[0], size[1], size[2] );
        mesh.position.set( position[0], position[1], position[2] );
        mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
        scene.add( mesh );
        grounds.push(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    }

    function clearMesh(){
        var i=meshs.length;
        while (i--) scene.remove(meshs[ i ]);
        i = grounds.length;
        while (i--) scene.remove(grounds[ i ]);
        grounds = [];
        meshs = [];
    }

    function setSky()
    {
        var vertexShader = document.getElementById( 'vertexShader' ).textContent;
        var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
        var uniforms = {
            topColor:    { type: "c", value: new THREE.Color( 0x0077ff ) },
            bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
            offset:      { type: "f", value: 33 },
            exponent:    { type: "f", value: 0.6 }
        }
        uniforms.topColor.value.copy( hemiLight.color );

        // scene.fog.color.copy( uniforms.bottomColor.value );

        var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
        var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

        var sky = new THREE.Mesh( skyGeo, skyMat );
        scene.add( sky );
    }

    function addBackgroundParticles()
    {
        var pointMaterial = new THREE.PointCloudMaterial({
            map: THREE.ImageUtils.loadTexture('img/particles.png'),
            size: 2, sizeAttenuation: true, color: 0xFFFFFF, transparent: true,
            blending: THREE.AdditiveBlending
        })

        var radius = 1000;
        var particles = 5000;
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
    }

    function setLights(color)
    {
        hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        scene.add( hemiLight );

        dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( 1, 1.75, 2 );
        scene.add( dirLight );

        // hep = new THREE.DirectionalLightHelper( dirLight );
        // scene.add(hep);

        dirLight.castShadow = true;
        // dirLight.shadowMapWidth = 1000;
        // dirLight.shadowMapHeight = 1000;
        dirLight.shadowDarkness = 0.35;

        // scene.fog = new THREE.FogExp2( 0xFFFFFF, 10 );
    }

    function addControls()
    {
        // controls = new THREE.TrackballControls( camera );
        // controls.maxDistance = 1000;
        // controls.minDistance = 500;
        // controls.noRoll = true;
        // controls.noPan = true;
        // controls.noRotate = true;

        // controls.addEventListener( 'change', render );
        document.addEventListener( 'mouseup', onMouseUp );
        document.addEventListener( 'mousemove', onMouseMove );
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

        world = new OIMO.World(1/60, 1, 2);
        world.gravity = new OIMO.Vec3(0, 0, 0);
        a = Math.round(Math.random() * icons.length);
        loadImageToPixel('img/' + icons[a]);
    }

    function updateOimoPhysics() {

        if(world.gravity.y >= 0) return

        world.step();

        var m;
        var mtx = new THREE.Matrix4();
        var i = bodys.length;
        var mesh;

        while (i--) {
            var body = bodys[i].body;
            mesh = meshs[i];
            bodys[i].body.awake();
            m = body.getMatrix();
            mtx.fromArray(m);

            mesh.position.setFromMatrixPosition(mtx);
            mesh.rotation.setFromRotationMatrix(mtx);

            mesh.positionsReverse.push([mesh.position.clone(), mesh.rotation.clone()]);
        }
    }

    function onMouseMove(e) 
    {
        e.preventDefault()
        var multX = 0.0005;
        var multY = 0.001;
        theta = - ( ( event.clientX - mousePos.x ) * 0.5 ) * multX;
        phi = -( ( event.clientY - mousePos.y ) * 0.5 ) * multY;
    }

    function onMouseUp(e)
    {
        e.preventDefault();
        world.gravity = new OIMO.Vec3(0, -5, 0);
        positionsReverse = []

        setTimeout(reverse, 5000);
        // postprocessing['glitch'].generateTrigger();
    }

    function reverse()
    {
        world.gravity = new OIMO.Vec3(0, 0, 0);
        reversing = true;
        frame = meshs[0].positionsReverse.length - 1;
    }

    function update() {

        requestAnimationFrame(update);

        updateOimoPhysics();

        var a = Math.round((meshs.length - 1) / 2)
        camera.lookAt(meshs[a].position);
        camera.rotation.y += theta 
        camera.rotation.x += phi;

        particleSystem.rotation.x -= .005;
        // uniformsBall.amplitude.value = 0.125 * Math.sin( clock.getElapsedTime() * 0.5 );

        if(reversing && frame >= 0)
        {
            for (var i = 0; i < meshs.length; i++) {
                meshs[i].position.copy(meshs[i].positionsReverse[frame][0]);
                meshs[i].rotation.copy(meshs[i].positionsReverse[frame][1]);
            }
            frame--;
        }

        
        render();

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

})();