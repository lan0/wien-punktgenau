/**
 * The map is built upon http://openlayers.org/dev/examples/mobile-wmts-vienna.html
 */

var map, selectControl, layers;

/*
 * Indices of the active layers.
 */
var activeLayers = Array();

var fetchAll = false;

$(document).ready(function() {
    
    buildIndexOf(); // build Array.indexOf for < IE9

    $('#dialog_help').jqm({trigger: '#help'});
    $('#dialog_imprint').jqm({trigger: '#imprint'});

    OpenLayers.Lang.setCode('de');

    // load settings
    var params = OpenLayers.Util.getParameters("?"+window.location.hash.substr(1));
    if(params.mode != null) mode = params.mode;
    if(params.active != null) {
        if(typeof(params.active) == "string") activeLayers = Array(params.active);
        else activeLayers = params.active;
    }
    
    if($.cookie("max_features") != null) max_features = $.cookie("max_features");
    $('input:radio[name="mode"]').filter('[value="'+mode+'"]').attr('checked', true);
    $("#max").val(max_features);
    
    // set handler for change of max features
    $("#setmax").click(toggleMax);
    
    // set handler for showing all available layers
    $("#showall").click(function() {
        if(fetchAll) {
            $("#showall").html('<img border="0" src="img/loading.gif" />');
            data = standardData;
            removeAllLayers();
            activeLayers = Array();
            layers = Array();
            setupLayers();
            $("#showall").text("alle verfügbaren anzeigen");
            fetchAll = false;
        } else {
            activeLayers = Array();
            fetchAll = true
            showAll();
        }
        
    });
    
    if(params.all == null || params.all != "true") {
        fetchAll = false;
        data = standardData;
        initMap();
        setupLayers();
    } else {
        fetchAll = true;
        showAll(true);
    }
    
    // on change of mode
    $("input:radio[name=mode]").click(function() {
        mode = $(this).val();
        if(mode == "wms") {
            $("li.max").fadeOut(500);
        } else if(mode == "kml") {
            $("li.max").fadeIn(500);
        }
        setupLayers();
        updateAnchor();
    });

});

function initMap() {
    // sort alphabetically (from http://www.javascriptkit.com/javatutors/arraysort2.shtml)
    data.sort(function(a, b) {
        var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1 
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    });
    
    var layerSwitcher = new OpenLayers.Control.LayerSwitcher({
        div: OpenLayers.Util.getElement('layerswitcher'),
        title: OpenLayers.i18n('Base Layer')
    });
    
    // build map
    map = new OpenLayers.Map({
        div: "map",
        projection: "EPSG:3857",
        units: "m",
        maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
        maxResolution: 156543.0339,
        numZoomLevels: 20,
        controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoomBar(),
            layerSwitcher,
            new OpenLayers.Control.KeyboardDefaults(),
            new OpenLayers.Control.Attribution()
        ],
        eventListeners: {
            moveend: updateAnchor
        }
    });

    // Defaults for the WMTS layers
    var defaults = {
        requestEncoding: "REST",
        matrixSet: "google3857",
        attribution: 'Datenquelle: Stadt Wien - <a href="http://data.wien.gv.at">data.wien.gv.at</a>'
    };

    // The WMTS layers we're going to add
    var fmzk, aerial, labels, flaeche;
    var extent = new OpenLayers.Bounds(1799448.394855, 6124949.74777, 1848250.442089, 6162571.828177);
        defaults.tileFullExtent = extent;
        fmzk = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({
            url: "http://maps.wien.gv.at/wmts/fmzk/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            layer: "fmzk",
            style: "pastell",
            transitionEffect: "resize",
            name: "Karte"
        },
    defaults));
    aerial = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({
            url: "http://maps.wien.gv.at/wmts/lb/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            layer: "lb",
            style: "farbe",
            transitionEffect: "resize",
            name: "Satellit"
        },
    defaults));
    labels = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({
            url: "http://maps.wien.gv.at/wmts/beschriftung/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
            layer: "beschriftung",
            style: "normal",
            transitionEffect: null,
            isBaseLayer: false,
            className: "nofade",
            name: "Beschriftung"
        },
    defaults));
    flaeche = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({
            url: "http://maps.wien.gv.at/wmts/flwbplmzk/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            layer: "flwbplmzk",
            style: "rot",
            transitionEffect: "resize",
            name: "Flächenwidmung"
        },
    defaults));
    
    // array where the layers get stored
    layers = Array(data.length);
    
    // add the base layers
    map.addLayers([fmzk, aerial, labels, flaeche]);
    
    map.setBaseLayer(fmzk);
    
    zoomToInitialExtent();
}

