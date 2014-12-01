var THREEx	= THREEx	|| {}

THREEx.Oimo	= {}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Oimo.createBodyFromMesh	= function(world, mesh, type, move){
	// TODO this move parameter is crap, remove it
	move = move !== undefined ? move : true
	if( type == 'box' ){
		var body	= new OIMO.Body({
			type	:'box',
			size	: [
				mesh.geometry.width  * mesh.scale.x,
				mesh.geometry.height * mesh.scale.y,
				mesh.geometry.depth  * mesh.scale.z,
			],
			pos	: mesh.position.toArray(),
			rot	: mesh.rotation.toArray().slice(0,3),
			world	: world,
			move	: move,
		})

		return body
	}else if( type == 'sphere' ){
		var body	= new OIMO.Body({
			type	:'sphere',
			size	: [mesh.geometry.radius * mesh.scale.x],
			pos	: mesh.position.toArray(),
			rot	: mesh.rotation.toArray().slice(0,3),
			world	: world,
			move	: move,
		})
		return body
	}else	console.assert(false, 'Unknown geometry')
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Oimo.Body2MeshUpdater	= function(body, mesh){
	var matrix = new THREE.Matrix4();
	this.update	= function(){
		var phyMatrix	= body.getMatrix();
		matrix.fromArray(phyMatrix);
		mesh.position.getPositionFromMatrix( matrix );
		mesh.rotation.setFromRotationMatrix( matrix );				
	}
}



//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Oimo.Stats	= function(world){
	
	var domElement	= document.createElement('div')
	this.domElement	= domElement
	// domElement.style.color	= 'bl'
	domElement.style.position	= 'absolute'
	domElement.style.top		= '10px'
	domElement.style.left		= '10px'
	domElement.style.width		= '400px'
	domElement.style.height		= '400px'
	
	var fps=0, time, time_prev=0, fpsint = 0;
	this.update	= function(){
	    time = Date.now();
	    if (time - 1000 > time_prev) {
	        time_prev = time; fpsint = fps; fps = 0;
	    } fps++;
	    var info =[
	        "Oimo.js DEV.1.1.0a<br><br>",
	        "FPS: " + fpsint +" fps<br><br>",
	        "Rigidbody: "+world.numRigidBodies+"<br>",
	        "Contact: "+world.numContacts+"<br>",
	        "Pair Check: "+world.broadPhase.numPairChecks+"<br>",
	        "Contact Point: "+world.numContactPoints+"<br>",
	        "Island: " + world.numIslands +"<br><br>",
	        "Broad-Phase: " + world.performance.broadPhaseTime + " ms<br>",
	        "Narrow-Phase: " + world.performance.narrowPhaseTime + " ms<br>",
	        "Solving: " + world.performance.solvingTime + " ms<br>",
	        "Updating: " + world.performance.updatingTime + " ms<br>",
	        "Total: " + world.performance.totalTime + " ms "
	     ].join("\n");
	    domElement.innerHTML = info;
	}	
}
