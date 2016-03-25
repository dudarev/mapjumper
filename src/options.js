// Saves options to chrome.storage
function save_options() {
    var mapProvidersInput = document.getElementsByTagName("input");
    var mapProvidersState = {};
    for (var i = 0; i < mapProvidersInput.length; i++) {
        mapProvidersState[mapProvidersInput[i].value] = mapProvidersInput[i].checked;
    }
    chrome.storage.sync.set({
        mapProvidersState: mapProvidersState
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get('mapProvidersState', function(settings) {
        var mapProviders = window.mapJumperMapProviders;
        var lines = mapProviders.reduce(function(lines, mapProvider) {
            if (mapProvider.urlTemplates && mapProvider.urlTemplates.base) {
                var name = mapProvider.name;
                if (settings.mapProvidersState) {
                    var checked = settings.mapProvidersState[name] ? 'checked' : '';
                } else {
                    var checked = 'checked';
                }
                lines.push('<div class="provider"><input ' + checked + ' type="checkbox" name="provider" value="' + name + '"><span class="provider_name">' + name + '</span></div>');
            }
            return lines;
        }, []);
        document.getElementById('providers').innerHTML = lines.join('');
        // save options on checkbox click
        var mapProvidersInput = document.getElementsByTagName("input");
        for (var i = 0; i < mapProvidersInput.length; i++) {
            mapProvidersInput[i].addEventListener('click', save_options, false);
        }
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
