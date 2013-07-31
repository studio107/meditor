(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        getI18nName: function () {
            return this.t('Text block');
        },

        // TODO refactoring
        getContent: function () {
            var $htmlBlock = $(this._htmlblock),
                $editable = $htmlBlock.find('.editable'),
                content = $editable.html();

            $editable.remove();
            $htmlBlock.html(content);

            return this._htmlBlock;
        },

        // TODO refactoring
        render: function () {
            var $block = this._render(),
                $editable = $('<div/>');
            $editable.addClass('editable').css('width', '100%').attr('contenteditable', true);
            $block.append($editable);
            return $block[0];
        }
    });

    meditor.pluginAdd('text', TextBlock);
})(meditor, meditorBlock);