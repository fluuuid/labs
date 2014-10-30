var iArrColors=new Array(0,4,8,13,17,21,26,30,34,38,43,47,51,55,60,64,68,72,76,81,85,89,93,98,102,106,110,115,119,123,128,132,136,140,145,149,153,157,161,166,170,174,178,183,187,191,195,200,204,208,213,217,221,225,230,234,238,242,247,251,255);

function getMinuteNow(){
	theTime=new Date();
	atMin=theTime.getHours()*60+theTime.getMinutes();
	return atMin;
}

function toHex(iRed,iGreen,iBlue){
	rr=iRed.toString(16);
	if(rr.length<2)
		rr="0"+rr;
	gg=iGreen.toString(16);
	if(gg.length<2)
		gg="0"+gg;
	bb=iBlue.toString(16);
	if(bb.length<2)
		bb="0"+bb;
	hexcolor="#"+rr+gg+bb;
	return hexcolor;
}

function getColor(m){
	iRed=iGreen=iBlue=0;
	if(m>=0&&m<=239){
		iGreen=255;
		iIndex=60-parseInt((m/4));
		iBlue=iArrColors[iIndex];
	}
	else if(m==240){
		iGreen=255;
	}
	else if(m>=241&&m<=479){
		iIndex=parseInt((m-240)/4);
		iRed=iArrColors[iIndex];
		iGreen=255;
	}
	else if(m==480){
		iRed=iGreen=255;
	}
	else if(m>=481&&m<=719){
		iRed=255;
		iIndex=60-(parseInt((m-480)/4));
		iGreen=iArrColors[iIndex];
	}
	else if(m==720){
		iRed=255;
	}
	else if(m>=721&&m<=959){
		iRed=255;
		iIndex=parseInt((m-720)/4);
		iBlue=iArrColors[iIndex];
	}
	else if(m==960){
		iRed=iBlue=255;
	}
	else if(m>=961&&m<=1199){
		iIndex=60-(parseInt((m-960)/4));
		iRed=iArrColors[iIndex];
		iBlue=255;
	}
	else if(m==1200){
		iBlue=255;
	}
	else if(m>=1201&&m<=1439){
		iIndex=parseInt((m-1200)/4);
		iGreen=iArrColors[iIndex];
		iBlue=255;
	}
	return toHex(iRed,iGreen,iBlue);
}

function doChromo(){
	$('body').css( 'background-color', getColor(getMinuteNow()) );
	setInterval( "$('body').css( 'background-color', getColor(getMinuteNow()) )", 3000 );
////	document.getElementById('btn_'+selectedStyle).style.color = getColor( getMinuteNow() );
////	setInterval("eval( document.getElementById('btn_'+selectedStyle).style.color = getColor( getMinuteNow() ) )",3000);
}
