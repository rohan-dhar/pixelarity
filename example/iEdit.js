$(document).ready(function(){

	function windowOffset(elem){
		var iTop = elem.offset().top;
		var iLeft = elem.offset().left;
		var res = {
			top: iTop - $(window).scrollTop(),
			left: iLeft - $(window).scrollLeft()
		}
		return res;
	} 


	//Inserting required elements.
	var iEditHTML = '<div class="iEdit-img-edit"><canvas class="iEdit-img-edit-can"> </canvas><canvas class="iEdit-img-edit-process-can"></canvas><div class="iEdit-img-edit-select"><div class="iEdit-img-edit-select-resize"></div></div> <div id="iEdit-side-opt-holder"> <div class="iEdit-side-opt iEdit-active-side-opt" id="iEdit-side-opt-crop"> Crop </div> <div class="iEdit-side-opt" id="iEdit-side-opt-draw"> Draw </div> <div class="iEdit-side-opt" id="iEdit-side-opt-filter"> Filters </div> </div>  <div id="iEdit-filter-opt-cont"><div class="iEdit-filter-opt iEdit-active-filter-opt" id="iEdit-filter-opt-1">None</div><div class="iEdit-filter-opt" id="iEdit-filter-opt-2">Grayscale</div><div class="iEdit-filter-opt" id="iEdit-filter-opt-3">Chrome</div><div class="iEdit-filter-opt" id="iEdit-filter-opt-4">Nova</div><div class="iEdit-filter-opt" id="iEdit-filter-opt-5">Blur</div></div>  <div id="iEdit-draw-opt-color-cont"><div class="iEdit-draw-opt-color" id="iEdit-draw-opt-color-1"></div><div class="iEdit-draw-opt-color" id="iEdit-draw-opt-color-2"></div><div class="iEdit-draw-opt-color iEdit-active-draw-opt-color" id="iEdit-draw-opt-color-3"></div><div class="iEdit-draw-opt-color" id="iEdit-draw-opt-color-4"></div><div class="iEdit-draw-opt-color" id="iEdit-draw-opt-color-5"></div><div class="iEdit-draw-opt-color" id="iEdit-draw-opt-color-6"></div></div> <div class="iEdit-img-edit-act iEdit-img-edit-save"> Done </div><div class="iEdit-img-edit-act iEdit-img-edit-cancel"> Cancel </div></div>';
	$("body").append(iEditHTML);
		
	//Main Image Editor Object
	window.iEdit = {

		//Caching Selectors
		can: $('.iEdit-img-edit-can')[0],
		ctx: null,
		processCan: $('.iEdit-img-edit-process-can')[0],

		selectionBox: $('.iEdit-img-edit-select'),
		container: $('.iEdit-img-edit'),

		saveBtn: $(".iEdit-img-edit-save"),
		cancelBtn: $('.iEdit-img-edit-cancel'),

		sideOpts: $(".iEdit-side-opt"),
		sideOptCrop: $("#iEdit-side-opt-crop"),
		sideOptDraw: $("#iEdit-side-opt-draw"),		
		sideOptFilter: $("#iEdit-side-opt-filter"),		

		drawOptsColorsContainer: $("#iEdit-draw-opt-color-cont"),
		drawOptsColors: $(".iEdit-draw-opt-color"),				
		drawOptColor1: $("#iEdit-draw-opt-color-1"),				
		drawOptColor1: $("#iEdit-draw-opt-color-2"),				
		drawOptColor1: $("#iEdit-draw-opt-color-3"),						
		drawOptColor1: $("#iEdit-draw-opt-color-4"),				
		drawOptColor1: $("#iEdit-draw-opt-color-5"),				
		drawOptColor1: $("#iEdit-draw-opt-color-6"),				

		filterOptsContainer: $("#iEdit-filter-opt-cont"),
		filterOpts: $(".iEdit-filter-opt"),
		filterOptNone: $("#iEdit-filter-opt-1"),
		filterOptGray: $("#iEdit-filter-opt-2"),
		filterOptChrome: $("#iEdit-filter-opt-3"),
		filterOptNova: $("#iEdit-filter-opt-4"),
		filterOptBlur: $("#iEdit-filter-opt-5"),

		//Internal Properties
		drag: false,
		resize: false,

		square: true,
		status: false,

		grcx: null,
		grcy: null,

		callback: null,

		imageType: null,
		imageQuality: 1,

		tool: "crop",

		drawing: false,
		colors: ["000000", "ffffff", "2795f3", "ec5454", "2ecc71", "efd244"],
		drawColor: "2795f3",

		//Open the Image Editor with appropriate settings
		open: function(imgObj, square, callback, imageType, imageQuality){

			if(imgObj.constructor !== File || !imgObj.type.match('image.*')){
				return false;
			}

			this.drag = false;
			this.resize = false;
			
			this.changeTool("crop");

			//Using the supplied settings or using defaults in case of invalid settings

			this.square = (square === true) ? true : false;
			this.imageQuality = (Number(imageQuality) > 0 && Number(imageQuality) <= 1) ? Number(imageQuality) : 1;

			if(imageType == "jpeg" || imageType == "png" || imageType == "gif" || imageType == "bmp"){ //JPG and any other would default to JPEG//
				this.imageType = imageType;
			}else{
				this.imageType = "jpeg";	
			}

			//false: Not In Use
			this.grcx = false;
			this.grcy = false;					

			//Checking if callback is a valid function
			var getType = {};
			this.callback = (callback && getType.toString.call(callback) === '[object Function]') ? callback : false;
			 
			this.status = true;

			this.ctx = this.can.getContext("2d");

			//Shwoing the conatiner on screen
			iEdit.container.css("display","block").stop().animate({"opacity":"1"});

			var img = new Image();
			var that =  this;

			//Draw the image on the visible canvas depending on the aspect ratio of the image.
			$(img).on("load", function(){

				if(img.width > img.height){
					that.can.width = img.width;
					that.can.height = img.height;

					that.can.style.width = ($(window).width()/2*1)+"px"; 
					that.can.style.height = (img.height*(($(window).width()/2*1)/img.width))+"px";
	
					
					iEdit.ctx.fillStyle = '#fff'; 
					iEdit.ctx.fillRect(0, 0, that.can.width, that.can.height);

					iEdit.ctx.drawImage(img, 0, 0, that.can.width, that.can.height);

					iEdit.selectionBox.height($(that.can).height()-20);
					iEdit.selectionBox.width($(that.can).height()-20);

					iEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).height()/2) + 10  + 'px' ,'top': $(window).height()/2 - $(that.can).height()/2 - 15 + 'px' });

				}else if(img.width < img.height){

					that.can.width = img.width;
					that.can.height = img.height;

					that.can.style.width = (img.width*(($(window).height()/3*2)/img.height)) + "px";
					that.can.style.height = ($(window).height()/3*2) + "px"; 

					iEdit.ctx.fillStyle = '#fff'; 
					iEdit.ctx.fillRect(0, 0, that.can.width, that.can.height);

					iEdit.ctx.drawImage(img, 0, 0, that.can.width, that.can.height);

					iEdit.selectionBox.height($(that.can).width()-20);
					iEdit.selectionBox.width($(that.can).width()-20);

					iEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).width()/2) + 10  + 'px' ,'top': $(window).height()/2 - $(that.can).width()/2 - 15 + 'px' });


				}else{

					that.can.width = img.width;
					that.can.height = img.height;

					that.can.style.width = ($(window).height()/4.8*3.3) + "px";
					that.can.style.height = ($(window).height()/4.8*3.3) + "px";					


					iEdit.ctx.fillStyle = '#fff'; 
					iEdit.ctx.fillRect(0, 0, that.can.width, that.can.height);

					iEdit.ctx.drawImage(img, 0, 0, that.can.width, that.can.height);

					iEdit.selectionBox.height($(that.can).width()-20);
					iEdit.selectionBox.width($(that.can).width()-20);
				
					iEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).width()/2) + 10  + 'px' ,'top': $(window).height()/2 - $(that.can).width()/2 - 15 + 'px' });
				}

				var ratio = iEdit.can.width/$(iEdit.can).width();
				var h = iEdit.can.height * ratio;
				var w = iEdit.can.width * ratio;		

				iEdit.processCan.height = h;
				iEdit.processCan.width = w;		
				
				var pCtx = iEdit.processCan.getContext("2d");
				pCtx.drawImage(iEdit.can, 0, 0, w, h);

			});			

			img.src = URL.createObjectURL(imgObj);
			return true;
		},

		changeTool: function(tool){

			if(tool == "crop"){
				this.selectionBox.css("display", "block");

				this.tool = "crop";
				this.sideOpts.removeClass("iEdit-active-side-opt");
				this.sideOptCrop.addClass("iEdit-active-side-opt");
				
				this.drawOptsColorsContainer.css("display", "none");
				this.filterOptsContainer.css("display", "none");
				
				
				return true;

			}else if(tool == "draw"){
				
				this.tool = "draw";
				this.sideOpts.removeClass("iEdit-active-side-opt");
				this.sideOptDraw.addClass("iEdit-active-side-opt");
				
				this.selectionBox.css("display", "none");
				this.filterOptsContainer.css("display", "none");
				
				this.drawOptsColorsContainer.css("display", "block");

				return true;

			}else if(tool == "filter"){
				this.tool = "filter";
				this.sideOpts.removeClass("iEdit-active-side-opt");
				this.sideOptFilter.addClass("iEdit-active-side-opt");
				
				this.drawOptsColorsContainer.css("display", "none");
				this.selectionBox.css("display", "none");

				this.filterOptsContainer.css("display", "block");	
			}

		},

		changeFilter: function(filter){
		
			iEdit.filterOpts.removeClass("iEdit-active-filter-opt");
			$("#iEdit-filter-opt-"+filter).addClass("iEdit-active-filter-opt");
	
			if(filter == 1){
				iEdit.ctx.filter = "none";				
			}else if(filter == 2){
				iEdit.ctx.filter = "grayscale(1)";								
			}else if(filter == 3){
				iEdit.ctx.filter = "sepia(0.42) saturate(1.4) contrast(1.1)";							
			}else if(filter == 4){
				iEdit.ctx.filter = "grayscale(0.25) saturate(0.75) contrast(1.5)";								
			}else if(filter == 5){
				iEdit.ctx.filter = "blur(14px)";				
			}
			this.ctx.height = this.ctx.height;
			this.ctx.drawImage(iEdit.processCan, 0, 0, iEdit.can.width,  iEdit.can.height);
		},

		//Close the image editor and reset the settings.
		close: function(){
			this.drag = false;
			this.resize = false;
			this.square = true;
			this.status = false;
			this.grcx = undefined;
			this.grcy = undefined;
			this.callback = undefined;

			this.can.height = 0;
			this.can.width = 0;

			this.processCan.height = 0;
			this.processCan.width = 0;


			iEdit.ctx.filter = "none";
			iEdit.filterOpts.removeClass("iEdit-active-filter-opt");
			iEdit.filterOptNone.addClass("iEdit-active-filter-opt");			

			var pCtx = this.processCan.getContext("2d");			

			iEdit.ctx.clearRect(0, 0, 0, 0);
			pCtx.clearRect(0, 0, 0, 0);
		
			iEdit.selectionBox.css({
				"height":'0px',
				"width":'0px',				
			});		

			iEdit.container.stop().animate({
				"opacity":"0"
			}, 300);

			setTimeout(function(){
				iEdit.container.css({"display":"none"});
			}, 300);

		}
	}

	//Set flags to stop tracking mouse movement.
	$(document).on("mouseup",function(){
		iEdit.drag = false;
		iEdit.resize = false;	
		iEdit.grcx = false;
		iEdit.grcy = false;
		iEdit.drawing = false;
	});


	//Set flags to start trachong mouse movement.
	iEdit.selectionBox.on("mousedown", function(e){
		var that = $(this);

		var rcx = e.clientX - windowOffset(that).left;
		var rcy = e.clientY - windowOffset(that).top;

		iEdit.grcx = false;
		iEdit.grcy = false;

		if( (iEdit.selectionBox.width() - rcx <= 28) && (iEdit.selectionBox.height() - rcy <= 28)){
			iEdit.drag = false;
			iEdit.resize = true;
		}else{
			iEdit.drag = true;
			iEdit.resize = false;
		}

	});

	$(iEdit.can).on("mousedown", function(e){
		if(iEdit.tool == "draw"){
			iEdit.drawing = true;
			var ratio = iEdit.can.width/$(iEdit.can).width();
			iEdit.lastDrawX = (e.clientX - windowOffset($(iEdit.can)).left) * ratio;
			iEdit.lastDrawY = (e.clientY - windowOffset($(iEdit.can)).top) * ratio;

		}
	});


	//Track mouse movements when the flags are set.
	$(document).on('mousemove', function(e){

		var rcx = e.clientX - windowOffset(iEdit.selectionBox).left;
		var rcy = e.clientY - windowOffset(iEdit.selectionBox).top;

		if(iEdit.drag === true && iEdit.status){

			if(iEdit.grcx === false){
				iEdit.grcx = rcx;
			}

			if(iEdit.grcy === false){
				iEdit.grcy = rcy;
			}

			var xMove = e.clientX - iEdit.grcx;
			var yMove = e.clientY - iEdit.grcy;


			if( (xMove + iEdit.selectionBox.width() >= $(iEdit.can).width() + windowOffset($(iEdit.can)).left) || xMove <= windowOffset($(iEdit.can)).left){
				if(xMove <= windowOffset($(iEdit.can)).left){
					iEdit.selectionBox.css({"left":windowOffset($(iEdit.can)).left+"px"});
				}else{
					iEdit.selectionBox.css({"left":windowOffset($(iEdit.can)).left + $(iEdit.can).width() - iEdit.selectionBox.width() + "px"});						
				}
			}else{
				iEdit.selectionBox.css({"left":xMove+"px"});
			}


			if((yMove + iEdit.selectionBox.height() >= $(iEdit.can).height() + windowOffset($(iEdit.can)).top) || (yMove <= windowOffset($(iEdit.can)).top) ){
				if(yMove <= windowOffset($(iEdit.can)).top){
					iEdit.selectionBox.css({"top":windowOffset($(iEdit.can)).top+"px"});
				}else{
					iEdit.selectionBox.css({"top":windowOffset($(iEdit.can)).top + $(iEdit.can).height() - iEdit.selectionBox.height() + "px"});
				}
			}else{
				iEdit.selectionBox.css({"top":yMove+"px"});
			}

		}else if(iEdit.resize === true && iEdit.status){

			var nWidth = rcx;
			var nHeight = rcy;

			if(iEdit.square){
				if(nWidth >= nHeight){//Width is the dominating dimension; 
					nHeight = nWidth;
					if(nWidth < 100){
						nWidth = 100;
						nHeight = 100;						
					}
				}else{//Height is the dominating dimension; 
					nWidth = nHeight;
					if(nHeight < 100){
						nWidth = 100;
						nHeight = 100;
					}
				}				

				if((nWidth + windowOffset(iEdit.selectionBox).left) >= $(iEdit.can).width() + windowOffset($(iEdit.can)).left){
					nWidth = (windowOffset($(iEdit.can)).left + $(iEdit.can).width()) - (windowOffset(iEdit.selectionBox).left);
					if(windowOffset(iEdit.selectionBox).top + nWidth > $(iEdit.can).height() + windowOffset($(iEdit.can)).top){
						nWidth = (windowOffset($(iEdit.can)).top + $(iEdit.can).height()) - (windowOffset(iEdit.selectionBox).top);
					}
					nHeight = nWidth;
				}else if((nHeight + windowOffset(iEdit.selectionBox).top) >= $(iEdit.can).height() + windowOffset($(iEdit.can)).top){
					nHeight = (windowOffset($(iEdit.can)).top + $(iEdit.can).height()) - (windowOffset(iEdit.selectionBox).top);
					if(windowOffset(iEdit.selectionBox).left + nHeight > $(iEdit.can).width() + windowOffset($(iEdit.can)).left){
						nHeight = (windowOffset($(iEdit.can)).left + $(iEdit.can).width()) - (windowOffset(iEdit.selectionBox).left);
					}
					nWidth = nHeight;
				}


			}else{

				if(nWidth <= 100){
					nWidth = 100;
				}
				if(nHeight <= 100){
					nHeight = 100;
				}			
				if(e.clientX >= $(iEdit.can).width() + windowOffset($(iEdit.can)).left){    //REASON: nWidth + windowOffset(iEdit.selectionBox).left = e.clientX;
					nWidth = (windowOffset($(iEdit.can)).left + $(iEdit.can).width()) - (windowOffset(iEdit.selectionBox).left);
				}
				if(e.clientY >= $(iEdit.can).height() + windowOffset($(iEdit.can)).top){	//REASON: Same logic as nWidth
					nHeight = (windowOffset($(iEdit.can)).top + $(iEdit.can).height()) - (windowOffset(iEdit.selectionBox).top);
				}
			}
			
			iEdit.selectionBox.css({
				"width":nWidth+"px",
				"height":nHeight+"px",				
			});
	
		}else if(iEdit.drawing && iEdit.status){

			var ratio = iEdit.can.width/$(iEdit.can).width();
			var x = (e.clientX - windowOffset($(iEdit.can)).left) * ratio;
			var y = (e.clientY - windowOffset($(iEdit.can)).top) * ratio;
			
			var n = 25;
			
			iEdit.ctx.fillStyle = "#"+iEdit.drawColor;

			for(var i = 1; i <= n; i++){					
				iEdit.ctx.beginPath();			
				iEdit.ctx.arc(x - (x-iEdit.lastDrawX) / n * i, y - (y-iEdit.lastDrawY) / n * i, ratio * 3 , 0, 2 * Math.PI, false);
				iEdit.ctx.fill();
			}

			iEdit.lastDrawX = x;
			iEdit.lastDrawY = y;		

		}

	});

	//Process the selected region and return it as an image to the user defined callback.
	iEdit.saveBtn.on("click", function(){

		if(!iEdit.callback){
			iEdit.close();
			return;
		}

		if(iEdit.tool != "crop"){			
			iEdit.changeTool("crop");
		}

		var ratio = iEdit.can.width/$(iEdit.can).width();

		var h = iEdit.selectionBox.height() * ratio;
		var w = iEdit.selectionBox.width() * ratio;		
		var x = (windowOffset(iEdit.selectionBox).left - windowOffset($(iEdit.can)).left) * ratio;
		var y = (windowOffset(iEdit.selectionBox).top - windowOffset($(iEdit.can)).top) * ratio;		

		iEdit.processCan.height = h;
		iEdit.processCan.width = w;		
		
		var pCtx = iEdit.processCan.getContext("2d");

		pCtx.drawImage(iEdit.can, x, y, w, h, 0, 0, w, h);


		iEdit.callback(iEdit.processCan.toDataURL("image/"+iEdit.imageType, iEdit.imageQuality));
		iEdit.close();

	});

	//Close the canvas without processing the image on cancel.
	iEdit.cancelBtn.on("click", function(){
		iEdit.close();
	});


	iEdit.sideOpts.click(function(){
		var t = $(this).attr("id").substr(15);
		iEdit.changeTool(t);
	});

	//Setup canvas when window is resized. 
	$(window).on("resize", function(){
		if(iEdit.status){
			iEdit.selectionBox.css({'left': (($(window).width()/2) - $(iEdit.can).height()/2) + 10  + 'px' ,'top': $(window).height()/2 - $(iEdit.can).height()/2 + 10 + 'px' });
		}
	});	

	iEdit.drawOptsColors.on("click", function(){
		var n = Number($(this).attr("id").substr(21)) - 1;
		iEdit.drawColor = iEdit.colors[n];
		iEdit.drawOptsColors.removeClass("iEdit-active-draw-opt-color");
		$(this).addClass("iEdit-active-draw-opt-color");
	});

	iEdit.filterOpts.on("click", function(){
		var n = Number($(this).attr("id").substr(17));
		iEdit.changeFilter(n);
	});

});