function generate_links() {
    var zoom_default = 16;
    var coordinates = null;
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {}, function(coordinates_pair) {
            coordinates = coordinates_pair;
            if (coordinates.found === false){
                document.getElementById('container').innerHTML = coordinates.message;
            } else {
                var zoom;
                if (coordinates.zoom)
                    zoom = coordinates.zoom;
                else
                    zoom = zoom_default;
                var link_wikimapia = '<a href="http://wikimapia.org/#lat=LAT&lon=LON&z=ZOOM&l=0&m=b" target="_blank">Wikimapia</a>';
                var link_osm = '<a href="http://www.openstreetmap.org/?lon=LON&lat=LAT&zoom=ZOOM&mlat=LAT&mlon=LON" target="_blank">OpenStreetMap</a>';
                var link_google ='<a href="http://maps.google.com/?ie=UTF8&ll=LAT,LON&z=ZOOM" target="_blank">Google Maps</a>';
                var link_mapquest = '<a href="http://open.mapquest.com/?center=LAT,LON&zoom=ZOOM" target="_blank">MapQuest Open</a>';
                var link_yandex = '<a href="http://maps.yandex.ru/?ll=LON%2CLAT&z=ZOOM" target="_blank">Yandex Maps</a>';
                var link_bing = '<a href="http://www.bing.com/maps/?cp=LAT~LON&lvl=ZOOM" target="_blank">Bing Maps</a>';
                link_wikimapia = link_wikimapia.replace('LAT',coordinates.lat);
                link_wikimapia = link_wikimapia.replace('LON',coordinates.lon);
                link_wikimapia = link_wikimapia.replace('ZOOM',zoom);
                link_osm = link_osm.replace(/LAT/g,coordinates.lat);
                link_osm = link_osm.replace(/LON/g,coordinates.lon);
                link_osm = link_osm.replace('ZOOM',zoom);
                link_google = link_google.replace(/LAT/g,coordinates.lat);
                link_google = link_google.replace(/LON/g,coordinates.lon);
                link_google = link_google.replace('ZOOM',zoom);
                link_mapquest = link_mapquest.replace(/LAT/g,coordinates.lat);
                link_mapquest = link_mapquest.replace(/LON/g,coordinates.lon);
                link_mapquest = link_mapquest.replace('ZOOM',zoom);
                link_yandex = link_yandex.replace(/LAT/g,coordinates.lat);
                link_yandex = link_yandex.replace(/LON/g,coordinates.lon);
                link_yandex = link_yandex.replace('ZOOM',zoom);
                link_bing = link_bing.replace(/LAT/g,coordinates.lat);
                link_bing = link_bing.replace(/LON/g,coordinates.lon);
                link_bing = link_bing.replace('ZOOM',zoom);
                document.getElementById('container').innerHTML = 
                    link_bing + "<br/>" + 
                    link_google + "<br/>" + 
                    link_mapquest + "<br/>" + 
                    link_osm + "<br/>" + 
                    link_wikimapia + "<br/>" + 
                    link_yandex;
            }
        });
    });
}

window.onload = generate_links;
