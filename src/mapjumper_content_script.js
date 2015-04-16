// The background page is asking us to find an address on the page.
if (window == top) {
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
        sendResponse(findCoordinates());
    });
}

var DEFAULT_ZOOM = 16;

// Search latitude and longitude in meta
// Return null if none is found.
var findCoordinates = function() {
    var mapProviders = window.mapJumperMapProviders;

    var matchingMapProviders = mapProviders.filter(function(provider){
        return provider.hostnameMatch && window.location.hostname.match(provider.hostnameMatch);
    });

    if (matchingMapProviders.length === 0) {
        return { error: 'Could not find provider for url ' + window.location.hostname + ', please file an issue at https://github.com/dudarev/mapjumper/issues' };
    }

    console.log('matching map providers', matchingMapProviders);

    var mapProvider = matchingMapProviders[0];
    var latLonZoom = mapProvider.extract && mapProvider.extract(document) || null;

    console.log('latLonZoom', latLonZoom);

    if (latLonZoom.lat === null || latLonZoom.lon === null) {
        var message = mapProvider.coordinatesNotFound || 'No place detected.';
        console.log('Mapjumper: map provider ' + mapProvider.name + ': no coordinates found:', message);
        return { error: message };
    }

    if (latLonZoom.zoom === null)
        latLonZoom.zoom = DEFAULT_ZOOM; // default zoom

    return {
        latLonZoom: latLonZoom,
        mapProviders: mapProviders
    };
};

function initialize(tabId) {
    chrome.tabs.sendRequest(tabId, {}, function(result) {
        if (!result) {
            chrome.pageAction.hide(tabId);
        } else {
            chrome.pageAction.show(tabId);
        }
    });
}
