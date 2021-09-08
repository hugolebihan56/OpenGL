var colorWell;
var colorWell2;
var defaultColor = "#0317fc";
var defaultColor2 = "#f7d600";
var defaultColor3 = "#ff1938";
window.addEventListener("load", startup, false);

//FONCTION CONTOUR //////////////////////////////////////////////////
function myFunction2() {
  // Get the checkbox
  var checkBox = document.getElementById("myCheck2");
  // If the checkbox is checked, display the output text
  if (checkBox.checked == true){
    CONTOUR = true;
  } else {
    CONTOUR = false;
  }
}
//FONCTION VRAIE COULEURS //////////////////////////////////////////////////
function myFunction() {
  // Get the checkbox
  var checkBox = document.getElementById("myCheck");
  // If the checkbox is checked, display the output text
  if (checkBox.checked == true){
    trueColor = true;
  } else {
    trueColor = false;
  }
}

//FONCTIONS COULEURS //////////////////////////////////////////////////
function startup() {
  colorWell = document.querySelector("#colorWell");
  colorWell.value = defaultColor;
  colorWell.addEventListener("change", updateAll, false);
  colorWell.select();

  colorWell2 = document.querySelector("#colorWell2");
  colorWell2.value = defaultColor2;
  colorWell2.addEventListener("change", updateCouche2, false);
  colorWell2.select();

  colorWell2 = document.querySelector("#colorWell3");
  colorWell2.value = defaultColor3;
  colorWell2.addEventListener("change", updateCouche3, false);
  colorWell2.select();
}

function updateAll(event) {  
    res_PEAU = hexToRgb(event.target.value);   
    COUCHE1[0] = parseFloat((res_PEAU.r/255).toFixed(3));
    COUCHE1[1] = parseFloat((res_PEAU.g/255).toFixed(3));
    COUCHE1[2] = parseFloat((res_PEAU.b/255).toFixed(3));  
}

function updateCouche2(event) {  
    res_COUCHE2 = hexToRgb(event.target.value);   
    COUCHE2[0] = parseFloat((res_COUCHE2.r/255).toFixed(3));
    COUCHE2[1] = parseFloat((res_COUCHE2.g/255).toFixed(3));
    COUCHE2[2] = parseFloat((res_COUCHE2.b/255).toFixed(3)); 
}

function updateCouche3(event) {  
    res_COUCHE3 = hexToRgb(event.target.value);   
    COUCHE3[0] = parseFloat((res_COUCHE3.r/255).toFixed(3));
    COUCHE3[1] = parseFloat((res_COUCHE3.g/255).toFixed(3));
    COUCHE3[2] = parseFloat((res_COUCHE3.b/255).toFixed(3)); 
}

function hexToRgb(hex) {
  	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  	return result ? {
    	r: parseInt(result[1], 16),
    	g: parseInt(result[2], 16),
    	b: parseInt(result[3], 16)
  	} : null;
}

//FONCTION TRANSPARENCE COUHE 1 //////////////////////////////////////////////////
$( function() {
	var handle = $( "#custom-handle" );
	$( "#slider" ).slider( {
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value/100 );
				COUCHE1[3] = 1-(ui.value/100);					
		}
	});
});

//FONCTION TRANSPARENCE COUHE 2 //////////////////////////////////////////////////
$( function() {
	var handle = $( "#custom-handle5" );
	$( "#slider5" ).slider( {
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value/100 );
				COUCHE2[3] = 1-(ui.value/100);					
		}
	});
});

//FONCTION TRANSPARENCE COUHE 3 //////////////////////////////////////////////////
$( function() {
	var handle = $( "#custom-handle6" );
	$( "#slider6" ).slider( {
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value/100 );
				COUCHE3[3] = 1-(ui.value/100);					
		}
	});
});

//FONCTION TRANCHES //////////////////////////////////////////////////
$( function() {
	var handle = $( "#custom-handle2" );
	$( "#slider2" ).slider( {
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value );
				TRANCHE = ui.value;				
		}
	});
});

//FONCTION UNE TRANCHE //////////////////////////////////////////////////
$( function() {
	var handle = $( "#custom-handle3" );
	$( "#slider3" ).slider( {
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( Math.floor(ui.value*3.6) );				
				UneTRANCHE = Math.floor(ui.value*3.6);				
		}
	});
});

//FONCTION TRESHOLD //////////////////////////////////////////////////
$( function() {
	var handle = $( "#custom-handle4" );
	$( "#slider4" ).slider( {
		create: function() {
			handle.text( $( this ).slider( "value" ) );
		},
		slide: function( event, ui ) {
			handle.text( ui.value/100 );				
				SEUIL = ui.value/100;					
		}
	});
});


