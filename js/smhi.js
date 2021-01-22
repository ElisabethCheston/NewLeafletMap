/*
 This is a demo application. It uses jQuery.
 Use it on your on risk. No warranties are made.
 It is intended as a working example on how to use the API.
 */
/*
 Declaration of smhi and functions for retrieval of data in json format
 */
(function (smhi, $, undefined) {

  /*
     The API end point. This is the only hardcoded url.
     All other urls are returned in responses.
   */
  smhi.endPoint = "http://tove-api-tst.smhi.se/backend-warning-service";
  smhi.map = null;
  smhi.districtViews = null;
  smhi.warningViews = null;
  smhi.activArea = [];

  /*
     Get warning
   */
  smhi.getWarningViews = function (callback) {

    //var endPoint = smhi.endPoint + '/warning/';
    var endPoint = 'res/demo.json';
    $.getJSON(endPoint).done(function (warningViews) {
      smhi.warningViews = warningViews;
      callback(warningViews);
    });
  };
  
  /*
     Get district views
   */
  smhi.getDistrictViews = function (callback) {

    //var endPoint = smhi.endPoint + '/metadata/area/';
    var endPoint = 'res/district.json';
    $.getJSON(endPoint).done(function (districtViews) {
      smhi.districtViews = districtViews;
      callback(districtViews);
    });
  };
 
}(window.smhi = window.smhi || {}, jQuery));


$(document).ready(function () {

  // create leaflet map and disable interaction
  var southWest = L.latLng(52.500440,2.250475);
  var northEast = L.latLng(70.742227,37.934697);
  bounds = L.latLngBounds(southWest, northEast);

  smhi.map = L.map('map', {
    crs: L.CRS.EPSG900913, 
    zoomControl: true,
    minZoom: 5,
    maxZoom: 9,
    maxBounds: bounds
  }).setView([63, 17], 4);

  L.control.mousePosition().addTo(smhi.map);
  // the map layer
  var background = L.tileLayer.wms("https://opendata-view.smhi.se/wms", {
    layers: 'opendata_default_map_2',
    format: 'image/png',
    transparent: false,
    bgcolor: '#B2D0FD',
    attribution: "copyright 2014 SMHI"
  });
  smhi.map.addLayer(background);
 
  // Get the warnings
  smhi.getWarningViews(function (warning) {  
    getDistrictViews();
    getWarningViews();
  });

  return false;
});

function getWarningViews() {
  // Get the warnings views
  
  smhi.getWarningViews(function (WarningViews) {
    jQuery.each(WarningViews, function(index, warning) {     
        jQuery.each(warning.warningAreas, function(index, warningArea) {

            bakgroundColor = getBackgroundColor(warningArea.warningLevel.code)
            
            polygon = L.geoJSON(warningArea.area, {color: "#000000", weight: 2, opacity: 1, fillOpacity: 0.8, fillColor: bakgroundColor})
           
            
            
            polygon.warningLevel = warningArea.warningLevel;
            polygon.approximateStart = warningArea.approximateStart;
            polygon.approximateEnd = warningArea.approximateEnd;
            polygon.eventDescription = warningArea.eventDescription;
            
            jQuery.each(warningArea.descriptions, function(index, descriptions) {
                if (descriptions.text.en != "" && descriptions.text.en != null) {    
                    if (descriptions.title.code == 'HAPPENDS'){
                        polygon.subWarningsHAPPENDS = descriptions
                    }
                    else if (descriptions.title.code == 'AFFECT'){
                        polygon.subWarningsAFFECT = descriptions
                    }
                    else if (descriptions.title.code == 'WHERE'){
                        polygon.subWarningsWHERE = descriptions
                    }
                    else if (descriptions.title.code == 'INCIDENT'){
                        polygon.subWarningsINCIDENT = descriptions
                    }
                    else if (descriptions.title.code == 'COMMENTS'){
                        polygon.subWarningsCOMMENTS = descriptions
                    }       
                }
            });
        
 
            polygon.affectedAreas = warningArea.affectedAreas;
            polygon.areaName = warningArea.areaName;
            
            polygon.on("click", highlightDistrict);              
            polygon.addTo(smhi.map);
        })   
    });
  });
}

