var TrackLoader = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        layerOptions: {},
        fileSizeLimit: 1024
    },

    initialize: function (map, options) {
        this._map = map;
        L.Util.setOptions(this, options);

        this._parsers = {
            'geojson': this._loadGeoJSON,
            'gpx': this._convertToGeoJSON,
            'kml': this._convertToGeoJSON
        };
    },

    load_locally: function (file) {
        // Check file size
        var fileSize = (file.size / 1024).toFixed(4);
        if (fileSize > this.options.fileSizeLimit) {
            this.fire('data:error', {
                error: new Error('Файл превысил лимит (' + fileSize + ' > ' + this.options.fileSizeLimit + 'кб)')
            });
            return;
        }

        // Check file extension
        var ext = file.name.split('.').pop(),
            parser = this._parsers[ext];
        if (!parser) {
            this.fire('data:error', {
                error: new Error('Неподдерживаемый формат файла ' + file.type + '(' + ext + ')')
            });
            return;
        }
        // Read selected file using HTML5 File API
        var reader = new FileReader();
        reader.onload = L.Util.bind(function (e) {
            try {
                this.fire('data:loading', {filename: file.name, format: ext});
                var layer = parser.call(this, e.target.result, ext);
                console.log(e.target.result);
                
                this.fire('data:loaded', {layer: layer, filename: file.name, format: ext});
            }
            catch (err) {
                this.fire('data:error', {error: err});
            }

        }, this);
        reader.readAsText(file);
        return reader;
    },

    load_server: function (file, options, map) {
        console.log(options);
        // Check file size
        var fileSize = (file.size / 1024).toFixed(4);
        if (fileSize > this.options.fileSizeLimit) {
            this.fire('data:error', {
                error: new Error('Файл превысил лимит (' + fileSize + ' > ' + this.options.fileSizeLimit + 'кб)')
            });
            return;
        }

        // Check file extension
        var ext = file.name.split('.').pop(),
            parser = this._parsers[ext];
        if (!parser) {
            this.fire('data:error', {
                error: new Error('Неподдерживаемый формат файла ' + file.type + '(' + ext + ')')
            });
            return;
        }
        // Read selected file using HTML5 File API
        var reader = new FileReader();
        reader.onload = L.Util.bind(function (e) {
            try {
                this.fire('data:loading', {filename: file.name, format: ext});
                var track = parser.call(this, e.target.result, ext);
                var json_object = {
                    track: track,
                    options: options,
                };
                console.log(json_object);
                var layer = this._loadGeoJSON(track, options);
                console.log(track);
                //console.log(JSON.stringify(track));
                var xhr = new XMLHttpRequest();
        
                xhr.onload = function (e) {
                    if (e.target.status == 200) { 
                        var response = JSON.parse(e.target.responseText);   
                        //
                        alert('Сохранен на сервере.');
                    } else {
                        alert('Во время загрузки на сервер произошла ошибка ' + e.target.status + ' ' + e.target.statusText);
                    }
                    /*var style_ = {color:'#000000', opacity: 0.3, fillOpacity: 1.0, weight: 3, clickable: false};
                    var  layerOptions_ = {style: style_,
                        pointToLayer: function (data, latlng) {
                            return L.circleMarker(latlng, {style: style});
                        }
                    };*/

                    trackListAdd(response);
                }
                xhr.onerror = function() {
                    alert("Ошибка " + e.target.status + " произошла во время загрузки на сервер.");
                }
                xhr.open('POST', 'track_save');

                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.send(JSON.stringify(json_object));





                
                this.fire('data:loaded', {layer: layer, filename: file.name, format: ext});
            }
            catch (err) {
                this.fire('data:error', {error: err});
            }

        }, this);
        reader.readAsText(file);
        return reader;

        
        

    },

    _loadGeoJSON: function (content, options) {
        if (typeof content == 'string') {
            content = JSON.parse(content);  
        }
        this.options.layerOptions = {
            style: {
                color: '#'+options.color,
            }
        };

        console.log(this.options.layerOptions);

        var layer = L.geoJson(content, this.options.layerOptions);

        if (layer.getLayers().length === 0) {
            throw new Error('GeoJSON не содержит подходящих слоев.');
        }

        if (this.options.addToMap) {
            layer.addTo(this._map);
        }
        layer.bindLabel(options.name, { noHide: true });
        return layer;
    },

    _convertToGeoJSON: function (content, format) {
        // Format is either 'gpx' or 'kml'
        if (typeof content == 'string') {
            content = ( new window.DOMParser() ).parseFromString(content, "text/xml");
        }
        var geojson = toGeoJSON[format](content);
        //console.log(JSON.stringify(geojson));
        return geojson;
    }
});


