(function (meditor, meditorBlock) {
    "use strict";

    var SpaceBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Space block': 'Отступ'
            }
        },
        getI18nName: function() {
            return this.t('Space block');
        }
    });

    meditor.pluginAdd('space', SpaceBlock);
})(meditor, meditorBlock);