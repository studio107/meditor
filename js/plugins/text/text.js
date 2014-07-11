(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        editableClass: function(dotted){
            var cn = 'text-editable';
            return dotted ? '.' + cn : cn;
        },
        textToolbarClass: function(dotted){
            var cn = 'text-toolbar';
            return dotted ? '.' + cn : cn;
        },
        textBoldClass: function(dotted){
            var cn = 'text-bold';
            return dotted ? '.' + cn : cn;
        },
        getI18nName: function () {
            return this.t('Text block');
        },

        // TODO refactoring
        getContent: function () {
            var $htmlBlock = $(this._htmlBlock).clone(),
                $editable = $htmlBlock.find(this.editableClass(true)),
                content = $editable.html();

            $editable.remove();
            $htmlBlock.html(content);

            return $htmlBlock;
        },
        attachHandlers: function(){
            var $me = this;
            $(this._htmlBlock).on('click',function(e){
                if ($(e.target).is(this)){
                    $(this).find($me.editableClass(true)).focusEnd();
                }
            });
        },
        // TODO refactoring
        render: function () {
            var block = this.getHtmlBlock(),
                $editable = $('<div/>'),
                html = $(block).html();
            $(block).html('');

            $editable.addClass(this.editableClass(false)).css('width', '100%').attr('contenteditable', true).html(html);
            var id = 'text-'+$(block).attr('rel');
            $editable.attr('id', id);

            $(block).append($editable);
            return this._render()[0];
        },
        events: function () {
            return {
                onClick: $.noop,
                onResize: $.noop,
                onClose: $.noop,
                onAfterRender: this.onAfterRender
            }
        },
        onAfterRender: function(){
            var me = this;
            CKEDITOR.disableAutoInline = true;
            $('.text-block').each(function(){
                var editable = $(this).find(me.editableClass(true));
                if (editable.length && !editable.hasClass('cke_editable')){
                    CKEDITOR.inline( editable.attr('id') );
                }
            });
        }
    });

    meditor.pluginAdd('text', TextBlock);
})(meditor, meditorBlock);

new function($) {
    $.fn.focusEnd = function() {
        $(this).focus();
        var tmp = $('<span />').appendTo($(this)),
            node = tmp.get(0),
            range = null,
            sel = null;
        if (document.selection) {
            range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
        } else if (window.getSelection) {
            range = document.createRange();
            range.selectNode(node);
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        tmp.remove();
        return this;
    }
}(jQuery);
