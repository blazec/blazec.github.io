mapboxgl.accessToken = 'pk.eyJ1IjoiYmNhbGF5Y2F5IiwiYSI6ImNpdDNiZ3kyNTB1YjkyenFwNW1ydnJzNTcifQ._O_mLliIblnxVLyipCshMQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/bcalaycay/ciusmmfpt003h2jpg1f88rava',
  // center: [-106.3468, 56.1304],
  center: [-79.3832, 43.6532],
  zoom: 5,
  minZoom: 2,    
  maxZoom: 22
});


map.on('style.load', function(){
  var legend = document.getElementById('legend'); //get the legend from the HTML document
  
  map.addSource('resultsLiberal', {
    'type': 'vector', 
    'url': 'mapbox://bcalaycay.dseg7uzd'
  	});

  map.addSource('resultsConservative', {
    'type': 'vector', 
    'url': 'mapbox://bcalaycay.at8fo6n2'
    });

  map.addSource('resultsNDP', {
    'type': 'vector', 
    'url': 'mapbox://bcalaycay.byc0mev1'
    });

  map.addSource('resultsBloc', {
    'type': 'vector', 
    'url': 'mapbox://bcalaycay.3fafe9w3'
    });

  map.addSource('resultsGreen', {
    'type': 'vector', 
    'url': 'mapbox://bcalaycay.b0ap5iql'
    });

	map.addLayer({
        "id": "resultsLiberal",
        "type": "fill",
        "source": "resultsLiberal",
        "paint": {
            "fill-color": "#de2d26",
            "fill-opacity": 0.85,
            "fill-outline-color": "black"
        },

        "layout": {
            "visibility" : "visible"
        },
        
        "source-layer": "resultsLiberal-42umnd"
      });

    map.addLayer({
        "id": "resultsGreen",
        "type": "fill",
        "source": "resultsGreen",
        "paint": {
            "fill-color": "#31a354",
            "fill-opacity": 0.85,
            "fill-outline-color": "black"
        },

        "layout": {
            "visibility" : "visible"
        },
        
        "source-layer": "resultsGreen-cwtbti"
      });

    map.addLayer({
        "id": "resultsConservative",
        "type": "fill",
        "source": "resultsConservative",
        "paint": {
            "fill-color": "#2c7fb8",
            "fill-opacity": 0.85,
            "fill-outline-color": "black"
        },

        "layout": {
            "visibility" : "visible"
        },
        
        "source-layer": "resultsConservative-65wp7u"
      });

    map.addLayer({
        "id": "resultsNDP",
        "type": "fill",
        "source": "resultsNDP",
        "paint": {
            "fill-color": "#feb24c",
            "fill-opacity": 0.85,
            "fill-outline-color": "black"
        },

        "layout": {
            "visibility" : "visible"
        },
        
        "source-layer": "resultsNDP-3snwwp"
      });

      map.addLayer({
        "id": "resultsBloc",
        "type": "fill",
        "source": "resultsBloc",
        "paint": {
            "fill-color": "#a6bddb",
            "fill-opacity": 0.85,
            "fill-outline-color": "black"
        },

        "layout": {
            "visibility" : "visible"
        },
        
        "source-layer": "resultsBloc-8kmgl7"
      });

})

/* TOGGLE LAYERS MENU */
var toggleableLayerIds = [ 'Bloc', 'Conservative', 'Green', 'Liberal', 'NDP' ];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.getElementById(id)

    //var link = document.createElement('a');
    // link.href = '#';
    // link.className = 'active';
    // link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        switch (clickedLayer) {
          case 'Bloc Quebecois':
            clickedLayer = 'resultsBloc';
            break;
          case 'Conservative':
            clickedLayer = 'resultsConservative';
            break;
          case 'Green':
            clickedLayer = 'resultsGreen';
            break;
          case 'Liberal':
            clickedLayer = 'resultsLiberal';
            break;
          case 'NDP':
            clickedLayer = 'resultsNDP';
            break;

        }
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}


/* HOVER POPUP*/
var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['resultsConservative', 'resultsBloc', 'resultsGreen', 'resultsLiberal', 'resultsNDP'] });
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

    if (!features.length) {
        popup.remove();
        return;
    }

    var feature = features[0];
    var results = JSON.parse(feature.properties.ELECTION_RESULTS);
    var district = feature.properties.ENNAME;
    // sort the keys. Election results look like this {"NDP": "10.1", "Green": "2.3", "Conservative": "72.8", "Liberal": "13.7"}
    keys_parties = [];
    for (var k in results) {
        keys_parties.push(k);  
    }
    keys_parties.sort();

    var resultsDisplay = "<center><b>" + district + "</b> <br /><center>"
    resultsDisplay += "<table>"

    for (i = 0; i < keys_parties.length; i++) {
        var party = keys_parties[i]
        var pct = results[party];
        resultsDisplay += "<tr>" + "<td>" + party + "<td>" + "<td>" + pct + "%" + "</td>" + "</tr>"

    }

    resultsDisplay += "</table>"
    
    
    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(e.lngLat)
        .setHTML(resultsDisplay)
        .addTo(map);
});


