<h1>Pixelarity.</h1>

<p>
Pixelarity is a JavaScript library which allows you to add an image cropping and modifying interface to your website. You no longer need to create advanced image processing scripts in WebGL; all you need to do is provide pixelarity with the image files and deal with the image modified by the user. No need to make your own interface or hassle around with aspect ratios, resolutions and file types; pixelarity has you covered. Just include the script and the style files and call the functions. That is it.
</p>

<h2>Usage</h2>
To use pixelarity, just include pixelarity's script file and the style file. <b>jQuery</b> is the only dependancy and must included as well.

<h3>API</h3>

<ul>
<li>
<h4><code>pixelarity.open()</code></h4>
Opens the image editor with the provided image object. The image modified by the user it supplied to the callback as a DataURI. Additional settings are supplied as parameters to <code>pixelarity.open()</code>.

<h3>Syntax and Parameter</h3>
<code>pixelarity.open(imageObject, square, callback, imageType, imageQuality, face)</code>
<ul>
<li>
<b><code>imageObject</code></b><br>
Required - A File object of the image to be edited. The File should be a valid image.
</li><li>
<b><code>square</code></b><br>
Optional - Boolean value specifying if the image cropped by the user should only be a square. If <code>true</code>, users can only can crop the image to be a square.
<br>
<b>Default:</b><code>false</code>
</li><li>
<b><code>callback</code></b><br>
Optional - A function to use the image cropped by the user. The image cropped by the user is supplied to the function as the first parameter. If the <code>face</code> parameter of the <code>.open()</code> is set to true, the second parameter supplied to the callback is an array of objects of faces detected. Each object has the following properties:
<ol>
	<li><code><b>.x</b></code></li>: X co-ordinate of the face from the top-left of the image.
	<li><code><b>.y</b></code></li>: Y co-ordinate of the face from the top-left of the image.
	<li><code><b>.height</b></code></li>: Height of the face.
	<li><code><b>.x</b></code></li>: Width of the face.
</ol>
</li><li>
<b><code>imageType</code></b><br>
Optional - A String specifying the type of the image returned to the callback function. Possible values are: "jpeg", "png", "gif" ,"bmp".
<br>
<b>Default:</b><code>"jpeg"</code>
</li><li>
<b><code>imageQuality</code></b><br>
Optional - A Number greater than 0 and less that or equal to 1 specifying the quality of the image returned to the callback function. 
<br>
<b>Default:</b><code>1</code>
</li><li>
<b><code>face</code></b><br>
Optional - A boolean value specifying if pixelarity should return any faces found in the image. This option is only available if you include <code>pixelarity-face.js</code> or <code>pixelarity-face.min.js</code>
<br>
<b>Default:</b><code>false</code>
</li>
</ul>

<h3>Return Values</h3>
Returns <code>true</code> if the image supplied is valid. Returns <code>false</code> if the image supplied is not a valid image.
The return can be used to check if the image supplied is valid and take appropriate actions.

<h3>Example - Without face detection</h3>


<pre>
<code>
$(document).ready(function(){<br>
	$("#file").change(function(e){<br>
		var img = e.target.files[0];<br>
		if(!pixelarity.open(img, false, function(res){<br>
			$("#result").attr("src", res);<br>
		}, "jpg", 0.7)){<br>
			alert("Whoops! That is not an image!");<br>
		}<br>
	});<br>
});<br>

</code>
</pre>

<h3>Example - With face detection</h3>
<b><code>pixelarity-face.js</code> or <code>pixelarity-face.min.js</code> must be included for this to work!</b>
<pre>
<code>
$(document).ready(function(){<br>
	$("#file").change(function(e){<br>
		var img = e.target.files[0];<br>

		if(!pixelarity.open(img, false, function(res, faces){<br>
			$("#result").attr("src", res);<br>
			$(".face").remove();<br>
			// Looping through the faces returned<br>
			for(var i = 0; i < faces.length; i++){<br>
				$("body").append("<div class='face' style='height: "+faces[i].height+"px; width: "+faces[i].width+"px; top: "+($("#result"<br>).offset().top + faces[i].y)+"px; left: "+($("#result").offset().left + faces[i].x)+"px;'>");<br>
			}<br>
		}, "jpg", 0.7, true)){<br>
			alert("Whoops! That is not an image!");<br>
		}<br>
	});<br>
});<br>
</code>

</pre>


</li>
<li>
<h4><code>pixelarity.close()</code></h4>
Closes the image editior without calling the callback supplied to <code>pixelarity.open()</code>. <code>pixelarity.close()</code> is called when the user clicks on the cancel button in the image editor.

<h3>Syntax</h3>
<code>pixelarity.close()</code>

</li>	
<li>
<h4><code>pixelarity.status</code></h4>
Contains a boolean value specifying if the image editor is open or not. If <code>true</code>, the image editor is open, else it is not.
</li>
</ul>