/*
 * Sets up all overlays.
 */
function setupLayers() {
    
    // iterate over all the overlays configured in config.js
    for(var i = 0; i < data.length; i++) {
        
        // if there is a selectControl set from previous vector layers and wms should be displayed, remove the control
        if(mode == "wms" && selectControl != undefined) {
            selectControl.deactivate();
            map.removeControl(selectControl);
        }
        
        var visible = false; // visibility of current layer
        
        // if the layer is on the map, the new layer should have the same visibility
        var layer_on_map = map.getLayerIndex(layers[i]);
        if(layer_on_map != -1) {
            visible = layers[i].visibility;
            layers[i].destroy();
        }
        
        // if the layer is active (from permalinks) also set it visible
        if(activeLayers.indexOf(i+"") != -1) {
            visible = true;
        }
        
        var layer; // current layer

        var name = data[i].name;

        // build string representation of layers if more than one should get loaded
        var first = true;
        var layers_string = "";
        for( var k = 0; k < data[i].layers.length; k++) {
            if(!first) layers_string += ",";
            else first = false;
            layers_string += "ogdwien:" + data[i].layers[k];
        }

        // kml layer
        if(mode == "kml") {
            layer = new OpenLayers.Layer.Vector(name, {
                strategies: [new OpenLayers.Strategy.BBOX({
                    ratio: 1, 
                    resFactor: 1
                })],
                projection: new OpenLayers.Projection("EPSG:4326"),
                protocol: new OpenLayers.Protocol.HTTP({
                    // use wms 1.1.0 because in 1.3.0 the bbox values got flipped, it's LatLon in 1.3.0 whereas in 1.1.0 it's LonLat
                    url: "proxy.cgi?url=" + escape("http://data.wien.gv.at/daten/geo?version=1.1.0&width=1&height=1&service=WMS&request=GetMap&crs=EPSG:4326&maxFeatures=" + max_features + "&layers=" + layers_string + "&styles=&format=application/vnd.google-earth.kml") + "%2Bxml",
                    format: new OpenLayers.Format.KML({
                        extractStyles: true, 
                        extractAttributes: true,
                        maxDepth: 5
                    })
                }),
                visibility: visible,
                eventListeners: {
                    visibilitychanged: setActiveLayers,
                    featureselected: onFeatureSelect,
                    featureunselected: onFeatureUnSelect
                },
                labels: data[i].labels,
                layers: data[i].layers
            });
        
        // wms layer
        } else if(mode == "wms") {
            layer = new OpenLayers.Layer.WMS(
                name,
                "http://data.wien.gv.at/daten/geo",
                {
                    layers: layers_string,
                    transparent: true
                },
                {
                    visibility: visible,
                    isBaseLayer: false,
                    labels: data[i].labels,
                    layers: data[i].layers
                }
                );
        }
        
        // set layer in the layer list & redraw it
        layers[i] = layer;
        layers[i].redraw();
        
    }
    
    // add layer to the map
    map.addLayers(layers);
    
    // add selection control if the mode is not wms
    if(mode != "wms") {
        selectControl = new OpenLayers.Control.SelectFeature(layers);
        map.addControl(selectControl);
        selectControl.activate();
    }
    
    setActiveLayers();
}

function removeAllLayers() {
    if(layers == undefined) return;
    for( var i = 0; i < layers.length; i++) {
        layers[i].setVisibility(false);
        map.removeLayer(layers[i]);
    }
}

/*
 * zoom to initial extent or restore position from permalink
 */
function zoomToInitialExtent() {
    var extent = map.baseLayer.tileFullExtent,
    ctr = extent.getCenterLonLat(),
    zoom = map.getZoomForExtent(extent, true),
    params = OpenLayers.Util.getParameters("?"+window.location.hash.substr(1));
    OpenLayers.Util.applyDefaults(params, {
        x:ctr.lon, 
        y:ctr.lat, 
        z:zoom
    });
    map.setCenter(new OpenLayers.LonLat(params.x, params.y), params.z);
}

