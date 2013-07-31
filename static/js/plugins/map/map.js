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
            this._parent.loader.js('http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js', function() {
                var map = L.map('block-map-create').setView([51.505, -0.09], 13);

                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'OSM',
                    maxZoom: 18
                }).addTo(map);
            })
        },
        render: function () {
            this.loadDependency();

            var $block = this._render(),
                tpl = this._parent.renderTemplate('/plugins/map/map.jst'),
                $map = $(tpl);
            $block.append($map);
            return $block[0];
        }
    });

    meditor.pluginAdd('map', MapBlock);
})(meditor, meditorBlock);