$(document).ready(function(){
	$("#file").change(function(e){
		var img = e.target.files[0];

		if(!pixelarity.open(img, true, function(res){
			$("#result").attr("src", res);			
		})){
			alert("Whoops! That is not an image!");
		}

	});
});