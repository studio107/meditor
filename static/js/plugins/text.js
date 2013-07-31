(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        getI18nName: function() {
            return this.t('Text block');
        },

        // TODO refactoring
        render: function () {
            var content = $(this.htmlblock).find('.editable').html();
            $(this._htmlBlock).find('.editable').remove();
            $(this._htmlBlock).html(content);

            return this._htmlBlock;
        },

        // TODO refactoring
        editable: function () {
            var content = $(this._htmlBlock).html();
            $(this._htmlBlock).html('');
            $(this._htmlBlock).append($('<div/>',{
                'class': 'editable',
                'style': 'width: 100%;',
                'html': content,
                'contenteditable': 'true'}));
            return this._htmlBlock;
        }
    });

    meditor.pluginAdd('text', TextBlock);
})(meditor, meditorBlock);