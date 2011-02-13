// The background page is asking us to find an address on the page.
if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    sendResponse(findCoordinates());
  });
}

// Search latitude and longitude in meta
// Return null if none is found.
var findCoordinates= function() {
  var node = document.head;
  var lat = null;
  var lon = null;
  for (var i = 0; i < node.childNodes.length; ++i) {
    var child = node.childNodes[i];
    if(child.nodeName){
        if (child.nodeName == "META") {
            if(child.getAttribute('property') == "og:latitude") lat = child.getAttribute('content');
            if(child.getAttribute('property') == "og:longitude") lon = child.getAttribute('content');
        };
    };
  };
  if(lat && lon)
      return {"lat":lat, "lon":lon};
  console.log("no place detected");
  return null;
}

