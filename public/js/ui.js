jQuery(document).ready(function($) {
	$('#controls .shading:input[type=checkbox]').change( function(){
        config.shading = this.checked;
    });

	$('#controls .thread-slider').slider({
		min: 0,
		max: 100,
		value: config.thread * 100,
		slide: function( event, ui ) {
			config.thread = ui.value / 100;
		}
	});

	$('#controls .gap-slider').slider({
		min: 0,
		max: 100,
		value: config.gap * 100,
		slide: function( event, ui ) {
			config.gap = ui.value / 100;
		}
	});

	$('#controls .noise-slider').slider({
		min: 0,
		max: 100,
		value: config.noise * 100,
		slide: function( event, ui ) {
			config.noise = ui.value / 100;
		}
	});
	
    $('#controls .stitches').on('change', function(){
		var newValue = $(this).val();
		config.nw = newValue;
		config.nh = newValue;
    });	


	$('#controls .color-btn').on('click', function(){
		var hex = $('#controls .color').val();
		config.bg = hex2rgb(hex);
	});
});