// The background page is asking us to find an address on the page.
if (window == top) {
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
        sendResponse(findCoordinates());
    });
}

var DEFAULT_ZOOM = 16;

// order of providers determine order in the popup
// provider must have hostnameMatch and extract function to work as extractor
// provider must have generateUrlTemplate and name to act as target
var mapProviders = [
	{
		name: 'Bing Maps',
		hostnameMatch: /www.bing.com/,
		extract: function(document) {
			var link = document.getElementById("MapControl_MapControl");
			var link_value = link.getAttribute('value');
			var latLon = link_value.match(/'C':{'Latitude':([\d.-]+),'Longitude':([\d.-]+)/);
			if (!latLon)
				return null;
			return {
				lat: parseFloat(latLon[1]),
				lon: parseFloat(latLon[2]),
				zoom: parseInt(link_value.match(/'Z':(\d+)/)[1], 10)
			};
		},
		urlTemplates: {
			base: 'http://www.bing.com/maps/?cp=LAT~LON&lvl=ZOOM',
			'Aerial': 'http://www.bing.com/maps/?cp=LAT~LON&lvl=ZOOM&sty=h',
			'Bird\'s eye': 'http://www.bing.com/maps/?cp=LAT~LON&lvl=ZOOM&sty=b',
		}
	},
	{
		name: 'Google Maps', // maps.google domain
		hostnameMatch: /maps.google/,
		extract: function(document) {
			var gmap_link = document.getElementById("link");
			var gmap_link_href = gmap_link.getAttribute('href');
			var latLon = gmap_link_href.match(/[^s]ll=([\d.-]+),([\d.-]+)/);
			if (!latLon)
				return null;
			return {
				zoom: parseInt(gmap_link_href.match(/z=(\d*)/)[1], 10),
				lat: parseFloat(latLon[1]),
				lon: parseFloat(latLon[2])
			};
		},
		coordinatesNotFound: "no coordinates detected, drag the map around, click again",
		urlTemplates: {
			base: 'http://maps.google.com/?ie=UTF8&ll=LAT,LON&z=ZOOM'
		}
	},
	{
		name: 'Google Maps', // google.com/maps domain
		hostnameMatch: /www.google/,
		extract: function(document) {
			var pathname = window.location.pathname;
			if (pathname) {
				var latLonZoom = pathname.match(/@([\d.-]+),([\d.-]+),([\d]+)z/);
				if (latLonZoom) {
					return {
						lat: parseFloat(latLonZoom[1]),
						lon: parseFloat(latLonZoom[2]),
						zoom: parseFloat(latLonZoom[3])
					};
				}
			}
			return null;
		}
	},
	{
		name: 'MapQuest Maps',
		urlTemplates: {
			base: 'http://open.mapquest.com/?center=LAT,LON&zoom=ZOOM'
		}
	},
	{
		name: 'OpenStreetMap',
		hostnameMatch: /openstreetmap.org/,
		extract: function(document) {
			var hash = window.location.hash;
			if(hash){
				var zlatlon = hash.match(/map=([\d]+)\/([\d.-]+)\/([\d.-]+)/);
				if (!zlatlon)
					return null;
				return {
					lat: parseFloat(zlatlon[2]),
					lon: parseFloat(zlatlon[3]),
					zoom: parseFloat(zlatlon[1])
				};
			}
		},
		urlTemplates: {
			base: 'http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON'
		}
	},
	{
		name: 'Foursquare',
		hostnameMatch: /foursquare/,
		extract: function(document) {
			var lat, lon;
			for (var i = 0; i < document.head.childNodes.length; ++i) {
				var child = document.head.childNodes[i];
				if(child.nodeName){
					if (child.nodeName == 'META') {
						if(child.getAttribute('property') == "playfoursquare:location:latitude")
							lat = child.getAttribute('content');
						if(child.getAttribute('property') == "playfoursquare:location:longitude")
							lon = child.getAttribute('content');
					}
				}
			}
			return {
				lat: lat,
				lon: lon
			};
		},
		coordinatesNotFound: "browse to a place page",
	},
	{
		name: 'Wikimapia',
		hostnameMatch: /wikimapia/,
		extract: function(document) {
			var hash = window.location.hash;
			if(hash){
				var latLonZ = hash.match(/lat=([\d.-]+)&lon=([\d.-]+)&z=([\d]+)/);
				if (!latLonZ)
					return null;
				return {
					lat: parseFloat(latLonZ[1]),
					lon: parseFloat(latLonZ[2]),
					zoom: parseFloat(latLonZ[3])
				};
			}
		},
		urlTemplates: {
			base: 'http://wikimapia.org/#lat=LAT&lon=LON&z=ZOOM&l=0&m=b'
		}
	},
	{
		name: 'Yandex Maps',
		hostnameMatch: /maps.yandex/,
		extract: function(document) {
			var link = window.location.href;
			var lonLat = link.match(/ll=([\d.-]+)(?:%2C|,)([\d.-]+)/);
			if (!lonLat)
				return null;
			return {
				lon: parseFloat(lonLat[1], 10),
				lat: parseFloat(lonLat[2], 10),
				zoom: parseInt(link.match(/z=(\d+)/)[1], 10)
			};
		},
		urlTemplates: {
			base: 'http://maps.yandex.ru/?ll=LON%2CLAT&z=ZOOM'
		}
	},
	{
		name: '2gis',
		hostnameMatch: /2gis/,
		extract: function(document) {
			var pathname = window.location.pathname;
			if (pathname) {
				var latlonz = pathname.match(/([\d.-]+)%2C([\d.-]+)\/zoom\/([\d.-]+)/);
				return {
					lon: parseFloat(latlonz[1]),
					lat: parseFloat(latlonz[2]),
					zoom: parseFloat(latlonz[3])
				};
			} else {
				return null;
			}
		}
	},
	{
		name: 'Mapy.cz',
		hostnameMatch: /mapy.cz/,
		extract: function(document) {
			var search = window.location.search;
			if (search) {
				var lonMatch = search.match(/x=([\d.-]+)/);
				var latMatch = search.match(/y=([\d.-]+)/);
				var zoomMatch = search.match(/z=([\d]+)/);
				if (!(latMatch && lonMatch && zoomMatch))
					return null;
				return {
					lat: parseFloat(latMatch[1]),
					lon: parseFloat(lonMatch[1]),
					zoom: parseFloat(zoomMatch[1])
				};
			}
		},
		urlTemplates: {
			base: 'http://mapy.cz?x=LON&y=LAT&z=ZOOM',
			'Tourist': 'http://mapy.cz/turisticka?x=LON&y=LAT&z=ZOOM',
			'Summer': 'http://mapy.cz/letni?x=LON&y=LAT&z=ZOOM',
			'Winter': 'http://mapy.cz/zimni?x=LON&y=LAT&z=ZOOM',
			'Aerial': 'http://mapy.cz/letecka?x=LON&y=LAT&z=ZOOM'
		}
	}
];


// Search latitude and longitude in meta
// Return null if none is found.
var findCoordinates = function() {
	var matchingMapProviders = mapProviders.filter(function(provider){
		return provider.hostnameMatch && window.location.hostname.match(provider.hostnameMatch);
	});

	if (matchingMapProviders.length === 0) {
		return { error: 'Could not find provider for url ' + window.location.hostname + ', please file an issue at https://github.com/dudarev/mapjumper/issues' };
	}
	// console.log('matching map providers', matchingMapProviders);

	var mapProvider = matchingMapProviders[0];
	var latLonZoom = mapProvider.extract && mapProvider.extract(document) || null;

	// console.log('latLonZoom', latLonZoom);

	if (latLonZoom === null || latLonZoom.lat === null || latLonZoom.lon === null) {
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
