$(function(){
	console.log("ready");
	var $h1 = $("h1");
	var $input = $("input");
	$('button').on('click', function(){
		var itemName = $h1.text();
		var quantity = $input.val();
		var details = {
			item: itemName,
			quantity: quantity
		};
		console.log(details);
		$.post('/addToCart', details, function(data, status, jqXHR){
			console.log(data);
			console.log(data);
			console.log(data);
		});
	});
});