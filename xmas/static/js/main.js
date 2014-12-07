/*
PIXMAS by @silviopaganini
# not the best ever code, but it's an experiment, right? =) 
hope you enjoy!

#threejs #oimojs

*/

(function(){

    var scene, camera, renderer;
    var composer, clock, world, postprocessing = {};
    var ground;
    var hemiLight, dirLight;
    var theta = 0;
    var phi = 0;
    var frame;

    var size           = window.isMobile ? 10 : 4;
    var meshs          = [];
    var bodys          = [];
    var grounds        = [];
    var pix            = [];
    var currentIcon    = -1;
    var state          = 0;
    var particlesCount = 20000;
    var currentPlaying = 1;
    var touched        = false;
    var cameraTop      = true;
    var animCamera     = false;
    var reversing      = false;

    var setTimerClick = 0;

    var _rotationStart = new THREE.Vector3( 0, 0, 0 );

    var buffgeoBox = new THREE.BufferGeometry();
    buffgeoBox.fromGeometry( new THREE.BoxGeometry( 1, 1, 1 ) );

    var mousePos = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

    var icons = ["bells-icon.png",
                "candy-cane-icon.png",
                "christmas_ice_man_icon.png",
                "christmas_stockings_icon.png",
                "christmas-tree-icon.png",
                "gift-icon.png",
                "gingerbread.png",
                "santa-hat-icon.png",
                "santa-shades.png",
                "santa.png",
                "santa2.png",
                "snowflake-icon.png",
                "tree.png"]

    icons = shuffle(icons);

    /*
    0 = static
    1 = falling
    2 = reversing
    3 = exploding
    4 = animating effect
    5 = changing to new object
    */

    var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xda935b, color: 0x404966, specular: 0x173551} );
        // groundMat.color.setHSL( 0.095, 1, 0.75 );

    window.init = function()
    {
        $('#heading').addClass('animate-out');
        $('#buttonChange').addClass('button-deactive');
        $('#headphones').addClass('headphone-deactive');

        initOimoPhysics();
        initPass();
    }

    function initPass()
    {
        renderer = new THREE.WebGLRenderer({precision: "mediump", antialias: false, alpha: false});
        renderer.autoClear = false;
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

        if(!window.isMobile)
        {
            renderer.shadowMapEnabled = true;
            renderer.shadowMapType = THREE.PCFSoftShadowMap;

            var passes = [
                ["bloom", new THREE.BloomPass( .1 ), true],
                // ["glitch", new THREE.GlitchPass(100, 50), true],
                ["film", new THREE.FilmPass( 5., 3., 1024, false ), false],
                ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true]
            ]

        } else {
            var passes = [
                ['vignette', new THREE.ShaderPass( THREE.VignetteShader ), true]
            ]
        }

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
            computeColours(canvas, ctx, pix, size);
            if(!addObject) 
            {
                buildScene();
                setTimerClick = setInterval(function(){
                    $('#clickHeader').text(window.isMobile ? "Tap!" : "Click!");
                    $('#clickHeader').textillate({ autoStart: true, in: { effect: 'bounceIn' }, out: { effect: 'bounceOut' } });    
                    $('#heading-click').css('opacity', 1)
                }, 5000);
                
            } else {
                build3DPixelImage(true);
            }
        }

        img.src= imgURL
    }

    function buildScene() 
    {
        camera.position.x = 0
        camera.position.y = -250
        camera.position.z = 70
        // camera.rotation.y = 45 * ToRad;

        build3DPixelImage();
        setLights();
        setSky();
        if(!window.isMobile) addBackgroundParticles();

        clock = new THREE.Clock( true );

        sound.pos(0);
        sound.play().fadeIn(0.3, 2000);
        setTimeout(addControls, 2000);
        update();
    };

    function addStaticBox(size, position, rotation) {
        var mesh = new THREE.Mesh( buffgeoBox, groundMat );
        mesh.scale.set( size[0], size[1], size[2] );
        mesh.position.set( position[0], position[1], position[2] );
        mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
        scene.add(mesh);
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
        //0x0077ff, 0x0xffffff
        var uniforms = {
            topColor:    { type: "c", value: new THREE.Color( 0x06293f ) },
            bottomColor: { type: "c", value: new THREE.Color( 0xb77549 ) },
            offset:      { type: "f", value: 33 },
            exponent:    { type: "f", value: 0.6 }
        }
        // uniforms.topColor.value.copy( hemiLight.color );
        scene.fog.color.copy( uniforms.bottomColor.value );

        var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
        var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

        var sky = new THREE.Mesh( skyGeo, skyMat );
        scene.add( sky );
    }

    function addBackgroundParticles()
    {
        var pointMaterial = new THREE.PointCloudMaterial({
            map: THREE.ImageUtils.loadTexture('static/img/particles.png'),
            size: randomRange(1, 6), sizeAttenuation: true, color: 0xFFFFFF, transparent: true,
            blending: THREE.AdditiveBlending
        })

        var radius = 2500;
        particlesGeom = new THREE.BufferGeometry();
        var positions = new Float32Array( particlesCount * 3 );

        for( var v = 0; v < particlesCount; v++ ) {
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
        dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        // dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.castShadow = true;
        dirLight.shadowDarkness = 0.35;
        dirLight.position.set( 0, 10, 5 );
        scene.add( dirLight );

        dirLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
        // dirLight2.color.setHSL( 0.1, 1, 0.95 );
        dirLight2.position.set( 2, 10, 3 );
        // dirLight2.rotation.x = 45 * ToRad;
        scene.add( dirLight2 );

        dirLight3 = new THREE.DirectionalLight( 0xffffff, 1 );
        // dirLight3.color.setHSL( 0.1, 1, 0.95 );
        dirLight3.position.set( 2, 10, -3 );
        // dirLight3.rotation.x = 45 * ToRad;
        scene.add( dirLight3 );

        scene.fog = new THREE.FogExp2( 0xba804d, .001 );
    }

    function addControls()
    {
        if(window.isMobile)
        {
            $(window).bind( 'touchend', onMouseUp );
            gyro.startTracking(gyroMove);
        } else 
        {
            $(window).bind("mouseup", onMouseUp );
            document.addEventListener( 'mousemove', onMouseMove );
            window.addEventListener("resize", onWindowResize);
        }
    }

    function initOimoPhysics(){

        // world setting:( TimeStep, BroadPhaseType, Iterations )
        // BroadPhaseType can be 
        // 1 : BruteForce
        // 2 : Sweep and prune , the default 
        // 3 : dynamic bounding volume tree

        world = new OIMO.World(1/60, 2, 5);
        world.gravity = new OIMO.Vec3(0, 0, 0);
        loadImageToPixel( getNextPixel() );
    }

    function getNextPixel()
    {
        currentIcon++;
        currentIcon = currentIcon == currentIcon.length ? 0 : currentIcon;
        return 'static/img/' + icons[currentIcon];
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

            if(mesh.position.y < -360 && !touched)
            {
                touched = true;
            }

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

        theta = ( event.clientX - window.innerWidth * 0.5 ) / (window.innerWidth*.5)
        phi   = ( window.innerHeight * 0.5 - event.clientY ) / (window.innerHeight*.5) 
    }

    

    function onMouseUp(e)
    {
        e.preventDefault();

        if(state != 0) return null

        clearInterval(setTimerClick);
        setTimerClick = 0;

        $('#heading-click').addClass('heading-click-off')

        soundClick.pos(0);
        soundClick.play();

        state = 1
        world.gravity = new OIMO.Vec3(0, -5, 0);
        touched = false;
    }

    function reverse()
    {
        world.gravity = new OIMO.Vec3(0, 0, 0);
        frame = meshs[0].positionsReverse.length - 1;

        soundReverse.play().fadeIn(1, 1000);
        state = 2;

        cameraAnim = true;

        var r = [400, -400]
        var a = r[Math.random() < .5 ? 0 : 1]

        TweenMax.to(camera.position, 2, {overwrite: "none", bezier:{
            curviness: 2.5, type:"soft", 
            values:[{x:camera.position.x, z:camera.position.z,y:camera.position.y}, {x:camera.position.x + a, z:0, y: -100}, {x:camera.position.x, z:70, y: -250}]}, 
            ease: "easeInOutQuad", onComplete: function(){
                TweenMax.delayedCall(.5, resetView)
            }});
    }

    function resetView()
    {
        animateFilmParams({ a: 10.1, b: 5.5, c: 1024}, 1.5);
        animateVignette({a : 10.5, b: 15.5}, 1, function(){
            camera.position.y = -150;
            cameraTop = true;
            reversing = false;
            touched = false;
            soundReverse.pause().fadeOut(0, 1000);
            changeObject();
        }, 1, "easeInOutQuad")
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
            y = -pix[i].y + canvas.height / 3
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

            b = new OIMO.Body({type:'box', size:[blockSize, blockSize, blockSize], pos:[m.position.x,m.position.y,m.position.z], name: 'box', move:true, world:world,config:config})

            // mult = 1.5
            // b.body.angularVelocity.x = (Math.random() * Math.PI - Math.PI / 2) * mult
            b.body.linearVelocity.y = Math.random()

            bodys.push(b);

            m.scale.set(blockSize,blockSize,blockSize);

            m.castShadow = true;

            scene.add(m);
        };

        var ground = new OIMO.Body({size:[5000, 10, 5000], pos:[0,-400,0], rot:[-Math.PI/2, 0, 0], noSleep: true, world:world, name: "ground"});
        addStaticBox([5000, 40, 5000], [0,-410,0], [-Math.PI/2,0,0]);

        animateIn(newObject)
    }

    function changeObject()
    {
        state = 5;
        loadImageToPixel( getNextPixel(), true );
    }

    function animateFilmParams(to, time, callback, delay)
    {
        if(window.isMobile){
            if(callback){
                callback();
            } return null;
        };

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
        // if(window.isMobile) if(callback){callback();} return null;

        var params = {a: postprocessing['vignette'].uniforms[ "darkness" ].value, b: postprocessing['vignette'].uniforms[ "offset" ].value};
        TweenMax.to(params, time, { a: to.a, b: to.b, delay: delay, ease: ease, onUpdate: function(){
            postprocessing['vignette'].uniforms[ "darkness" ].value = params.a;
            postprocessing['vignette'].uniforms[ "offset" ].value = params.b;
        }, onComplete : callback });
    }

    function animateIn(nu)
    {
        animateVignette({ a: 1.2, b: .9}, nu ? .7 : 1.5, null, nu ? .1 : 1);
        animateFilmParams({a: .25, b: .3, c: 2048}, .3, function(){
            state = 0;
        });
    }

    function reverseUpdate()
    {
        if(meshs.length == 0) return

        if(frame > -1)
        {
            reversing = true;

            for (var i = 0; i < meshs.length; i++) {
                meshs[i].position.copy(meshs[i].positionsReverse[frame][0]);
                meshs[i].rotation.copy(meshs[i].positionsReverse[frame][1]);
            }
            frame -= 2;
        }
    }

    function gyroMove(e)
    {
        theta = -e.gamma * 5
        phi   = -e.alpha * .7
    }

    function update() {

        requestAnimationFrame(update);

        updateOimoPhysics();

        var a = Math.round((meshs.length - 1) / 2)
        var l = new THREE.Vector3( 0, 0, 0 );
        l.copy(meshs[a].position);
        l.y += 15;

        if(!animCamera)
        {
            if(window.isMobile)
            {
                TweenMax.to(camera.position, .3, {
                    x : theta, y: -150, ease: "linear", onUpdate: function(){
                        camera.lookAt(l);
                    }
                });

            } else {

                TweenMax.to(camera.position, .8, {
                    x : ((window.innerWidth * theta - window.innerWidth / 2) * .2), 
                    y: -150 + ((window.innerHeight * phi - window.innerHeight / 2) * .1), 
                    ease: "easeOutQuad", onUpdate: function(){
                        camera.lookAt(l);
                    }
                });

            }

        } else {
            camera.lookAt(l);
        }

        if(touched && cameraTop && state == 1 && !reversing)
        {
            sound.pause().fadeOut(0, 1000);
            soundSlow.pos(0);
            soundSlow.play().fadeIn(.3, 1000);

            animateFilmParams({ a: .7, b: .8, c: 1000}, .3);

            animCamera = true;

            TweenMax.to(world, .4, {timeStep: 1/600, ease: "easeOutQuad"});

            var r = [400, -400]
            var a = r[Math.random() < .5 ? 0 : 1]

            animCamera = false;
        
            TweenMax.to(camera.position, 2, {overwrite: "none", bezier:{
                curviness: 2.5, type:"soft", 
                values:[{x:camera.position.x, z:camera.position.z, y:camera.position.y}, {x:camera.position.x + a, z:100, y: camera.position.y / 2}, {x:camera.position.x, z:-450, y: -350}]}, ease: "easeInOutQuad", onComplete: function(){
                TweenMax.delayedCall(1.8, function()
                {
                    animateFilmParams({a: .25, b: .3, c: 2048}, .4);
                    sound.play().fadeIn(.3, 1000);
                    TweenMax.to(world, .5, {timeStep: 1/60, ease: "easeOutQuad", onComplete: function(){
                        TweenMax.delayedCall(1, reverse);    
                    }})
                });
            }});
                

            cameraTop = false;
        }

        if(!window.isMobile) particleSystem.rotation.x -= .001;
        if(state == 2 || state == 4) reverseUpdate()
        render();

    };

    function render() {
        // if(window.isMobile){
            // renderer.render( scene, camera );
        // } else {
            postprocessing.composer.render(1);
        // }
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