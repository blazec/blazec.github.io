function getPolygonCenter(coordinates)
{
	// coordinates is an array of [x,y] coordinates that represent the bounds of the polygon
	
	a = 0; // area of polygon
	cx = 0;
	cy = 0;
	for (i = 0; i < coordinates.length - 1; i++) {
		xy1 = coordinates[i];
		xy2 = coordinates[i+1];

		intmd = (xy1[0] * xy2[1]) - (xy2[0] * xy1[1])
		a += intmd;
		cx += (xy1[0] + xy2[0]) * intmd;
		cy += (xy1[1] + xy2[1]) * intmd;
	}

	a = a / 2;
	cx = (1 / (6 * a)) * cx;
	cy = (1 / (6 * a)) * cy;

	return [cx, cy];
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYmNhbGF5Y2F5IiwiYSI6ImNpdDNiZ3kyNTB1YjkyenFwNW1ydnJzNTcifQ._O_mLliIblnxVLyipCshMQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/bcalaycay/ciusmmfpt003h2jpg1f88rava',
  center: [-79.3832, 43.6532],
  zoom: 9,
  minZoom: 2,    
  maxZoom: 22
});


var choropleth_layers = [
	["#fff", 0, "0%"],
	["#deebf7", 0.05, "0% to 5%"],
	["#9ecae1", 0.1, "5% to 10%"],
	["#3182bd", 1, "10% to 100%"] 
];

map.on('style.load', function(){
	var legend = document.getElementById('legend'); //get the legend from the HTML document
	map.addSource('census_with_bikes', {
	    'type': 'vector', 
	    'url': 'mapbox://bcalaycay.9v51i0yf'
	  	});

	/* Add each choropleth layer */

	choropleth_layers.forEach(function(layer, i) {
		map.addLayer({
			"id": "choropleth_layer" + i,
			"type": "fill",
			"source": "census_with_bikes",
			"paint": {
				"fill-color": layer[0],
				"fill-opacity": 0.85,
				"fill-outline-color": "black"
			},
			"source-layer": "census_bike_data-1dnz3z"
		});

		var filter = ['all', ['<=', "census_bicycle_rate_bikes", layer[1]]];

		if (i > 0)
			filter.push(['>', 'census_bicycle_rate_bikes', choropleth_layers[i-1][1]]);

		map.setFilter('choropleth_layer' + i, filter);

		/* Create Legend */
		
		var item = document.createElement('div');//each layer gets a 'row' - this isn't in the legend yet, we do this later

	    var key = document.createElement('span');//add a 'key' to the row. A key will be the color circle
	    key.className = 'legend-key'; //the key will take on the shape and style properties defined here, in the HTML
	    key.style.backgroundColor = layer[0]; // the background color is retreived from teh layers array
	    var value = document.createElement('span');//add a value variable to the 'row' in the legend
	    value.id = 'legend-value-' + i; //give the value variable an id that we can access and change

	    item.appendChild(key); //add the key (color cirlce) to the legend row
	    item.appendChild(value);//add the value to the legend row

	    legend.appendChild(item); // Add row to the legend

	    document.getElementById('legend-value-' + i).textContent = layer[2];

	});

	// Add legend items for bike stations
	bikeStationColors = [ ['#c51b8a', "Bike Stations at 3 PM"], ['#feb24c', "Bike Stations at 5 PM"] ]
	bikeStationColors.forEach(function(layer, i){
		var item = document.createElement('div');//each layer gets a 'row' - this isn't in the legend yet, we do this later

	    var key = document.createElement('span');//add a 'key' to the row. A key will be the color circle
	    key.className = 'legend-key'; //the key will take on the shape and style properties defined here, in the HTML
	    key.style.backgroundColor = layer[0]; // the background color is retreived from teh layers array
	    key.style.borderRadius = "50%";
	    key.style.borderWidth = "0px";
	    var value = document.createElement('span');//add a value variable to the 'row' in the legend
	    value.id = 'legend-value-' + (i+4); //give the value variable an id that we can access and change

	    item.appendChild(key); //add the key (color cirlce) to the legend row
	    item.appendChild(value);//add the value to the legend row

	    legend.appendChild(item); // Add row to the legend

	    document.getElementById('legend-value-' + (i+4)).textContent = layer[1];

	});

	map.addLayer({
		'id': 'census_tracts_click',
		"type": "fill",
		"source": "census_with_bikes",
		"paint": {
			"fill-color": '#de2d26',
			"fill-opacity": 0.75,
			"fill-outline-color": "black"
		},
		"source-layer": "census_bike_data-1dnz3z",
		'filter': [ '==', 'CTUID', '' ]
	});

	map.addSource('bikeshare3pm',{
	    'type': 'geojson',
	    'data': bikeshare3pm,
	    'cluster': true,
	    'clusterMaxZoom': 18, // Max zoom to cluster points on
	    'clusterRadius': 5 // Radius of each cluster when clustering points (defaults to 50)
  	});

	 map.addSource('bikeshare5pm',{
	    'type': 'geojson',
	    'data': bikeshare5pm,
	    'cluster': true,
	    'clusterMaxZoom': 18, // Max zoom to cluster points on
	    'clusterRadius': 5 // Radius of each cluster when clustering points (defaults to 50)
  	});

	map.addLayer({
      'id': 'bikeshare3pmPoints',
      'type': 'circle',
      'source': 'bikeshare3pm',

      'layout': {
      	'visibility': 'none'
      },
      'paint':{
        'circle-color': '#c51b8a',//'#31a354',//'#2ca25f',
        'circle-radius': {
          'base': 3,
          'stops': [[12, 6], [22, 180]]
        },
        'circle-opacity': 1
      }
  	});

  	map.addLayer({
      'id': 'bikeshare5pmPoints',
      'type': 'circle',
      'source': 'bikeshare5pm',
      'layout': {},
      'paint':{
        'circle-color': '#feb24c', //'#2ca25f',
        'circle-radius': {
          'base': 3,
          'stops': [[12, 6], [22, 180]]
        },
        'circle-opacity': 1
      }
  	});
});


