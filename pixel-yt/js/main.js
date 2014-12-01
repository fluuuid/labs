(function() {

    var params = {
        shape : 'square',
        resolution: 16, 
        size: 0
    }

    var gui = new dat.GUI();
    gui.add(params, 'resolution', 8, 32).step(2);
    gui.add(params, 'size', 1, 10);

    // Mixed functions and events
    function playerUpdate() {
        context.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
        myPixelation.render([params]);
        window.requestAnimationFrame(playerUpdate);
    };
    function playerStart() {
        console.log('Width: ' + video.videoWidth + ' Height: ' + video.videoHeight);
        videoHeight = video.videoHeight;
        videoWidth = video.videoWidth;
        canvas.setAttribute('height', Math.floor(videoHeight));
        canvas.setAttribute('width', Math.floor(videoWidth));
    };
    function hasGetUserMedia() {
        // Note: Opera builds are unprefixed.
        return !!(navigator.getUserMedia || 
            navigator.webkitGetUserMedia || 
            navigator.mozGetUserMedia || 
            navigator.msGetUserMedia);
    }    

    // Variables
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = '';
    var videoHeight = 480;
    var videoWidth = 640;
    var myPixelation = new ClosePixelation( canvas, []);

    // Init
    if (hasGetUserMedia()) {
        var onFailSoHard = function(e) {
            console.log('Reeeejected!', e);
        };

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

        video = document.querySelector('video');
        video.addEventListener('playing', playerUpdate);
        video.addEventListener('play', playerStart);

        if (navigator.getUserMedia) {
          navigator.getUserMedia({audio: false, video: true}, function(stream) {
            if (navigator.webkitGetUserMedia) {
              video.src = window.webkitURL.createObjectURL(stream);
            } else {
              video.src = stream; // Opera
            }
          }, onFailSoHard);
        } else {
            video.src = 'http://media.w3.org/2010/05/sintel/trailer.webm'; // fallback.
        }
    } else {
      alert('getUserMedia() is not supported in your browser');
    }
})();