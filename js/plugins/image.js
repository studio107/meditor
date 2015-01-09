(function (meditor, meditorBlock) {
    "use strict";

    var ImageBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Image block': 'Картинка',
                'Image settings': 'Настройки изображения',
                'Image cover': 'Вывод изображения',
                'Default': 'По-умолчанию',
                'Cover': 'Адаптивный',
                'Drop files here to upload or': 'Перетащите файлы сюда или',
                'select images': 'выберите изображение'
            }
        },
        settings: {
            uploadUrl: ''
        },
        defaultHolderOptions: {
            'background-position': '50% 50%',
            'background-repeat': 'no-repeat',
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0,
            'z-index': 1
        },
        flowHandlerOptions: {
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0,
            'z-index': 10
        },
        holderClass: function (dotted) {
            var cn = 'meditor-image-holder';
            return dotted ? '.' + cn : cn;
        },
        flowHandlerClass: function (dotted) {
            var cn = 'meditor-image-flow-handler';
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
        /**
         * Settings
         */
        getFieldsets: function () {
            return [
                {
                    name: this.t('Image settings'),
                    fields: [
                        'cover'
                    ]
                }
            ];
        },
        getFields: function () {
            var me = this;
            return {
                cover: {
                    type: 'select',
                    multiple: false,
                    label: this.t('Image cover'),
                    values: {
                        'auto': this.t('Default'),
                        'cover': this.t('Cover')
                    },
                    getValue: function () {
                        var block = me.getHtmlBlock();
                        return $(block).find(me.holderClass(true)).css('background-size');
                    },
                    setValue: function (value) {
                        var block = me.getHtmlBlock();
                        $(block).find(me.holderClass(true)).css('background-size', value);
                    },
                    validate: function (value) {
                        return true;
                    }
                }
            }
        },
        attachHandlers: function () {
            var $me = this,
                $block = $(this._htmlBlock);

            var $flowHandler = this.getFlowHandler();
            $block.append($flowHandler);


            var r = new Flow({
                target: this.settings.uploadUrl,
                chunkSize: 1024 * 1024,
                testChunks: false
            });

            if (!r.support) {
                $block.html('Your browser, unfortunately, is not supported <a href="http://www.w3.org/TR/FileAPI/">the HTML5 File API</a> along with <a href="http://www.w3.org/TR/FileAPI/#normalization-of-params">file slicing</a>.');
            } else {
                r.assignDrop($flowHandler[0]);
                r.assignBrowse($flowHandler[0], false, false, {accept: 'image/*'});
                r.on('filesSubmitted', function (file) {
                    r.upload();
                });
                r.on('fileSuccess', function (file, message) {
                    $me.insertFile(file, message, $block);
                });
                r.on('fileError', function (file, message) {
                    $block.html('File could not be uploaded: ' + message);
                });
            }
        },
        getFlowHandler: function(){
            return $('<div/>').addClass(this.flowHandlerClass(false)).css(this.flowHandlerOptions);
        },
        flowTemplate: function () {
            var drop = this.t('Drop files here to upload or');
            var select = this.t('select images');
            return '<div class="flow-drop" ondragenter="$(this).addClass(\'flow-dragover\');" ondragend="$(this).removeClass(\'flow-dragover\');" ondrop="$(this).removeClass(\'flow-dragover\');">' +
                drop + ' <a class="flow-browse-image"><u>' + select + '</u></a>' +
                '</div>';
        },
        renderPlug: function () {
            var $plug = this.makePlug();
            // $plug.append($('<div/>').addClass('plug-info').html(this.t('Drop image here')));
            $plug.append($('<div/>').addClass('plug-info').html(this.flowTemplate()));
            return $plug;
        },
        render: function () {
            var $block = $(this.getHtmlBlock());
            $block.append(this.renderPlug());
            if ($block.find('img').length <= 0) {
                this.showPlug();
            }
            $block.append(this.renderHeightResizer('height'));
            return this._render()[0];
        },
        droppedFiles: function (files, block) {
            var $me = this;
            if (files.length > 0) {
                var file = files[0];
                this.readFileAsDataURL(file).then(function (data) {
                    $me.insertFile(file, data, block);
                })
            }
        },
        insertFile: function (file, data, block) {
            var $me = this, $block = $(block);
            this.hidePlug();
            $block.find(this.holderClass(true)).remove();
            var $img = $('<img/>').attr('src', data).css({'display': 'none'});
            var imgOptions = $.extend(this.defaultHolderOptions, {
                'background-image': "url('" + data + "')"
            });

            $img[0].onload = function () {
                $me.correctImageBlock(block);
            };

            var $imageHolder = $('<div/>').addClass(this.holderClass(false)).css(imgOptions).append($img);
            block.append($imageHolder);
            this.saveState();
        },
        getContent: function () {
            var $htmlBlock = $(this._htmlBlock).clone();
            $htmlBlock.find(this.flowHandlerClass(true)).remove();
            return $htmlBlock;
        },
        correctImageBlock: function (block) {
            var $block = $(block);
            var $img = $block.find('img');
            if ($img.length) {
                var img = $img[0];
                $block.css({'height': $block.width() * (img.height / img.width)});
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
        correctBlock: function () {
            var block = this.getHtmlBlock();
            this.correctImageBlock(block);
        }
    });

    meditor.pluginAdd('image', ImageBlock);
})(meditor, meditorBlock);