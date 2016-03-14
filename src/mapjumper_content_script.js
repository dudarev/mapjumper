var DEFAULT_ZOOM = 16;

// The background page is asking us to find an address on the page.
if (window == top) {
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
        chrome.storage.sync.get('mapProvidersState', function(settings) {
            sendResponse(findCoordinates(settings.mapProvidersState));
        });
    });
}

// Search latitude and longitude in meta
// Return null if none is found.
var findCoordinates = function(mapProvidersState) {

    // map providers enabled in options
    var enabledMapProviders = window.mapJumperMapProviders.filter(function(provider){
        return mapProvidersState[provider.name];
    });

    // map provider for the current page
    var pageMapProvider = window.mapJumperMapProviders.filter(function(provider){
        return provider.hostnameMatch && window.location.hostname.match(provider.hostnameMatch);
    });

    if (pageMapProvider.length === 0) {
        return { error: 'Could not find provider for url ' + window.location.hostname + ', please file an issue at https://github.com/dudarev/mapjumper/issues' };
    }

    var mapProvider = pageMapProvider[0];
    var latLonZoom = mapProvider.extract && mapProvider.extract(document) || null;

    console.log('latLonZoom', latLonZoom);

    if (latLonZoom === null || latLonZoom.lat === null || latLonZoom.lon === null) {
        var message = mapProvider.coordinatesNotFound || 'No place detected.';
        console.log('Mapjumper: map provider ' + mapProvider.name + ': no coordinates found:', message);
        return { error: message };
    }

    if (latLonZoom.zoom === null)
        latLonZoom.zoom = DEFAULT_ZOOM; // default zoom

    return {
        latLonZoom: latLonZoom,
        mapProviders: enabledMapProviders
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
