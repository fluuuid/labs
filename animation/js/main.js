(function(){

    // Load the curve data
    cyclops.loadCurves(positions);

    

    var R_1 = cyclops.getCurve("R_01_01-position");
    console.log(R_1);

    
        var tweenOver = new TweenLite($("#buttonExample"), (positions["R_01_01-position"].duration / 1000), {width:400, ease:kviz});
        tweenOver.play();
        
        // var tweenOut = new TweenLite($("#buttonExample"), (rollovers["kviz8080"].duration / 1000), {width:200, ease:kviz});
        // tweenOut.play();

    

})();
