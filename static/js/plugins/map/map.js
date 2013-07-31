(function (meditor, meditorBlock) {
    "use strict";

    var MapBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Map block': 'Блок с картой'
            }
        }
    });

    meditor.pluginAdd('map', MapBlock);
})(meditor, meditorBlock);