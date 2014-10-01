(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        editableClass: function(dotted){
            var cn = 'text-editable';
            return dotted ? '.' + cn : cn;
        },
        getI18nName: function () {
            return this.t('Text block');
        },

        // TODO refactoring
        getContent: function () {
            var $htmlBlock = $(this._htmlBlock).clone(),
                $editable = $htmlBlock.find(this.editableClass(true));

            var content = CKEDITOR.instances[$editable.attr('id')].getData();

            $editable.remove();
            $htmlBlock.html(content);

            return $htmlBlock;
        },
        attachHandlers: function(){
            var $me = this;
            $(this._htmlBlock).on('click',function(e){
                if ($(e.target).is(this) || $(e.target).closest('.plug').length > 0){
                    $me.hidePlug();
                    $(this).find($me.editableClass(true)).focusEnd();
                }
            });
        },
        renderPlug: function(){
            var $plug = this.makePlug();
            $plug.append($('<div/>').addClass('plug-info').html(this.t('Click here to edit text')));
            return $plug;
        },
        // TODO refactoring
        render: function () {
            var $me = this;
            var block = this.getHtmlBlock(),
                $editable = $('<div/>'),
                html = $(block).html();
            $(block).html('');

            $editable.addClass(this.editableClass(false)).css('width', '100%').attr('contenteditable', true).html(html);
            var id = 'text-'+$(block).attr('rel');
            $editable.attr('id', id);
            $editable.on('blur', function () {
                var editableText = $editable.text();
                if (!editableText){
                    $me.showPlug();
                }
            });

            $(block).append($editable);
            $(block).append(this.renderPlug());
            $(block).append(this.renderHeightResizer('min-height'));

            if (!html){
                this.showPlug();
            }

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
                if (editable.length && !editable.data('enabled')){
                    editable.data('enabled', true);
                    CKEDITOR.inline( editable.attr('id') );
                    CKEDITOR.instances[editable.attr('id')].on('change', function() {
                        me.saveState();
                    });
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
