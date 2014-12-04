(function(){

    var scene, camera, renderer;
    var composer, clock, world, postprocessing = {};
    var size = 4;
    var meshs = [];
    var bodys = [];
    var ground;
    var grounds = [];
    var hemiLight, dirLight;
    var pix = [];
    var currentIcon = -1;
    var theta, phi;
    var frame;
    var state = 0;

    var buffgeoBox = new THREE.BufferGeometry();
    buffgeoBox.fromGeometry( new THREE.BoxGeometry( 1, 1, 1 ) );

    var mousePos = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

    var icons = ["bells-icon.png",
                "candy-cane-icon.png",
                "christmas-tree-icon.png",
                "gift-icon.png",
                "santa-hat-icon.png",
                "santa.png",
                "imgo.png",
                "santa2.png",
                "snowflake-icon.png",
                "tree.png",
                "tree2.png"]

    icons = shuffle(icons);

    /*
    0 = static
    1 = falling
    2 = reversing
    3 = exploding
    4 = animating effect
    5 = changing to new object
    */

    var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x050505} );
        groundMat.color.setHSL( 0.095, 1, 0.75 );

    initOimoPhysics();
    initPass();

    function initPass()
    {
        renderer = new THREE.WebGLRenderer({precision: "mediump", antialias: false, alpha: false});
        renderer.autoClear = false;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;
        document.body.appendChild( renderer.domElement );
        renderer.setSize( window.innerWidth, window.innerHeight);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
        scene.add( camera );

        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );
        postprocessing.composer = composer;

        var width = window.innerWidth;
        var height = window.innerHeight;

        var passes = [
            ["bloom", new THREE.BloomPass( .1 ), true],
            // ["glitch", new THREE.GlitchPass(100, 50), true],
            ["film", new THREE.FilmPass( 5., 3., 1024, false ), false],
            ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true]
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
        postprocessing.composer.render(1);
    }

    function loadImageToPixel(imgURL, addObject)
    {
        pix = [];
        img = new Image()
        img.onload = function(e)
        {
            canvas = document.createElement('canvas')
            canvas.width = this.width;
            canvas.height = this.height;

            ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            computeColours(canvas, ctx);
            if(!addObject) 
            {
                buildScene();
            } else {
                build3DPixelImage(true);
            }
        }

        img.src= imgURL
    }

    function computeColours(canvas, context)
    {
        for (var x = 1; x < canvas.width; x+=size) {
            for (var y = 1; y < canvas.height; y+=size) {
                d = context.getImageData(x, y, 1, 1).data
                if(d[3] > 0) pix.push({x: x, y: y, color: "#" + rgbToHex(d[0], d[1], d[2])});
            }
        };
    }

    function buildScene() 
    {
        camera.position.z = 100;
        camera.position.y = -250;
        camera.rotation.x = 15 * ToRad;

        build3DPixelImage();
        setLights();
        setSky();
        addBackgroundParticles();
        addControls();

        clock = new THREE.Clock( true );

        update();
    };

    function animateIn(nu)
    {
        animateVignette({ a: .1, b: .9}, nu ? .5 : 1.5, null, nu ? .1 : 1);
        animateFilmParams({a: .25, b: .3, c: 2048}, 1, function(){
            state = 0;
        });
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

    function clearMesh()
    {
        for (var i = meshs.length - 1; i >= 0; i--) scene.remove(meshs[ i ]);
        for (var i = grounds.length - 1; i >= 0; i--) scene.remove(grounds[ i ]);
            
        grounds = [];
        meshs = [];
        bodys = [];
    }

    function setSky()
    {
        var vertexShader = PIXMAS.SkyShader.vertexShader;
        var fragmentShader = PIXMAS.SkyShader.fragmentShader;
        var uniforms = {
            topColor:    { type: "c", value: new THREE.Color( 0x0077ff ) },
            bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
            offset:      { type: "f", value: 33 },
            exponent:    { type: "f", value: 0.6 }
        }
        uniforms.topColor.value.copy( hemiLight.color );

        scene.fog.color.copy( uniforms.bottomColor.value );

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

        var radius = 2000;
        var particles = 20000;
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
        dirLight.position.set( 0, 10, 5 );
        scene.add( dirLight );

        // hep = new THREE.DirectionalLightHelper( dirLight );
        // scene.add(hep);

        dirLight.castShadow = true;
        // dirLight.shadowMapWidth = 1000;
        // dirLight.shadowMapHeight = 1000;
        dirLight.shadowDarkness = 0.35;

        scene.fog = new THREE.FogExp2( 0xFFFFFF, .0005 );
    }

    function addControls()
    {
        renderer.domElement.addEventListener( 'mouseup', onMouseUp );
        document.addEventListener( 'mousemove', onMouseMove );
        window.addEventListener("resize", onWindowResize);
    }

    function initOimoPhysics(){

        // world setting:( TimeStep, BroadPhaseType, Iterations )
        // BroadPhaseType can be 
        // 1 : BruteForce
        // 2 : Sweep and prune , the default 
        // 3 : dynamic bounding volume tree

        world = new OIMO.World(1/60, 1, 5);
        world.gravity = new OIMO.Vec3(0, 0, 0);
        loadImageToPixel( getNextPixel() );
    }

    function getNextPixel()
    {
        currentIcon++;
        currentIcon = currentIcon > currentIcon.length - 1 ? 0 : currentIcon;
        return 'img/' + icons[currentIcon];
    }

    function updateOimoPhysics() {

        if(state != 1) return

        world.step();

        var m;
        var mtx = new THREE.Matrix4();
        var mesh, body;

        for (var i = bodys.length - 1; i >= 0; i--) 
        {
            body = bodys[i].body;
            mesh = meshs[i];
            body.awake();
            m = body.getMatrix();
            mtx.fromArray(m);

            mesh.position.setFromMatrixPosition(mtx);
            mesh.rotation.setFromRotationMatrix(mtx);

            mesh.positionsReverse.push([mesh.position.clone(), mesh.rotation.clone()]);
        }
    }

    function resetPhysicsBodies()
    {
        var mesh, body;

        for (var i = bodys.length - 1; i >= 0; i--) {
            body = bodys[i].body;
            mesh = meshs[i];
            body.resetPosition(mesh.position.x,mesh.position.y,mesh.position.z);
            body.resetRotation(mesh.rotation.x,mesh.rotation.y,mesh.rotation.z);
            mesh.positionsReverse = [];
        }
    }

    function onMouseMove(e) 
    {
        e.preventDefault()
        var multX = 0.0005;
        var multY = 0.001;
        theta = - ( ( event.clientX - mousePos.x ) * 0.5 ) * multX;
        phi = -( ( event.clientY - mousePos.y / 2) * 0.5 ) * multY;
    }

    function onMouseUp(e)
    {
        e.preventDefault();

        if(state != 0) return null

        state = 1
        world.gravity = new OIMO.Vec3(0, -5, 0);
        setTimeout(reverse, 4000);
    }

    function reverse()
    {
        world.gravity = new OIMO.Vec3(0, 0, 0);
        frame = meshs[0].positionsReverse.length - 1;
        state = 2;
    }

    function build3DPixelImage(newObject)
    {
        clearMesh();
        world.clear();

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
            y = (window.innerHeight / (size * mult * 2)) - pix[i].y
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
            b.body.linearVelocity.y = Math.random()

            bodys.push(b);

            m.scale.set(blockSize,blockSize,blockSize);

            m.castShadow = true;

            scene.add(m);
        };

        var ground = new OIMO.Body({size:[5000, 10, 5000], pos:[0,-400,0], rot:[-Math.PI/2, 0, 0], world:world});
        addStaticBox([5000, 40, 5000], [0,-420,0], [-Math.PI/2,0,0]);

        animateIn(newObject)
    }

    function changeObject()
    {
        loadImageToPixel( getNextPixel(), true );
    }

    function animateFilmParams(to, time, callback, delay)
    {
        var params = {
            a : postprocessing['film'].uniforms[ "nIntensity" ].value, 
            b : postprocessing['film'].uniforms[ "sIntensity" ].value,
            c : postprocessing['film'].uniforms[ "sCount" ].value
        }
        TweenMax.to(params, time, { a : to.a, b: to.b, c: to.c, delay: delay, ease: "easeInQuad", onUpdate: function(){
            postprocessing['film'].uniforms[ "nIntensity" ].value = params.a;
            postprocessing['film'].uniforms[ "sIntensity" ].value = params.b;
            postprocessing['film'].uniforms[ "sCount" ].value = params.c;
        }, onComplete: callback });
    }

    function animateVignette(to, time, callback, delay, ease)
    {
        var params = {a: postprocessing['vignette'].uniforms[ "darkness" ].value, b: postprocessing['vignette'].uniforms[ "offset" ].value};
        TweenMax.to(params, time, { a: to.a, b: to.b, delay: delay, ease: ease, onUpdate: function(){
            postprocessing['vignette'].uniforms[ "darkness" ].value = params.a;
            postprocessing['vignette'].uniforms[ "offset" ].value = params.b;
        }, onComplete : callback });
    }

    function reverseUpdate()
    {
        if(meshs.length == 0) return
        if(frame > 0)
        {
            for (var i = 0; i < meshs.length; i++) {
                meshs[i].position.copy(meshs[i].positionsReverse[frame][0]);
                meshs[i].rotation.copy(meshs[i].positionsReverse[frame][1]);
            }
            frame--;

            if(frame < meshs[0].positionsReverse.length / 2 && state != 4)
            {
                state = 4
                animateFilmParams({ a: 10.1, b: 10.5, c: 512}, 1.5);
                animateVignette({a : 1.5, b: 2.5}, 1.5, null, "easeInOutQuad")
            }
        } else {
            if(state == 4)
            {
                // resetPhysicsBodies();
                changeObject();
                state = 5;
            }
        }
    }

    function update() {

        requestAnimationFrame(update);

        updateOimoPhysics();

        var a = Math.round((meshs.length - 1) / 2)
        var l = new THREE.Vector3( 0, 0, 0 );
        l.copy(meshs[a].position);
        l.y += 5;

        camera.lookAt(l);
        camera.rotation.y += theta; 
        camera.rotation.x += phi;

        particleSystem.rotation.x -= .005;
        // uniformsBall.amplitude.value = 0.125 * Math.sin( clock.getElapsedTime() * 0.5 );

        if(state == 2 || state == 4) reverseUpdate()
        
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