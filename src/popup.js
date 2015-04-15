function generate_links() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {}, function(result) {
					console.log(result);
					if (result.error) {
						document.getElementById('container').innerHTML = result.error;
					} else {
						var links = result.mapProviders.reduce(function(lines, mapProvider) {
							if (mapProvider.urlTemplates && mapProvider.urlTemplates.base) {

								var altMaps = [];
								for (var key in mapProvider.urlTemplates) {
									if (key == 'base' || !mapProvider.urlTemplates.hasOwnProperty(key))
										continue;

									altMaps.push(link(key, urlFromTemplate(mapProvider.urlTemplates[key], result.latLonZoom)));
								}

								var str = link(mapProvider.name, urlFromTemplate(mapProvider.urlTemplates.base, result.latLonZoom));

								if (altMaps.length) {
									str += ' <span class="alternatives">(' + altMaps.join(', ') + ')</span>';
								}

								lines.push(str);
							}
							return lines;
						}, []);

						document.getElementById('container').innerHTML = links.join('<br/>');

						// hack to force resize popup when chrome doesn't resize it on content change
						var body = document.getElementsByTagName("BODY")[0];
						var html = document.documentElement;

						[html, body].forEach(function(domElement) {
							// assume it's 1 line per mapProvider + 2 lines for body margins
							domElement.style.minHeight = (2 + lines.length) + 'em';
						});
					}
        });
    });
}

function urlFromTemplate(teplate, latLonZoom) {
	return teplate
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