/* PRODUCE POPUP */
var popup = new mapboxgl.Popup({
	closeButton: true,
	closeOnClick: false
});

map.on('mousemove', function(e) {
	var features = map.queryRenderedFeatures(e.point, {layers: ['bikeshare3pmPoints', 'bikeshare5pmPoints', 'choropleth_layer0', 'choropleth_layer1', 'choropleth_layer2', 'choropleth_layer3']} );
	map.getCanvas().style.cursor = (features.length > 0) ? 'pointer' : '';

});

map.on('click', function(e) {
	map.setFilter('census_tracts_click',['==','CTUID','']);
	point_properties = null;
	var features = map.queryRenderedFeatures(e.point, {layers: ['bikeshare3pmPoints', 'bikeshare5pmPoints', 'choropleth_layer0', 'choropleth_layer1', 'choropleth_layer2', 'choropleth_layer3']} );
	if (features.length < 1) {
		popup.remove();
		return;
	}

	// var properties = features[0].properties;
	// console.log(features[0]);

	features.every(function(feature) {
		var properties = feature.properties;
		clicked_feature = feature;
		census_properties = feature.properties;
		console.log(feature.layer.id);
		if (feature.layer.id == 'bikeshare5pmPoints' || feature.layer.id == 'bikeshare3pmPoints') {
			point_properties = properties;
			return false;
		}

	});

	// Popup for each bike station
	console.log(point_properties);
	if (point_properties != null){

		zoom = map.getZoom() < 12 ? 12 : map.getZoom(); 

		map.flyTo({
			center: clicked_feature.geometry.coordinates, 
			zoom: zoom
		});
		var propertiesHTMLLocationHeader = "<center>" + point_properties.stationName + "<br/>" + (point_properties.executionTime == '17:00:00' ? "5 PM" : "3 PM") + "</center>";
		var propetiesHTMLDocksTable = "<table>"
			+ "<tr><td>Bikes Available: </td>" + "<td>" + point_properties.availableBikes + "</td>"
			+ "<tr><td>Docks Available: </td>" + "<td>" + point_properties.availableDocks + "</td>"
			+ "</table>";

		var popupHTMLLink = "<center><a href=http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=ad3cb6b6ae92b310VgnVCM10000071d60f89RCRD>Data source</a></center>";
		var popupHTML = propertiesHTMLLocationHeader  + propetiesHTMLDocksTable + popupHTMLLink;

		popup.setLngLat(e.lngLat)
			.setHTML(popupHTML)
			.addTo(map);

		//reset point_properties
		point_properties = null;

	}
	else {	// Popup for each census tract
		map.setFilter('census_tracts_click', ['==', 'CTUID', census_properties.CTUID]);

		zoom = map.getZoom() < 12 ? 12 : map.getZoom();

		map.flyTo({
			center: getPolygonCenter(clicked_feature.geometry.coordinates[0]),
			zoom: zoom
		});
		var propertiesHTMLCTHeader = "<center>" + "Census Tract " + census_properties.CTUID + "</center>";
		var propertiesHTMLNote = "<center><font size='0.5'>Data shown is for population aged 15 years or older. <br/> For census tracts with zero data values, no information is available</font></center>";
		var propertiesHTMLTransInfo = "<table>"
			+ "<tr><td>Total population who take some sort of transportation : </td>" + "<td>" + census_properties.census_bicycle_num_trans + "</td>"
			+ "<tr><td>Total population who mainly bike: </td>" + "<td>" + census_properties.census_bicycle_num_bikes + "</td>"
			+ "<tr><td>Percentage of population who bikes: </td>" + "<td>" + (census_properties.census_bicycle_rate_bikes * 100).toFixed(2) + "%" + "</td>"
			+ "</table>";

		var popupHTML = propertiesHTMLCTHeader + propertiesHTMLNote + propertiesHTMLTransInfo; 
		
		popup.setLngLat(e.lngLat)
			.setHTML(popupHTML)
			.addTo(map);
	}

	});

/* TOGGLE LAYERS MENU */
var toggleableLayerIds = [ 'November 8 2016 - 3 PM snapshot', 'November 8 2016 - 5 PM snapshot' ];
prevSelectedLayer = 'bikeshare5pmPoints';
for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
    	map.setFilter('census_tracts_click',['==','CTUID','']);
    	popup.remove();
        var selectedLayer = this.textContent;
        switch (selectedLayer) {
          case 'November 8 2016 - 3 PM snapshot':
            selectedLayer = 'bikeshare3pmPoints';
            break;
          case 'November 8 2016 - 5 PM snapshot':
            selectedLayer = 'bikeshare5pmPoints';
            break;
        }
        e.preventDefault();
        e.stopPropagation();

        if (selectedLayer != prevSelectedLayer) {
        	map.setLayoutProperty(selectedLayer, 'visibility', 'visible');
        	map.setLayoutProperty(prevSelectedLayer, 'visibility', 'none');
        }

        prevSelectedLayer = selectedLayer;

    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}






