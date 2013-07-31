(function (meditor, meditorBlock) {
    "use strict";

    var MapBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Map block': 'Блок с картой'
            }
        },
        getI18nName: function() {
            return this.t('Map block');
        },
        loadDependency: function() {
            this.parent.loader.js('http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js', function() {
                var map = L.map('block-map-create').setView([51.505, -0.09], 13);
            })
        }
    });

    meditor.pluginAdd('map', MapBlock);
})(meditor, meditorBlock);