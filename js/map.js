        // - Create an on load ArcGIS basemap - //
    var map = L.map('map', {
        center: [62.45,17.45],
        zoom: 5,
        minZoom: 2,
        maxZoom: 21
    }),
    baseImagery = L.layerGroup();
    L.esri.basemapLayer('ImageryClarity').addTo(map);


// L.geoJSON(weatherStations).addTo(map)


                    // - SCALE - //

    // - https://www.tutorialspoint.com/leafletjs/leafletjs_quick_guide.htm - //
    var scaleLayer = new L.TileLayer('Maps');
    //map.addLayer(scaleLayer); // Adding layer to the map
    var scale = L.control.scale(); // Creating scale control
    scale.addTo(map); // Adding scale control to the map
         




                    // - ICONS - //
                    
        // - Icons for each feature in control layer - //
    function iconByName(name) {
        return '<i class="icon icon-'+name+'"></i>';
    }
        // - Marker icons on map - //       
    function featureToMarker(feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                className: 'marker-'+feature.properties.amenity,
                html: iconByName(feature.properties.geometry),
                iconUrl: '../images/markers/flag.png',
                iconSize: [32, 46],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        });
    }
    function onEachFeature(feature, layer) {
	var popup = "<p><b> "+feature.properties.name + "</b><br/>" + "Wind Direction: " + feature.properties.windDirection + "</p>";
        if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}
	    layer.bindPopup(popup);
    }
    
/*
                    // - WEATHER STATIONS - //
    var clusterStations = new L.markerClusterGroup();
    var weatherStations = L.geoJson(weatherStations, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng)
            .bindPopup("<p><b> "+ feature.properties.namn + "</b><br/>" + "Aktiv: " + feature.properties.aktiv + "</p>");
        }
    });
    clusterStations.addLayer(weatherStations);
    //map.addLayer(clusterStations);
*/

        // - Controlbox basemap layers - //
    var basemapLayers = [
        {
            group: "<b>MAPS</b>",
            collapsed: true,
            layers: [
                {
                    name: "Hybrid",
                    background: 'images/icons/globe.png',
                    layer: L.esri.basemapLayer("ImageryClarity")
                },
                {
                    name: "Topographic",
                    background: 'images/icons/globe.png',
                    layer: L.esri.basemapLayer("Topographic")
                },
                {
                    name: "Streets",
                    background: 'images/icons/globe.png',
                    layer: L.esri.basemapLayer("Streets")
                }
            ]
        }
    ];

        // - Controlbox overlayers - //
    var overLays = [
	    {
            group: "<b>SEARCH ENGINE</b>",
            layers:[
                {
                    name: "Kitespots",
                    //background: ('flag'),
                    layer: L.geoJson(kitespots, {pointToLayer: featureToMarker, onEachFeature})
                },
                
            ]
        },
        	    {
            group: "<b>SPOTS GROUPS</b>",
            layers:[
                {
                    name: "All Kitespots",
                    //background: ('flag'),
                    layer: L.geoJson(kitespots, {pointToLayer: featureToMarker, onEachFeature})
                },
                {
                    name: "Kitespots S",
                    //id: kitespotsS,
                    background: ('flag'),
                    layer: L.geoJson(kitespots, {pointToLayer: featureToMarker, onEachFeature})
                },
                {
                    name: "Kitespots W",
                    //id: kitespotsW,
                    background: ('flag'),
                    layer: L.geoJson(kitespots, {pointToLayer: featureToMarker, onEachFeature})
                },
                {
                    name: "Kitespots N",
                    //id: kitespotsN,
                    background: ('flag'),
                    layer: L.geoJson(kitespots, {pointToLayer: featureToMarker, onEachFeature})

                },
                {
                    name: "Kitespots E",
                    //id: kitespotsE,
                    background: ('flag'),
                    layer: L.geoJson(kitespots, {pointToLayer: featureToMarker, onEachFeature})
                },
                
            ]
        },
        {
        // - Controlbox Weather layer - //
            group: "<b>WEATHER</b>",
            layers: [
               /* {
                    name: "Landskap",
                    background: iconByName('flag'),
                    layer: L.tileLayer('https://public.opendatasoft.com/api/records/1.0/search/?dataset=sverige-lan-counties-of-sweden&q=')	
                },*/
                {
                    name: "Stations",
                    background: iconByName('flag'),
                    layer: L.geoJSON(weatherStations, onEachFeature)
                },
            ]
        }
    ];                
     
        // - Add it all to the map - //
    var panelLayers = new L.Control.PanelLayers(basemapLayers, overLays, clusterSpots, {
        collapsibleGroups: true,
        collapsed: false
    });
                            // - SEARCH ENGINE - //

    var clusterSpots = L.markerClusterGroup();
        // - Variable for search source(kitespots) - //
    var searchSpots = L.geoJson(kitespots, {
        onEachFeature: function(feature, layer) {
            var popup = '';
            if (feature.properties.name) {
                popup += "<p><b> "+feature.properties.name + "</b><br/>" 
                + "Wind Direction: " + feature.properties.windDirection 
                + "</p>" + "<a><b></b>GET HERE</b></a>"; //link;
            }
            layer.bindPopup(popup);
        }
    });
        // - Create search engine and place it on the map - //
    var selector = L.control({
        position: 'topright',
        opacity: 0.8,
        size: 10
    });
    selector.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'list-group-item');
        div.innerHTML = '<select id = "selectSpot"><option value = "init">KITESPOTS</option></select>';
        return div;
    };
    selector.addTo(map);
        // - Function to browse and choose spots - //
    searchSpots.eachLayer(function(layer) {
        var spotChoice = document.createElement("option");
        spotChoice.innerHTML = layer.feature.properties.name;
        spotChoice.value = layer._leaflet_id;
        L.DomUtil.get("selectSpot").appendChild(spotChoice);
    });
        // - The selectSpot variable for the DomEvent listener. - //
    var selectSpot = L.DomUtil.get("selectSpot");

        // - Select kitespot on click - //
    L.DomEvent.addListener(selectSpot, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
    });
        // - ChangeHandler zooms in on choosen spot with popup. - //
    L.DomEvent.addListener(selectSpot, 'change', changeHandler);
    function changeHandler(e) {
        var selected = searchSpots.getLayer(e.target.value);
            clusterSpots.zoomToShowLayer(selected, function() {
                selected;
                //enable.allspotsCluster();
            })
        }
    clusterSpots.addLayer(searchSpots);
    map.addLayer(clusterSpots);


        // - Features and Functions  - //       
    map.addControl(panelLayers);
