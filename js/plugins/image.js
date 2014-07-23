(function (meditor, meditorBlock) {
    "use strict";

    var ImageBlock = meditorBlock.extend({
        getI18nName: function () {
            return this.t('Image block');
        },
        attachHandlers: function(){
            var $me = this;

            $(this._htmlBlock).on('dragover', function(event){
                event.preventDefault();
                event.stopPropagation();
            });

            $(this._htmlBlock).on('dragenter', function(event){
                event.preventDefault();
                event.stopPropagation();
            });

            $(this._htmlBlock).on('drop', function(event){
                event.preventDefault();
                var dataTransfer = event.originalEvent.dataTransfer;
                if (dataTransfer && dataTransfer.files) {
                    $me.droppedFiles(dataTransfer.files, $(this));
                }
                return false;
            })
        },
        renderPlug: function(){
            var $plug = this.makePlug();
            $plug.append($('<div/>').addClass('plug-info').html(this.t('Drop image here')));
            return $plug;
        },
        render: function () {
            var block = this.getHtmlBlock();
            $(block).append(this.renderPlug());
            if ($(block).find('img').length <= 0) {
                this.showPlug();
            }
            return this._render()[0]
        },
        droppedFiles: function(files, block){
            var $me = this;
            if (files.length > 0){
                var file = files[0];
                this.readFileAsDataURL(file).then(function (data) {
                    $me.insertFile(file, data, block);
                })
            }
        },
        insertFile: function(file, data, block){
            this.hidePlug();
            block.find('img').remove();
            var $img = $('<img/>').attr('src', data);
            block.append($img);
        },
        readFileAsDataURL: function (file) {
            return $.Deferred(function (deferred) {
                $.extend(new FileReader(), {
                    onload: function (e) {
                        var data = e.target.result;
                        deferred.resolve(data);
                    },
                    onerror: function () {
                        deferred.reject(this);
                    }
                }).readAsDataURL(file);
            }).promise();
        }
    });

    meditor.pluginAdd('image', ImageBlock);
})(meditor, meditorBlock);