// common variables

var iMaxFilesize = 1048576; // 1MB
var sResultFileSize = '';

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

 


 

function fileSelected() {
    document.getElementById('fileinfo').style.display = 'block';
    document.getElementById('preview').style.display = 'block';

    // hide different warnings
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';

    document.getElementById("upload").disabled = false; 
    document.getElementById("clear").disabled = false; 

    // get selected file element
    var oFile = document.getElementById('file').files[0];

 

    // filter for image files
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    if (! rFilter.test(oFile.type)) {
        document.getElementById('error').style.display = 'block';
        document.getElementById("upload").disabled = false; 
        return;
    }

 

    // little test for filesize
    if (oFile.size > iMaxFilesize) {
        document.getElementById('warnsize').style.display = 'block';
        document.getElementById("upload").disabled = false;
        return;
    }

    // get preview element
    var oImage = document.getElementById('preview');

 

    // prepare HTML5 FileReader
    var oReader = new FileReader();
    oReader.onload = function(e){

        // e.target.result contains the DataURL which we will use as a source of the image
        oImage.src = e.target.result;
        oImage.onload = function () { // binding onload event
            // we are going to display some custom image information here
            sResultFileSize = bytesToSize(oFile.size);
            document.getElementById('fileinfo').style.display = 'block';
            document.getElementById('filename').innerHTML = 'Имя файла: ' + oFile.name;
            document.getElementById('filesize').innerHTML = 'Размер: ' + sResultFileSize;
            document.getElementById('filetype').innerHTML = 'Тип: ' + oFile.type;
            document.getElementById('filedim').innerHTML = 'Разрешение: ' + oImage.naturalWidth + ' x ' + oImage.naturalHeight;
        };

    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);

}

 

function startUploading() {

    // cleanup all temp states
    
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    

    // get form data for POSTing
    //var vFD = document.getElementById('upload_form').getFormData(); // for FF3

    var fd = new FormData(document.getElementById('upload_form'));
    // create XMLHttpRequest object, adding few event listeners, and POSTing our data
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', uploadFinish, false);
    xhr.addEventListener('error', uploadError, false);
    xhr.addEventListener('abort', uploadAbort, false);
    xhr.open('POST', 'placemark_img_upload');
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(fd);

    
}

function selectFile() {
    document.getElementById('file').click();
}



function clearUpload() {

    // cleanup all temp states
    
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    
    // cleanup file info and disable buttons

    document.getElementById('fileinfo').style.display = 'none';
    document.getElementById('preview').style.display = 'none';
    document.getElementById("upload").disabled = true; 
    document.getElementById("clear").disabled = true; 

    
}
 


 


 

function uploadFinish(e) { 
    // upload successfully finished
    var oUploadResponse = document.getElementById('upload_response');
    oUploadResponse.style.display = 'block';
    console.log(e.target);
    if (e.target.status == 200) { 
        var response = JSON.parse(e.target.responseText);   
        oUploadResponse.innerHTML = 'Изображение успешно загружено';   
        document.getElementById('photo_block').innerHTML = '<img id="photo" src="'+response.img_url+'">';    
    } else {
        oUploadResponse.innerHTML = 'Произошла ошибка: ' + e.target.status + ' ' + e.target.statusText;
    }


    
    
    
    
    
    

}

 

function uploadError(e) { 
    // upload error
    document.getElementById('error2').style.display = 'block';

} 

 

function uploadAbort(e) { 
    // upload abort
    document.getElementById('abort').style.display = 'block';
}




