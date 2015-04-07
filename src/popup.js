function generate_links() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {}, function(result) {
					console.log(result);
					if (result.error) {
						document.getElementById('container').innerHTML = result.error;
					} else {
						var links = result.mapProviders.reduce(function(array, mapProvider) {
							if (mapProvider.generateUrlTemplate) {
								var mapUrl = mapProvider.generateUrlTemplate
									.replace(/LAT/g, result.latLonZoom.lat)
									.replace(/LON/g, result.latLonZoom.lon)
									.replace('ZOOM', result.latLonZoom.zoom);

								var url = '<a href="URL" target="_blank">NAME</a>';
								array.push(url
									.replace('NAME', mapProvider.name)
									.replace('URL', mapUrl)
								);
							}
							return array;
						}, []);

						document.getElementById('container').innerHTML = links.join('<br/>');
					}
        });
    });
}

window.onload = generate_links;
