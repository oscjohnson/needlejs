jQuery(document).ready(function($) {


	$('#controls .thread-slider').slider({
		min: 0,
		max: 100,
		value: 30,
		slide: function( event, ui ) {
			config.thread = ui.value / 100;
		}
	});

	$('#controls .gap-slider').slider({
		min: 0,
		max: 100,
		value: 2,
		slide: function( event, ui ) {
			config.gap = ui.value / 100;
		}
	});

	
	$('#controls .shading:input[type=checkbox]').change( function(){
        if (this.checked) {
        	config.shading = true;
        }
        else{
        	config.shading = false;
        }

    });
    
	$('#controls .color-btn').on('click', function(){
		var hex = $('#controls .color').val();
		console.log(hex);
		config.bg = hex2rgb(hex);
	});


});