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
            $(this._htmlBlock).on('click',function(){
                $(this).find(this.editableClass(true)).setCursorPosition(4);
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
    $.fn.setCursorPosition = function(pos) {
        if ($(this).get(0).setSelectionRange) {
            $(this).get(0).setSelectionRange(pos, pos);
        } else if ($(this).get(0).createTextRange) {
            var range = $(this).get(0).createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
}(jQuery);