L.Control.TrackLoader = L.Control.extend({
    statics: {
        TITLE: 'Загрузите локальный файл с компьютера (GPX, KML, GeoJSON)',
    },
    options: {
        position: 'topleft',
        fitBounds: true,
        layerOptions: {},
        addToMap: true,
        fileSizeLimit: 1024,
        LABEL: ''
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.loader = null;
    },

    onAdd: function (map) {
        this.loader = new TrackLoader(map, this.options);

        this.loader.on('data:loaded', function (e) {
            // Fit bounds after loading
            if (this.options.fitBounds) {
                window.setTimeout(function () {
                    map.fitBounds(e.layer.getBounds());
                }, 500);
            }
        }, this);

        // Initialize Drag-and-drop
        this._initDragAndDrop(map);

        // Initialize map control
        return this._initContainer();
    },

    _initDragAndDrop: function (map) {

        var fileLoader = this.loader,
            dropbox = map._container;

        var callbacks = {
            dragenter: function () {
                map.scrollWheelZoom.disable();
            },
            dragleave: function () {
                map.scrollWheelZoom.enable();
            },
            dragover: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            drop: function (e) {
                e.stopPropagation();
                e.preventDefault();

                var files = Array.prototype.slice.apply(e.dataTransfer.files),
                    i = files.length;
                setTimeout(function(){
                    var file = files.shift();
                    dialog(file);


                  
                    


                    document.getElementById('track_upload').addEventListener("click", function (e) {
                        var options = {
                            color: document.getElementById('track_color').value,
                            name: document.getElementById('track_name').value,
                            descr: document.getElementById('track_descr').value,
                        };
                    
                        fileLoader.load_server(file, options, map);
                        document.body.removeChild(document.getElementById("dimmer"));   
                        track_popup.style.visibility = 'hidden';
                    }, false);



                    
                    if (files.length > 0) {
                        setTimeout(arguments.callee, 25);
                    }
                }, 25);
                map.scrollWheelZoom.enable();
            }
        };
        for (var name in callbacks)
            dropbox.addEventListener(name, callbacks[name], false);
    },

    _initContainer: function () {
        // Create a button, and bind click on hidden file input
        var container = L.DomUtil.create('button', 'btn');
        var link = L.DomUtil.create('a', 'filebtn', container);
        link.href = '#';
        link.innerHTML = this.options.LABEL;
        link.title = L.Control.TrackLoader.TITLE;

        // Create an invisible file input
        var fileInput = L.DomUtil.create('input', 'hidden', container);
        fileInput.type = 'file';
        fileInput.accept = '.gpx,.kml,.geojson';
        fileInput.style.display = 'none';
        // Load on file change
        var fileLoader = this.loader;
        fileInput.addEventListener("change", function (e) {
            var file = this.files[0];
            dialog(file);
            
            document.getElementById('track_upload').addEventListener("click", function (e) {
                var options = {
                    color: document.getElementById('track_color').value,
                    name: document.getElementById('track_name').value,
                    descr: document.getElementById('track_descr').value,
                };
            
                fileLoader.load_server(file, options);
                // reset so that the user can upload the same file again if they want to
                console.log(this.value);
                this.value = '';
                console.log(this.value);
                document.body.removeChild(document.getElementById("dimmer"));   
                track_popup.style.visibility = 'hidden';
            }, false);



        }, false);

        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', function (e) {
            fileInput.click();
            e.preventDefault();
        });
        return container;
    }
});

L.Control.trackLoaderControl = function (options) {
    return new L.Control.TrackLoader(options);
};



function trackListAdd(response) {
    var d = document.createElement('div');
    d.id = response['id']+'track';
    d.className = 'track';
    d.innerHTML = 'Track, id: ' + response['id'] + ', name: ' + response['name'];
    document.getElementById('tracks').appendChild(d);
    

}

function trackListRemove(track) {
    var d = document.getElementById(track['id'+'track']);
    document.getElementById('tracks').removeChild();
}


function gpxDisplay(url, name, map) {
    var track = new L.GPX(url, {
        style: style,
        pointToLayer: function (data, latlng) {
            return L.circleMarker(latlng, {
                style: style
            });
    }}).on("loaded", function(e) { 
        map.fitBounds(e.target.getBounds());
    });
    map.addLayer(track);
    map.addControl(new L.Control.Layers({}, {'Track':track}));
}



function dialog(file) {
    
    var track_popup = document.getElementById("track_popup"),
        dimmer = document.createElement("div");
    
    dimmer.style.width =  window.innerWidth + 'px';
    dimmer.style.height = window.innerHeight + 'px';
    dimmer.id = 'dimmer';
    console.log(this);
    dimmer.onclick = function(){
        document.body.removeChild(this);   
        track_popup.style.visibility = 'hidden';
        console.log(file);
        file = null;
        console.log(file);
    }
        
    document.body.appendChild(dimmer);
    
    track_popup.style.visibility = 'visible';
    track_popup.style.top = window.innerHeight/2 - 50 + 'px';
    track_popup.style.left = window.innerWidth/2 - 100 + 'px';

    return false;
}  