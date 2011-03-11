chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    sendResponse(findCoordinates());
});

// Search latitude and longitude in meta
// Return null if none is found.
var findCoordinates= function() {
  var node = document.head;
  var lat = null;
  var lon = null;
  var zoom = null;
  var hostname = window.location.hostname;
  if (hostname.match(/maps.google/))
      hostname = 'maps.google.com';
  if (hostname.match(/openstreetmap.org/))
      hostname = 'openstreetmap.org';
  switch(hostname){
      case "gowalla.com":
          console.log("gowalla.com");
          for (var i = 0; i < node.childNodes.length; ++i) {
            var child = node.childNodes[i];
            if(child.nodeName){
                if (child.nodeName == "META") {
                    if(child.getAttribute('property') == "og:latitude") lat = child.getAttribute('content');
                    if(child.getAttribute('property') == "og:longitude") lon = child.getAttribute('content');
                };
            };
          };
          break;
      case "maps.google.com":
          console.log("maps.google.com");
          var link = document.getElementById("link");
          link = link.getAttribute('href');
          latlon = link.match(/[^s]ll=([\d.-]+),([\d.-]+)/);
          if (!latlon)
              break
          console.log(link);
          console.log(latlon);
          lat = parseFloat(latlon[1]);
          lon = parseFloat(latlon[2]);
          zoom = parseInt(link.match(/z=(\d*)/)[1]);
          break;
      case "openstreetmap.org":
          console.log("openstreetmap.org");
          var link = document.getElementById("permalinkanchor");
          link = link.getAttribute('href');
          latlon = link.match(/lat=([\d.-]+)&lon=([\d.-]+)/);
          if (!latlon)
              break
          console.log(link);
          console.log(latlon);
          lat = parseFloat(latlon[1]);
          lon = parseFloat(latlon[2]);
          zoom = parseInt(link.match(/zoom=(\d*)/)[1]);
          break;
  }
  if(!(lat==null) && !(lon==null)){
      console.log({"lat":lat, "lon":lon, "zoom":zoom});
      return {"lat":lat, "lon":lon, "zoom":zoom};
  };
  console.log("no place detected");
  return null;
}

