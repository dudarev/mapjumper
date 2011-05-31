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
  var zoom_default = 16;
  var hostname = window.location.hostname;
  if (hostname.match(/maps.google/))
      hostname = 'maps.google.com';
  if (hostname.match(/openstreetmap.org/))
      hostname = 'openstreetmap.org';
  if (hostname.match(/(gowalla|foursquare)/))
      hostname = 'gowalla_or_4sq';
  switch(hostname){
      case "gowalla_or_4sq":
          console.log("gowalla_or_4sq");
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
          lat = parseFloat(latlon[1]);
          lon = parseFloat(latlon[2]);
          zoom = parseInt(link.match(/zoom=(\d*)/)[1]);
          break;
      case "picasaweb.google.com":
          console.log("picasa");
          var t = document.getElementsByClassName("lhcl_advancedExifFields");
          var trs = t[0].getElementsByTagName("tr");
          for (var i = 0; i < trs.length; ++i) {
              var th = trs[i].getElementsByTagName("th");
              if(th[0].innerHTML.match('Latitude')){
                  var td = trs[i].getElementsByTagName("td");
                  var n = td[0].innerHTML.match(/[\d.-]+/);
                  lat = parseFloat(n[0]);
                  var sign = td[0].innerHTML.match(/[NS]/);
                  if (sign[0] == 'S'){
                      lat = -lat;
                  }
              }
              if(th[0].innerHTML.match('Longitude')){
                  var td = trs[i].getElementsByTagName("td");
                  n = td[0].innerHTML.match(/[\d.-]+/);
                  lon = parseFloat(n[0]);
                  var sign = td[0].innerHTML.match(/[WE]/);
                  if (sign[0] == 'W'){
                      lon = -lon;
                  }
              }
              zoom = zoom_default;
          };
          break;
  }
  if(!(lat==null) && !(lon==null)){
      return {"lat":lat, "lon":lon, "zoom":zoom};
  };
  console.log("no place detected");
  return {"found": false};
}

