mapboxgl.accessToken = 'pk.eyJ1IjoiYmNhbGF5Y2F5IiwiYSI6ImNpdDNiZ3kyNTB1YjkyenFwNW1ydnJzNTcifQ._O_mLliIblnxVLyipCshMQ';

//Standard set up
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [-79.385811,43.655298],
  zoom: 9
});

//because we can click the map, change the cursor to a 'pointer' style
//map.getCanvas().style.cursor = 'pointer';

var extent =   turf.extent(sprmkt);
var squareGrid = turf.squareGrid(extent, 2, 'kilometers');
//console.log(squareGrid);
//Get count
var superMarketsCount = turf.count(squareGrid, sprmkt, 'supermarketCount');

// Get quantiles
var quantiles = turf.quantile(superMarketsCount, 'supermarketCount', [25,50,75,100]);

var colors = ['#f1eef6','#bdc9e1','#74a9cf','#0570b0'] //color array obtained from colorbrewer
var transparency = [0.85,0.85,0.85,0.85,0.85] //transparency for the 6 layers

quantiles.forEach(function(element, i) {
  quantiles[i] = [element, colors[i], transparency[i]];
});


var choropleth_layers = [
  ['#f1eef6', '0% - 20%'],
  ['#bdc9e1', "0% to 5%"],
  ['#74a9cf', "5% to 10%"],
  ['#0570b0', "10% to 100%"]
];

//add the supermarkets point layer from the geojson file
map.on('style.load', function(){
  choropleth_layers.forEach(function(layer, i) {
    var legend = document.getElementById('legend'); //get the legend from the HTML document

    var item = document.createElement('div');//each layer gets a 'row' - this isn't in the legend yet, we do this later

    var key = document.createElement('span');//add a 'key' to the row. A key will be the color circle
    key.className = 'legend-key'; //the key will take on the shape and style properties defined here, in the HTML
    key.style.backgroundColor = layer[0]; // the background color is retreived from teh layers array
    var value = document.createElement('span');//add a value variable to the 'row' in the legend
    value.id = 'legend-value-' + i; //give the value variable an id that we can access and change

    item.appendChild(key); //add the key (color cirlce) to the legend row
    item.appendChild(value);//add the value to the legend row

    legend.appendChild(item); // Add row to the legend

    if (i == 0) 
      document.getElementById('legend-value-' + i).textContent = quantiles[i][0];
    else {
      if (quantiles[i-1][0] + 1 != quantiles[i][0])
        document.getElementById('legend-value-' + i).textContent = (quantiles[i-1][0] + 1) + "-" + quantiles[i][0];
      else
        document.getElementById('legend-value-' + i).textContent = quantiles[i][0];
    }
  });

  map.addSource('supermarketSource',{
    'type': 'geojson',
    'data': sprmkt
  });


  map.addSource('supermarketSquareGrid', {
    "type": "geojson",
    "data": superMarketsCount
    });

  map.addLayer({
    'id': 'supermarketLayer',
    'type': 'circle',
    'source': 'supermarketSource',
    'layout': {},
    'paint': {
      'circle-color': 'orange', //make our base supermarket layer small orange points
      'circle-radius': 3,
      'circle-opacity': 0.75
    }
  });

    // make supermarket clickable
  // map.on('click', function(e) {
  //   // new mapboxgl.Popup()
  //   //   .setLngLat(e.features)
  //   console.log(e);
  // });

  map.on('click', 'supermarketLayer', function(e) {
      console.log(e)
  });



  for(i = 0; i < quantiles.length; i++){ //Now we loop through the jenks breaks categories to add layers
    // if (i > 0){                            //but remember that we don't add a layer for the first element in the jenks breaks array - that would be 1 too many layers
      map.addLayer({
        "id": "supermarketSquareGrid-" + (i-1),   //To be consistent, we subtract 1 from i, so that the FIRST layer has index 0
        "type": "fill",
        "source": "supermarketSquareGrid",
        "layout": {},
        "paint":{
          'fill-color': quantiles[i][1],  //We stored the color in the 2nd position (index 1)
          'fill-opacity': quantiles[i][2], //We stored the transparency in the 3rd position (index 2)
          'fill-outline-color': 'white'
          }
      },"supermarketLayer"); 
  };

  quantiles.forEach(function(quantile, i){

      var filters = ['all',['<=', 'supermarketCount', quantile[0]]];
      if(i > 0){
        filters.push(['>', 'supermarketCount', quantiles[i - 1][0]]);
        map.setFilter('supermarketSquareGrid-' + (i-1), filters); //REMEMBER the i is off by one so we ensure the first layer starts with 0
      }
  });



});






