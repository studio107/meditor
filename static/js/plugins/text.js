(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        editableClass: function(dotted){
            var cn = 'editable';
            return dotted ? '.' + cn : cn;
        },
        getI18nName: function () {
            return this.t('Text block');
        },

        // TODO refactoring
        getContent: function () {
            var $htmlBlock = $(this._htmlblock),
                $editable = $htmlBlock.find(this.editableClass(true)),
                content = $editable.html();

            $editable.remove();
            $htmlBlock.html(content);

            return this._htmlBlock;
        },
        attachHandlers: function(){
            var $me = this;
            $(this._htmlBlock).on('click',function(){
                $(this).find($me.editableClass(true)).focusEnd();
            })
        },
        setCursor: function (pos){
            var node = (typeof node == "string" ||
                node instanceof String) ? document.getElementById(node) : node;
            if(!node){
                return false;
            }else if(node.createTextRange){
                var textRange = node.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd(pos);
                textRange.moveStart(pos);
                textRange.select();
                return true;
            }else if(node.setSelectionRange){
                node.setSelectionRange(pos,pos);
                return true;
            }
            return false;
        },
        // TODO refactoring
        render: function () {
            var $block = this._render(),
                $editable = $('<div/>');
            $editable.addClass(this.editableClass(false)).css('width', '100%').attr('contenteditable', true);
            $block.append($editable);
            return $block[0];
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