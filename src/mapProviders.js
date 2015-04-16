// order of providers determine order in the popup
// provider must have hostnameMatch and extract function to work as extractor
// provider must have generateUrlTemplate and name to act as target

window.mapJumperMapProviders = [
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
        // this one seems obsolete, as maps are now redirected to www.google.com/maps ...
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
    },
    {
        name: 'Google Maps', // google.com/maps domain
        hostnameMatch: /www.google/,
        extract: function(document) {
            var pathname = window.location.pathname;
            if (pathname) {
                var latLonZoom = pathname.match(/\/@([\d.-]+),([\d.-]+),([\d]+)z/);
                if (latLonZoom) {
                    return {
                        lat: parseFloat(latLonZoom[1]),
                        lon: parseFloat(latLonZoom[2]),
                        zoom: parseFloat(latLonZoom[3])
                    };
                }

                var latLonHeight = pathname.match(/\/@([\d.-]+),([\d.-]+),([\d]+)m/);
                if (latLonHeight) {
                    var zoomFromHeight = function(height) {
                        // zoom 21 = 64 m
                        var log2Height = Math.log(height) / Math.log(2);
                        var zoom = 27 - log2Height;
                        return Math.round(Math.max(0, Math.min(21, zoom)));
                    };

                    return {
                        lat: parseFloat(latLonHeight[1]),
                        lon: parseFloat(latLonHeight[2]),
                        zoom: zoomFromHeight(parseFloat(latLonHeight[3]))
                    };
                }
            }
            return null;
        },
        urlTemplates: {
            base: 'http://google.com/maps/@LAT,LON,ZOOMz',
            'Earth': function (latLonZoom) {
                    var heightFromZoom = function(zoom) {
                        var heightStep = 27 - zoom;
                        var height = Math.exp(heightStep * Math.log(2));
                        return height;
                    };
                    return 'http://google.com/maps/@LAT,LON,HEIGHTm/data=!3m1!1e3'
                        .replace('LAT', latLonZoom.lat)
                        .replace('LON', latLonZoom.lon)
                        .replace('HEIGHT', heightFromZoom(latLonZoom.zoom));
            }
        }
    },
    {
        name: 'MapQuest Maps',
        urlTemplates: {
            base: 'http://open.mapquest.com/?center=LAT,LON&zoom=ZOOM'
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
            'Aerial': 'http://mapy.cz/letecka?x=LON&y=LAT&z=ZOOM',
            'Summer': 'http://mapy.cz/letni?x=LON&y=LAT&z=ZOOM',
            'Tourist': 'http://mapy.cz/turisticka?x=LON&y=LAT&z=ZOOM',
            'Winter': 'http://mapy.cz/zimni?x=LON&y=LAT&z=ZOOM'
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
            base: 'http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON',
            'Cyclo': 'http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON&layers=C',
            'Humanitarian': 'http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON&layers=H',
            'Transport': 'http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON&layers=T'
            // duplicate of mapquest
            // 'MapQuest Open': 'http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON&layers=Q',
        }
    },
    {
        name: 'Foursquare',
        hostnameMatch: /foursquare/,
        extract: function(document) {
            var lat = null, lon = null, zoom = null;
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
                lon: lon,
                zoom: zoom 
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
    }
];
