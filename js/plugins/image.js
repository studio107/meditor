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
                if ($(event.target).is(this)){
                    event.preventDefault();
                    var dataTransfer = event.originalEvent.dataTransfer;
                    if (dataTransfer && dataTransfer.files) {
                        $me.droppedFiles(dataTransfer.files, $(event.target));
                    }
                    return false;
                }
                return false;
            })

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
            block.html('');
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