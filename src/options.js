// Saves options to chrome.storage
function save_options() {
    var mapProvidersInput = document.getElementsByTagName("input");
    var mapProvidersState = {};
    for (var i = 0; i < mapProvidersInput.length; i++) {
        mapProvidersState[mapProvidersInput[i].value] = mapProvidersInput[i].checked;
    }
    chrome.storage.sync.set({
        mapProvidersState: mapProvidersState
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved!';
        setTimeout(function() {
            status.textContent = '';
        }, 1750);
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
                var checked = settings.mapProvidersState[name] ? 'checked' : '';
                lines.push('<input ' + checked + ' type="checkbox" name="provider" value="' + name + '">' + name + '<br/>');
            }
            return lines;
        }, []);
        document.getElementById('providers').innerHTML = lines.join('');
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
