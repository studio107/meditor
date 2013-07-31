(function (meditor, meditorBlock) {
    "use strict";

    var SpaceBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Space block': 'Блок отступ'
            }
        },
        test: function() {

        }
    });

    meditor.pluginAdd('space', SpaceBlock);
})(meditor, meditorBlock);