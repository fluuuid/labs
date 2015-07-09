var THREE = require('three');

var Globe = function(scene)
{
    this.scene = scene;

    // this.shaders = {
    //     'earth' : {
    //       uniforms: {
    //         'texture': { type: 't', value: null }
    //       },
    //       vertexShader: [
    //         'varying vec3 vNormal;',
    //         'varying vec2 vUv;',
    //         'void main() {',
    //           'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    //           'vNormal = normalize( normalMatrix * normal );',
    //           'vUv = uv;',
    //         '}'
    //       ].join('\n'),
    //       fragmentShader: [
    //         'uniform sampler2D texture;',
    //         'varying vec3 vNormal;',
    //         'varying vec2 vUv;',
    //         'void main() {',
    //           'vec3 diffuse = texture2D( texture, vUv ).xyz;',
    //           // 'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
    //           // 'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
    //           'gl_FragColor = vec4( diffuse , 1.0 );',
    //         '}'
    //       ].join('\n')
    //     }
    // };

    var geometry = new THREE.SphereGeometry(200, 40, 40);

    // shader = this.shaders['earth'];
    // uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    var texture = THREE.ImageUtils.loadTexture('world.jpg');
    texture.minFilter = THREE.LinearFilter;

    // uniforms['texture'].value = texture;

    material = new THREE.MeshBasicMaterial({
        map : texture
        // uniforms: uniforms,
        // vertexShader: shader.vertexShader,
        // fragmentShader: shader.fragmentShader,
    });

    // material = new THREE.ShaderMaterial({
    //     uniforms: uniforms,
    //     vertexShader: shader.vertexShader,
    //     fragmentShader: shader.fragmentShader,
    // });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.y = Math.PI;

    this.scene.add(this.mesh);

    geometry = new THREE.BoxGeometry(0.75, 0.75, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));

    this.point = new THREE.Mesh(geometry);
}

Globe.prototype.colorFn = function(x) {
    var c = new THREE.Color();
    c.setHSL( ( 0.1 - ( x * 0.5 ) ), 1.0, 0.5 );
    return c;
};

Globe.prototype.addData = function(data, opts) 
{
    var lat, lng, size, color, i, step, colorFnWrapper;

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || 'magnitude'; // other option is 'legend'
    // if (opts.format === 'magnitude') {
    //   step = 3;
    //   colorFnWrapper = function(data, i) { return this.colorFn(data[i+2]); }
    // } else if (opts.format === 'legend') {
    //   step = 4;
    //   colorFnWrapper = function(data, i) { return this.colorFn(data[i+3]); }
    // } else {
    //   throw('error: format not supported: '+opts.format);
    // }

    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        for (i = 0; i < data.length; i += step) {
          lat = data[i];
          lng = data[i + 1];
    //        size = data[i + 2];

          // color = colorFnWrapper(data,i);
          color = this.colorFn(data[i+2])
          size = 0;
          this.addPoint(lat, lng, size, color, this._baseGeometry);
        }
      }
      if(this._morphTargetId === undefined) {
        this._morphTargetId = 0;
      } else {
        this._morphTargetId += 1;
      }
      opts.name = opts.name || 'morphTarget'+this._morphTargetId;
    }
    var subgeo = new THREE.Geometry();
    for (i = 0; i < data.length; i += step) {
      lat = data[i];
      lng = data[i + 1];
      
      color = this.colorFn(data[i+2])
      // color = colorFnWrapper(data,i);
      size = data[i + 2];
      size = size*200;
      this.addPoint(lat, lng, size, color, subgeo);
    }
    if (opts.animated) {
      this._baseGeometry.morphTargets.push({'name': opts.name, vertices: subgeo.vertices});
    } else {
      this._baseGeometry = subgeo;
    }

};

Globe.prototype.addPoint = function(lat, lng, size, color, subgeo) {

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    this.point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
    this.point.position.y = 200 * Math.cos(phi);
    this.point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

    this.point.lookAt(this.mesh.position);

    this.point.scale.z = Math.max( size, 0.1 ); // avoid non-invertible matrix
    this.point.updateMatrix();

    for (var i = 0; i < this.point.geometry.faces.length; i++) {

      this.point.geometry.faces[i].color = color;

    }
    if(this.point.matrixAutoUpdate){
      this.point.updateMatrix();
    }

    subgeo.merge(this.point.geometry, this.point.matrix);
}

Globe.prototype.createPoints = function() 
{
    if (this._baseGeometry !== undefined) {
      if (this.is_animated === false) {
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: false
            }));
      } else {
        if (this._baseGeometry.morphTargets.length < 8) {
          console.log('t l',this._baseGeometry.morphTargets.length);
          var padding = 8-this._baseGeometry.morphTargets.length;
          console.log('padding', padding);
          for(var i=0; i<=padding; i++) {
            console.log('padding',i);
            this._baseGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._baseGeometry.vertices});
          }
        }
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: true
            }));
      }
      this.scene.add(this.points);
    }
}

module.exports = Globe;
