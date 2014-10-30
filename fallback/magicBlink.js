var colorSwitch = 0;

function setRandomBgColor(){
	var rR = Math.floor( Math.random() * 256 );
	var rG = Math.floor( Math.random() * 256 );
	var rB = Math.floor( Math.random() * 256 );

	var RR = rR.toString( 16 );
	if( RR.length < 2 ) RR = "0"+RR;
	var GG = rG.toString( 16 );
	if( GG.length < 2 ) GG = "0"+GG;
	var BB = rB.toString( 16 );
	if( BB.length < 2 ) BB = "0"+BB;

	var hexColor = RR+GG+BB;

//	$('#BAMmsg').toggle( 'color', '#FFF' );
//console.log( $('#BAMmsg').css( 'color' ) );

// shorten switch code
	if( colorSwitch ){
		colorSwitch = 0;
//		$('.style_MAGIC').css( 'color', '#000' );
		$('#BAMmsg').css({ 'color' : '#000' });
	}
	else{
		colorSwitch = 1;
//		$('.style_MAGIC').css( 'color', '#FFF' );
		$('#BAMmsg').css({ 'color' : '#FFF' });
	}

//	$('.bg_MAGIC').css({ 'background-color' : '#'+hexColor });   //css remians..
	$('#BAMwrapper').css({ 'background-color' : '#'+hexColor });   //css remians..
}
