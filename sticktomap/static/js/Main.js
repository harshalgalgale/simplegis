function trackList(id, name, color, map, layerOptions, drawnItems) {
    var d = document.createElement('div');
    d.id = id+'track';
    d.className = 'track';
    d.innerHTML = 'Track, id: ' + id + ', name: ' + name + ', color: ' + color;
    var layer;
    
    var clear = document.createElement('div');
    var csrf = document.createElement('div');
    csrf.innerHTML = '<input type="hidden" name="csrfmiddlewaretoken" value="{{ csrf_token }}">';
    csrf.style.display = 'none';
                
    clear.innerHTML = '<p>Скрыть</p>';

    clear.style.display = 'none';
    
    var del = document.createElement('div');
    del.innerHTML = '<p>Удалить</p>';

    clear.onclick = function () {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }

        clear.style.display = 'none';
    }


    del.onclick = function() {
            
            var xhr = new XMLHttpRequest();
    
            xhr.onload = function (e) {
                if (e.target.status == 200) { 
                    
                    alert('Удален.');
                    document.getElementById('tracks').removeChild(d);
                    document.getElementById('tracks').removeChild(clear);
                    document.getElementById('tracks').removeChild(del);
                    document.getElementById('tracks').removeChild(csrf);
                } else {
                    alert('Во время удаления произошла ошибка ' + e.target.status + ' ' + e.target.statusText);
                }


            }
            xhr.onerror = function() {
                alert("Ошибка " + e.target.status + " произошла во время удаления.");
            }
            xhr.open('POST', 'track_delete');

            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(id);




    }

    d.onclick = function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'track?id='+id, false);
        
        xhr.onreadystatechange = function() {
            console.log(xhr.status);
            if (xhr.status == 200) {
                var content = JSON.parse(xhr.responseText);
                console.log(layerOptions);
                layerOptions.style = {color: '#' + color};
                layer = L.geoJson(content, layerOptions);

                if (layer.getLayers().length === 0) {
                    throw new Error('GeoJSON не содержит подходящих слоев.');
                }

                layer.addTo(map);
                //drawnItems.addLayer(layer);
                

            
            } 
            else {
                alert('Произошла ошибка:' + xhr.status);
            }
        }

        xhr.send(null);

        clear.style.display = 'block';
        
    }
        
    document.getElementById('tracks').appendChild(d);
    document.getElementById('tracks').appendChild(csrf);
    document.getElementById('tracks').appendChild(clear);
    document.getElementById('tracks').appendChild(del);
    
}




