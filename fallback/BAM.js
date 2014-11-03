$( function(){

	var defaultInputMsg = "TYPE YOUR BIG-ASS MESSAGE HERE";
	var defaultPreviewMsg = "BIG-ASS MESSAGE";
	var heartPreviewMsg = "I LOVE BIG-ASS MESSAGE";


	var theMSG = '';
	var setSTYLE = '';

	var prevSTYLE;
	var theSTYLE = "BASIC";

	var styleProps;
	var styleBg;

	var blinker;

	var msgStyles = {}

	msgStyles["msgBASICprops"] = {
		'font-family' : 'bam_futuraCnXBdOb',
		'color' : '#000'
	};
	msgStyles["bgBASIC"] = "#FFF";

	msgStyles["msgMAGICprops"] = {
		'font-family' : 'bam_futuraCnXBdOb',
		'color' : '#000'
	};
	msgStyles["bgMAGIC"] = "#FFF";

	msgStyles["msgJPRDYprops"] = {
		'font-family' : 'bam_itc_korinna_ltregular',
		'color' : '#FFF',
		'text-shadow' : '2px 2px 2px #000'
	};
	msgStyles["bgJPRDY"] = "#00C";

	msgStyles["msgHEARTprops"] = {
		'font-family' : 'bam_itc_american_typewriterRg',
		'color' : '#000'
	};
	msgStyles["bgHEART"] = "#FFF";

	msgStyles["msgPOSTRprops"] = {
		'font-family' : 'bam_alt_gothic',
		'color' : '#ffd700',
		'line-height' : '90%',
		'text-shadow' : '5px 5px 20px rgba(0,0,0,1)',
		'-webkit-mask-image' : "url('img/POSTR_texture.png')",
		'-o-mask-image' : "url('img/POSTR_texture.png')",
		'-moz-mask-image' : "url('img/POSTR_texture.png')",
		'mask-image' : "url('img/POSTR_texture.png')"
	};
	msgStyles["bgPOSTR"] = "url('img/POSTR_bgPattern.gif'), #333";

	var fntSz = 100;

	$('#urlOutput').prop('disabled', true);
	$('#msgInput').val( defaultInputMsg );
	//$('#BASIC').addClass('btnON');

	msgMode = true;

	theMSG = "404<br>GET OUT OF HERE"
	setSTYLE = "MAGIC"

	/*console.log( "theMSG: "+theMSG );
	console.log( "setSTYLE: "+setSTYLE );*/

	setTimeout( showBAM, 66, theMSG, setSTYLE );


// --- SCALE TEXT ----------
function scaleText(){
//$('#outputTF').val( "scaleText()" );

	var winW = $('#BAMwrapper').innerWidth();
	var winH = $('#BAMwrapper').innerHeight();

	var wRatio = $('#BAMmsg').outerWidth() / winW;
	var hRatio = $('#BAMmsg').outerHeight() / winH;

	if( wRatio <= 1 ){
		while( $('#BAMmsg').outerWidth() <= winW ){
			fntSz++;
			$('#BAMmsg').css( 'font-size', fntSz+"px" );
		}
		while( $('#BAMmsg').outerHeight() > winH ){   /* never true? */
			fntSz--;
			$('#BAMmsg').css( 'font-size', fntSz+"px" );
		}
	}
	else{
		while( $('#BAMmsg').outerWidth() > winW ){
			fntSz--;
			$('#BAMmsg').css( 'font-size', fntSz+"px" );
		}
		while( $('#BAMmsg').outerHeight() > winH ){
			fntSz--;
			$('#BAMmsg').css( 'font-size', fntSz+"px" );
		}
	}

	$('#BAMmsg').css( 'top', (winH-$('#BAMmsg').outerHeight())/2 );
}



// --- SHOW BAM - PREIEW/MSG ----------
function showBAM( msg, stl ){

	var style = stl ? stl : theSTYLE;

	if( !msgMode ){   // if preview. hidden by default
		$('#main').hide();
	}

	$('#bottomLeft').hide();
	$('#bottomBanner').hide();

	$('#BAMwrapper').show();


	styleProps = msgStyles['msg'+style+'props'];
	styleBg = msgStyles['bg'+style];


	$('#BAMwrapper').css( 'background', styleBg );   //merge with BAMwrapper line above?
	$('#BAMwrapper').css( 'padding-top', '0' );

	for( var i in styleProps ){
		$('#BAMmsg').css(
			i, styleProps[i]
		);
//		console.log( i, styleProps[i] );
	}

	switch( style ){
		case "MAGIC":
//			blinker = setInterval( 'setRandomBgColor()', 10 );
			blinker = setInterval( setRandomBgColor, 10 );
			break;
		case "HEART":
			msg = msg.replace( /HEART|LOVE/, "<span style='color:#F00'>o</span>" );
//			console.log(msg);
			break;

		case "POSTR":
			$('#BAMwrapper').css( 'padding-top', '1%' );
			break;

		default:
	// else if (OLD STYLES)
	// same as magic (for now)
	}

	$('#BAMmsg').html( msg );

	if( stl ) $('#loadWrapper').hide();

	scaleText();
}

// --- RESIZE WINDOW ----------
	$(window).resize( function(){
//		console.log("resizing");
		if( msgMode ) scaleText();
	});

});
