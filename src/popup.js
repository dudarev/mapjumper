function generate_links() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {}, function(result) {
            // console.log(result);
            if (result.error) {
                document.getElementById('container').innerHTML = result.error;
            } else {
                var mapProviders = window.mapJumperMapProviders;

                var lines = mapProviders.reduce(function(lines, mapProvider) {
                    if (mapProvider.urlTemplates && mapProvider.urlTemplates.base) {

                        // console.log(mapProvider.name, mapProvider.urlTemplates);

                        var altMaps = [];
                        for (var key in mapProvider.urlTemplates) {
                            if (key == 'base' || !mapProvider.urlTemplates.hasOwnProperty(key))
                                continue;

                            var url = urlFromTemplate(mapProvider.urlTemplates[key], result.latLonZoom);
                            // console.log('provider: ' + mapProvider.name, key, mapProvider.urlTemplates[key], 'url:', url);

                            altMaps.push(link(key, url));
                        }

                        var str = link(mapProvider.name, urlFromTemplate(mapProvider.urlTemplates.base, result.latLonZoom));

                        if (altMaps.length) {
                            str = '<span class="hack"></span><span class="alternatives">' + altMaps.join(', ') + '</span> | ' + str;
                        }

                        lines.push('<div class="mapProvider">' + str + '</div>');
                    }
                    return lines;
                }, []);

                document.getElementById('container').innerHTML = lines.join('');

                // hack to force resize popup when chrome doesn't resize it on content change
                setTimeout(function() {
                    var body = document.getElementsByTagName("BODY")[0];
                    var html = document.documentElement;

                    [html, body].forEach(function(domElement) {
                        // assume it's 1 line per mapProvider
                        domElement.style.minHeight = lines.length + 'em';
                    });
                }, 50);
            }
        });
    });
}

function urlFromTemplate(template, latLonZoom) {
    if (typeof template == 'string')
        return urlFromStringTemplate(template, latLonZoom);
    else if (typeof template == 'function')
        return urlFromFunctionTemplate(template, latLonZoom);
}

function urlFromFunctionTemplate(template, latLonZoom) {
    return template(latLonZoom);
}

function urlFromStringTemplate(template, latLonZoom) {
    return template
    .replace(/LAT/g, latLonZoom.lat)
    .replace(/LON/g, latLonZoom.lon)
    .replace('ZOOM', latLonZoom.zoom);
}

function link(title, href) {
    return '<a href="URL" target="_blank">TITLE</a>'
    .replace('TITLE', title)
    .replace('URL', href);
}

window.onload = generate_links;
