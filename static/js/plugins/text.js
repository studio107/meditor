(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        render: function () {
            var content = $(this.htmlblock).find('.editable').html();
            $(this.htmlblock).find('.editable').remove();
            $(this.htmlblock).html(content);

            return this.htmlblock;
        },
        editable: function () {
            var content = $(this.htmlblock).html();
            $(this.htmlblock).html('');
            $(this.htmlblock).append($('<div/>',{
                'class': 'editable',
                'style': 'width: 100%;',
                'html': content,
                'contenteditable': 'true'}));
            return this.htmlblock;
        }
    });

    meditor.pluginAdd('text', TextBlock);
})(meditor, meditorBlock);