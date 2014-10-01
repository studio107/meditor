(function (meditor, meditorBlock) {
    "use strict";

    var ImageBlock = meditorBlock.extend({
        defaultHolderOptions: {
            'background-position': '50% 50%',
            'background-size': 'cover',
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0
        },
        holderClass: function (dotted) {
            var cn = 'meditor-image-holder';
            return dotted ? '.' + cn : cn;
        },
        events: function () {
            return {
                onColumnChangeSize: this.correctBlock,
                onAfterMove: this.correctBlock
            }
        },
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
            $(block).append(this.renderHeightResizer('height'));
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
            var $me = this;
            this.hidePlug();
            block.find(this.holderClass(true)).remove();
            var $img = $('<img/>').attr('src', data).css({'display': 'none'});
            var imgOptions = $.extend(this.defaultHolderOptions, {'background-image': 'url(' + data + ')'});

            $img[0].onload = function(){
                $me.correctImageBlock(block);
            };

            var $imageHolder = $('<div/>').addClass(this.holderClass(false)).css(imgOptions).append($img);
            block.append($imageHolder);
            this.saveState();
        },
        correctImageBlock: function(block){
            var $img = block.find('img');
            if ($img.length) {
                var img = $img[0];
                var blockWidth = block.width();
                var ratio = img.height / img.width;
                var blockHeight = blockWidth * ratio;

                block.css({'height': blockHeight});
            }
            this.saveState();
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
        },
        correctBlock: function(){
            var block = this.getHtmlBlock();
            this.correctImageBlock(block);
        }
    });

    meditor.pluginAdd('image', ImageBlock);
})(meditor, meditorBlock);