/*
 * update anchor for permalinks
 */
function updateAnchor() {
    var ctr = map.getCenter();
    if(ctr != undefined)
        window.location.hash = "x="+ctr.lon+"&y="+ctr.lat+"&z="+map.getZoom()+"&all="+fetchAll+"&mode="+mode+"&active="+activeLayers;
}

/*
 * Update the max amount of features loaded.
 */
function toggleMax(e) {
    max_features = $("#max").val();
    setupLayers();
    $.cookie("max_features", max_features, {
        expires: 365
    });
}

/*
 * Fills the activeLayers variable with the indicies of all visible layers.
 */
function setActiveLayers() {
    activeLayers = Array();
    for(var i = 0; i < layers.length; i++) {
        if(layers[i].visibility) {
            activeLayers.push(""+i);
        }
    }
    updateAnchor();
}

/*
 * Gets called when a feature gets selected and opens a popup.
 */
function onFeatureSelect(evt) {    
    var feature = evt.feature;
    var dom = $(feature.attributes.description); // build new dom for jquery
    var content = ""; // content of the popup
    var title = feature.layer.name;
    
    // if there are special labels set in the config, apply them
    if(feature.layer.labels != undefined) {
        for(key in feature.layer.labels) {
            $("span.atr-name:econtains('"+key+"')", dom).html(feature.layer.labels[key]);
            
            // if the name of the features starts with a string specified in labels, append the label to the title
            if(feature.attributes.name.startsWith(key+""))
                title += " (" + feature.layer.labels[key] + ")";
        }
        
        // content of the popup
        content = "<h3>" + title + "</h3>";
        content += dom.get(2).innerHTML;
        
    // if no labels are specified just use the kml description
    } else {
        content = feature.attributes.description;
    }
    
    // build & add popup
    popup = new OpenLayers.Popup.FramedCloud("featurePopup",
        feature.geometry.getBounds().getCenterLonLat(),
        null,
        content,
        null, true, onPopupClose);
    popup.minSize = new OpenLayers.Size(200,100);
    popup.maxSize = new OpenLayers.Size(350,500);
    feature.popup = popup;
    popup.feature = feature;
    map.addPopup(popup, true);
    $('#featurePopup').css("z-index","10000");
}

/*
 * Close the popup if the feature gets unselected.
 */
function onFeatureUnSelect(evt) {
    feature = evt.feature;
    if (feature.popup) {
        popup.feature = null;
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    }
}

// Needed only for interaction, not for the display.
function onPopupClose(evt) {
    // 'this' is the popup.
    var feature = this.feature;
    if (feature.layer) { // The feature is not destroyed
        selectControl.unselect(feature);
    } else { // After "moveend" or "refresh" events on POIs layer all 
        //     features have been destroyed by the Strategy.BBOX
        this.destroy();
    }
}

// fetch all available datasets and add them to the map
function showAll(init) {
    
    $("#showall").html('<img border="0" src="img/loading.gif" />');
    
    removeAllLayers();
    
    $.get("proxy.cgi?url=" + escape("http://data.wien.gv.at/daten/geo?version=1.3.0&service=WFS&request=GetCapabilities"), function(response){
        data = Array();
        layers = Array();
        $("FeatureType", $(response)).each(function(index, element) { // Layer[queryable=1]
            element = $(element);
            var layer = element.children("Name").text();
            layer = layer.substring(layer.indexOf(":")+1);
            var title = element.children("Title").text();
            data.push({
                name: title,
                layers: [layer]
            });
        });
        if(init === true) {
            initMap();
        }
        setupLayers();
        updateAnchor();
        
        $("#showall").text("nur unterstützte anzeigen");
    });
}

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

//http://stackoverflow.com/questions/3629183/why-doesnt-indexof-work-on-an-array-ie8
function buildIndexOf() {
    if (!Array.prototype.indexOf)
    {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
        from += len;

        for (; from < len; from++)
        {
        if (from in this &&
            this[from] === elt)
            return from;
        }
        return -1;
    };
    }
}

// jquery selector so that contains() must be the exact content
$.expr[":"].econtains = function(obj, index, meta, stack){
    return (obj.textContent || obj.innerText || $(obj).text() || "").toLowerCase() == meta[3].toLowerCase();
}