function getDistrictViews() {
  // Get the district views 
  smhi.getDistrictViews(function (NewDistrictViews) {
    jQuery.each(NewDistrictViews, function(index, district) {
        if (district.area.properties.Distrikt) {
            // sea districts
            L.geoJSON(district.area, {color: "#526EF9", weight: 0.5, opacity: 1, fillOpacity: 0.5, fillColor: '#74BCED'}).addTo(smhi.map).bringToBack();
        } else {
            // counties 
            L.geoJSON(district.area, {color: "#647078", weight: 0.5, opacity: 1, fillOpacity: 0, fillColor: '#EBEEF0'}).addTo(smhi.map).bringToBack();
        }
    })   
  });
}

function highlightDistrict(e) {
    if (smhi.activArea.length > 0) {
        smhi.activArea[0].target.setStyle({
            color: "#000000",
            fillOpacity: 0.8,
            weight: 2
        });
    }
    smhi.activArea = []
    var affectedAreasContent = "<h3>" + e.target.warningLevel.en + ' - ' + e.target.eventDescription.en + "</h3>"
    affectedAreasContent += "<h4>";
    if (e.target.areaName && e.target.areaName.en != null && e.target.areaName.en != '') {
        affectedAreasContent += e.target.areaName.en
        affectedAreasContent += "</h4>";
        $("#district-selected").html(affectedAreasContent);
    }
    else {
        jQuery.each(e.target.affectedAreas, function(index, affectedAreas) {
                if (index != 0) {
                    affectedAreasContent += ', '
                }
                affectedAreasContent += affectedAreas.en
            })
        affectedAreasContent += "</h4>";
        $("#district-selected").html(affectedAreasContent);
    }
  
  if (e.target.warningLevel.code.length > 0) {
    var warningsContent = "<p>";
      if (e.target.subWarningsHAPPENDS) {
        warningsContent += "<p>" + e.target.subWarningsHAPPENDS.text.en + "</p>"
        warningsContent += ("<br>");
      }
      if (e.target.subWarningsAFFECT) {
        warningsContent += "<h4>" + e.target.subWarningsAFFECT.title.en + "</h4>"
        warningsContent += "<p>" + e.target.subWarningsAFFECT.text.en + "</p>"
        warningsContent += ("<br>");
      }
      warningsContent += ("<h4>When</h4>");
      warningsContent += ("<h5>Approximate start</h5>");
      warningsContent += ("<p>" + e.target.approximateStart + "</p>");
      if (e.target.approximateEnd) {
        warningsContent += ("<h5>Approximate end</h5>");
        warningsContent += ("<p>" + e.target.approximateEnd + "</p>");
      }
      warningsContent += ("<br>");
      if (e.target.subWarningsWHERE) {
        warningsContent += "<h4>" + e.target.subWarningsWHERE.title.en + "</h4>"
        warningsContent += "<p>" + e.target.subWarningsWHERE.text.en + "</p>"
        warningsContent += ("<br>");
      }
      if (e.target.subWarningsINCIDENT) {
        warningsContent += "<h4>" + e.target.subWarningsINCIDENT.title.en + "</h4>"
        warningsContent += "<p>" + e.target.subWarningsINCIDENT.text.en + "</p>"
        warningsContent += ("<br>");
      }
      if (e.target.subWarningsCOMMENTS) {
        warningsContent += "<h4>" + e.target.subWarningsCOMMENTS.title.en + "</h4>"
        warningsContent += "<p>" + e.target.subWarningsCOMMENTS.text.en + "</p>"
        warningsContent += ("<br>");
      }
 
      warningsContent += "</p>";
      $("#active-warnings").html(warningsContent);
  }

  e.target.setStyle({
    color: "#3B9CDF",
    fillOpacity: 1,
    weight: 3
  });
  smhi.activArea.push(e)
}

function getBackgroundColor(code) {
    if (code == "RED") {
        bakgroundColor = "#D61720"
    } else if (code == "ORANGE") {
        bakgroundColor = "#EB7500"
    } else if (code == "YELLOW") {
        bakgroundColor = "#FDEB1B"
    } else if (code == "MESSAGE") {
        bakgroundColor = "#1EA8A1"
    }
    return bakgroundColor
}