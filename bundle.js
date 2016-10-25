

// do 20 second long polls of data from USGS site, add new quakes as appropriate.

var quakes$ = Rx.Observable.interval(20000).startWith(0).take(100)
  .do(function(i) {console.log(i)})
  .flatMap(function() {
    return Rx.DOM.jsonpRequest({
      url: QUAKE_URL,
      jsonpCallback: 'eqfeed_callback', 
    }).retry(5);
  })
  .flatMap(function(obj){
    return Rx.Observable.from(obj.response.features);
  })
  .distinct(function(quake) {return quake.properties.code})
  .map(function(quake){
    return {
      lat: quake.geometry.coordinates[1],
      lng: quake.geometry.coordinates[0],
      magnitude: quake.properties.mag,
      time: quake.properties.time,
      place: quake.properties.place
    };
  })
  .do(function(x) {console.log(x)});

// for leaflet map
quakes$.subscribe(function(quake) {
  L.circle([quake.lat, quake.lng], quake.magnitude*10000).addTo(map);
});



// TTD 
// **show the initial feed of earthquake one at a time in timestamp order
// ** build a dashboard that shows the place/magnitude of new quakes 
// **make a game out of this? 
// Game: Earthquake Bingo? 

// I have no idea what Earthquake Bingo is yet but I want to play it!
// use lat, long and/or magnitudes to generate bingo cards!
// then pull time series and play the game...


// Note: the distinct could potentially miss quakes that for example had incorrect data at first
// if USGS sends through corrected data, it will be an quake 
// with a code already seen before, not a distinct one.
// is it work