var ocm;
var markers = [];
function init() {
    
    customMarker = L.Marker.extend({
        options: {
            id: '',
            name: '',
            description: ''
        }
    });

    L.Marker = customMarker;


    //var lat = ymaps.geolocation.latitude;
    //var lon = ymaps.geolocation.longitude;
    maplink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    ocmlink = '<a href="http://thunderforest.com/">Thunderforest</a>';

    ocm = new L.TileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
        attribution: '&copy; '+maplink+' Contributors & '+ocmlink
    });

    

    var ggl = new L.Google(),
        yndx = new L.Yandex();

    var map = L.map('map', {
        //drawControl: true,
        center: new L.LatLng(55.79083, 49.11450), 
        zoom: 10, 
        zoomAnimation: false,
        layers: [ggl, yndx, ocm] 
    });

    var baseMaps = {
        
        "Yandex": yndx,
        "Google": ggl
    };

    var overlayMaps = {
        "OpenCycleMaps": ocm
    };

    map.attributionControl.setPosition('bottomleft');

    L.control.layers(baseMaps, overlayMaps).addTo(map); 


    

    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer,
            options;

        console.log(layer);

        /////////LOAD SERVER 

        ///////////////////////////////
        $( "#track_popup" ).dialog();
        $( "#track_upload").on('click', function(e) {
            options = {
                color: $("#track_color").val(),
                name: $("#track_name").val(),
                descr: $("#track_descr").val(),
            };
            load_temp();
            //console.log(file);

        });

        var load_temp = function () {
        var json_object = {
                track: layer.toGeoJSON(),
                options: options,
            };
        var xhr = new XMLHttpRequest();

        xhr.onload = function (e) {
            console.log(this);
            if (e.target.status == 200) { 
                var response = JSON.parse(e.target.responseText);   
                //
                alert('Сохранен на сервере.');
            } else {
                alert('Во время загрузки на сервер произошла ошибка ' + e.target.status + ' ' + e.target.statusText);
            }
            trackListAdd(response);
        }
        xhr.onerror = function() {
            alert("Ошибка " + e.target.status + " произошла во время загрузки на сервер.");
        }
        xhr.open('POST', 'track_save');

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        console.log(json_object);
        xhr.send(JSON.stringify(json_object));
            }



        ///////////////////////////////

        if (type === 'marker') {
            console.log('draw');
            console.log(e);
            // Do marker specific actions
            onMapClick(layer, e);
            map.addLayer(layer);
        } else {

        // Do whatever else you need to. (save to db, add to map etc)
        
        drawnItems.addLayer(layer); }
    });

    map.on('draw:created', function (e) {
        console.log(e.layer.toGeoJSON());
    });



    var style_ = {color:'#000000', opacity: 0.3, fillOpacity: 1.0, weight: 3, clickable: false};
    var  layerOptions_ = {style: style,
        pointToLayer: function (data, latlng) {
            return L.circleMarker(latlng, {style: style});
        }
    };
    
    {% for t in tracks %}
    trackList({{t.id}},'{{t.name}}', '{{t.color}}', map, layerOptions_, drawnItems);
    {% endfor %}
    


    
    // Отрисовка переданных из бд меток
    {% for placemark in placemarks %}

    
    var marker = new L.Marker([{{placemark.lat}}, {{placemark.lon}}], {
        id: {{placemark.id}},
        name: '{{placemark.name}}',
        description: '{{placemark.descr}}',
    }).bindLabel('{{placemark.name}}', { noHide: true }).addTo(map);

    {% if placemark.img %} 
    marker.photo = '{{placemark.img.url}}';
    {% else %}
    marker.photo = '';
    {% endif %}

    console.log(marker.photo);
    

    markers[{{placemark.id}}] = marker;


    // Create an element to hold all your text and markup
    // Insert whatever you want into the container, using whichever approach you prefer


    var container = setEditFormPopup(marker);



    // Delegate all event handling for the container itself and its contents to the container
    function setEventHandlingPopup(container){
        container.on('click', '#delete', function (e) {
                $.post("{% url 'placemark_delete' %}", {
                        id: $('input[id="id"]').val()
                    }, function(data){
                            alert("Метка удалена из базы данных.");
                            map.removeLayer(markers[$('input[id="id"]').val()]);
                    }
                )
            });

        container.on('click', '#save', function (e) {
            
            
            if (!$('input[name="name"]').val() || !$('textarea[name="description"]').val()) {
                alert("Поля должны быть заполнены.");
            }
            else {
                    marker.options.name =  $('input[name="name"]').val();
                    marker.options.description = $('textarea[name="description"]').val();                      
                    console.log(marker);
                    var placemarkString = $('input[name="name"]').val() + ' ' + $('textarea[name="description"]').val() + ' ' + $('input[id="id"]').val();

                    $.post("{% url 'placemark_update' %}", {
                        placemarkString: placemarkString
                        }, function(data) {
                            alert("Метка сохранена в базе данных.");
                            markers[$('input[id="id"]').val()].updateLabelContent($('input[name="name"]').val());
                            markers[$('input[id="id"]').val()].closePopup();
                        }
                    );
            }
        });

    }



    container.keydown(function(e) { 
        console.log("fired!");       
        if (e.keyCode == 27) {
              
            markers[$('input[id="id"]').val()].closePopup();
        }
    });

    setEventHandlingPopup(container);

    var popupOptions = {
        'minWidth': '491px',
        'maxWidth': '491px',
    }


    // Insert the container into the popup
    marker.bindPopup(container[0], popupOptions);

    {% endfor %}


    // ajax csrf token handling
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        }
    });

    



    function onMapClick(marker, e) {
        //var marker = new customMarker(e.latlng).addTo(map);
        var container = $('<div />');
        container.html(['<div id="menu">',
                            '<div style="display:none"><input type="hidden" name="csrfmiddlewaretoken" value="{{ csrf_token }}"></div>',
                                '<div id="menu_list">',
                                    '<label>Название</label>',
                                    ' <input type="text" maxlength="100" class="input-xlarge" name="name" required="required" placeholder="Название объекта" /><br />',
                                    '<label>Описание</label>',
                                    '<textarea rows="3" maxlength="500" class="input-xlarge" name="descr" tabindex="2" required="required" placeholder="Описание объекта"></textarea>',
                                '</div>',
                                '<button type="submit" class="btn btn-success">Сохранить</button>',
                            '</div>',
                        '</div>'
                    ].join(' '));

        container.on('click', '#menu button[type="submit"]', function () {
                        var name = $('input[name="name"]').val(),
                            descr= $('textarea[name="descr"]').val();
                        if (!name || !descr) {
                            alert("Поля должны быть заполнены.");
                        }
                        else {                
                            //Добавляем метку на карту          

                            
                            var placemarkString = name + ' ' + descr + ' ' + e.layer._latlng.lat.toPrecision(6) + ' ' + e.layer._latlng.lng.toPrecision(6); 

                            $.post("{% url 'placemark_save' %}", {
                                placemarkString: placemarkString
                                }, function(data){

                                    alert("Метка добавлена в базу данных.");
                                    marker.options.name = name;
                                    marker.options.description = descr;
                                    marker.options.id = data["id"];
                                    marker.photo = '';
                                    markers[data["id"]] = marker;
                                    var container = setEditFormPopup(marker);
                                    setEventHandlingPopup(container);
                                    marker.closePopup();
                                    marker.bindPopup(container[0], popupOptions).updateLabelContent(marker.options.name);

                            });
                        
                             
                        }
                    })
        

        marker.bindPopup(container[0]).bindLabel('Новая метка', { noHide: true });
        console.log(marker);


    }

    map.on('popupopen', function(e) {
        var container = e.popup._content;
        console.log(e.popup._content);
        container.focus();
    });
    


    ocm.setOpacity(0.5);

    var style = {color:'red', opacity: 0.3, fillOpacity: 1.0, weight: 3, clickable: false};
    L.Control.trackLoaderControl({
        fitBounds: true,
        layerOptions: {style: style,
                       pointToLayer: function (data, latlng) {
                          return L.circleMarker(latlng, {style: style});
                       }},
        LABEL: '<i style="" class="icon-folder-open"></i>'
    }).addTo(map);

    L.control.scale({imperial: false}).addTo(map);

    
    var features = [];
    markers.forEach(function (m) {

        var id = m.options.id;
        var name = m.options.name;
        var coords = m.getLatLng();
        var lng = coords.lng;
        var lat = coords.lat;
        
        
        features.push({id: id, value: name, lat: lat, lng: lng});
      
        $("#featurelist table").append('<tr><td><a href="#" onclick="markers['+id+'].openPopup(); return false;">'+name+'</a></td></tr>');
        
    });

    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;
         
            // массив названий с совпадающими подстроками
            matches = [];
         
            // регулярное выражение, соответствующее вхождению подстроки
            substrRegex = new RegExp(q, 'i');
         
            // проход по массиву меток и поиск вхождений
            $.each(strs, function(i, str) {
                
                if (substrRegex.test(str.value)) {
                    // добавляем строки для автозаполнения
                    matches.push({ value: str.value });
              }
            });
         
            cb(matches);
        };
    };

    

 
    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'features',
        displayKey: 'value',
        source:  substringMatcher(features)
    }).bind('typeahead:selected', function(obj, datum, name) {      
        map.setView([datum.lat, datum.lng], 18);
        markers[datum.id].openPopup();   

    });

  
    

    
        
    
}

function updateOpacity(value) {
    ocm.setOpacity(value);
}