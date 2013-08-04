(function (meditor, meditorBlock) {
    "use strict";

    var mapItem = 0;

    var MapBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Map block': 'Блок с картой'
            }
        },
        map: undefined,
        events: function() {
            var self = this;
            return {
                onAfterRender: function () {
                    var container = $('.map-' + mapItem)[0];
                    this.map = L.map(container).setView([51.505, -0.09], 13);

                    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'OSM',
                        maxZoom: 18
                    }).addTo(this.map);

                    mapItem++;
                }
            }
        },
        getI18nName: function() {
            return this.t('Map block');
        },
        getContent: function(){
            var center = this.map.getCenter(),
                $block = this.getHtmlBlock(),
                className = 'col-' + this._parent.getColumnValue($block);

            if($block.hasClass('first')) {
                className += ' first';
            }

            return this._parent.renderTemplate('/plugins/map/map_save.jst', {
                id: L.Util.stamp(this.map),
                lat: center.lat,
                lng: center.lng,
                zoom: this.map.getZoom(),
                className: className
            });
        },
        render: function () {
            var $block = this._render(),
                tpl = this._parent.renderTemplate('/plugins/map/map.jst', {mapItem: mapItem});

            $block.append(tpl);
            return $block[0];
        }
    });

    meditor.pluginAdd('map', MapBlock);
})(meditor, meditorBlock);