(function (meditor, meditorBlock) {
    "use strict";

    var VideoBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Video block': 'Видео',
                'This video hosting is not supported!': 'Данный видеохостинг не поддерживается',
                'Set video url in settings': 'Укажите URL видео в настройках',
                'Video settings': 'Настройки видео',
                'Video url': 'URL видео'
            }
        },
        types: {
            youtube : {
                matcher : /(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
                params  : {
                    autohide    : 1,
                    fs          : 1,
                    rel         : 0,
                    hd          : 1,
                    wmode       : 'opaque',
                    enablejsapi : 1
                },
                url  : '//www.youtube.com/embed/$3'
            },
            vimeo : {
                matcher : /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
                params  : {
                    hd            : 1,
                    show_title    : 1,
                    show_byline   : 1,
                    show_portrait : 0,
                    fullscreen    : 1
                },
                url  : '//player.vimeo.com/video/$1'
            }
        },
        defaultIFrameOptions: {
            'width': '100%'
        },
        format: function( url, rez, params ) {
            params = params || '';

            if ( $.type( params ) === "object" ) {
                params = $.param(params, true);
            }

            $.each(rez, function(key, value) {
                url = url.replace( '$' + key, value || '' );
            });

            if (params.length) {
                url += ( url.indexOf('?') > 0 ? '&' : '?' ) + params;
            }

            return url;
        },
        holderClass: function (dotted) {
            var cn = 'meditor-video-holder';
            return dotted ? '.' + cn : cn;
        },
        events: function () {
            return {
                onColumnChangeSize: this.correctBlock,
                onHeightResize: this.onHeightResize,
                onAfterMove: this.correctBlock
            }
        },
        getI18nName: function () {
            return this.t('Video block');
        },
        renderPlug: function(){
            var $plug = this.makePlug();
            $plug.append($('<div/>').addClass('plug-info').html(this.t('Set video url in settings')));
            return $plug;
        },
        render: function () {
            var block = this.getHtmlBlock();
            $(block).append(this.renderPlug());
            if ($(block).find('iframe').length <= 0) {
                this.showPlug();
            }
            $(block).append(this.renderHeightResizer('height'));
            return this._render()[0]
        },
        /**
         * Settings
         */
        getFieldsets: function(){
            return [
                {
                    name: this.t('Video settings'),
                    fields: [
                        'url'
                    ]
                }
            ];
        },
        getFields: function(){
            var me = this;
            return {
                url: {
                    type: 'text',
                    multiple: false,
                    label: this.t('Video url'),
                    getValue: function () {
                        var block = me.getHtmlBlock();
                        var url = $(block).data('url') ? $(block).data('url') : '';
                        return url;
                    },
                    setValue: function(value){
                        for (var key in me.types) {
                            var item = me.types[key];
                            var rez  = value.match( item.matcher );
                            if (rez) {
                                var url = me.format( item.url, rez, item.params);
                                me.insertVideo(value, url);
                                break;
                            }
                        }
                    },
                    validate: function (value) {
                        for (var key in me.types) {
                            var item = me.types[key];
                            var rez  = value.match( item.matcher );
                            if (rez) {
                                return true;
                            }

                        }
                        return [me.t('This video hosting is not supported!')];
                    }
                }
            }
        },
        insertVideo: function(url, objectUrl) {
            var block = this.getHtmlBlock();
            var object = this.makeObject(objectUrl);
            $(block).find('iframe').remove();
            $(block).append(object);
            $(block).attr('data-url', url).data('url', url);
            this.hidePlug();
            this.correctBlock();
            return block;
        },
        makeObject: function(url){
            var iframe = $('<iframe/></iframe>').css(this.defaultIFrameOptions);
            iframe.attr('src', url);
            return iframe;
        },
        correctVideoBlock: function(block, width, height){
            var $iframe = $(block).find('iframe');
            width = width || false;
            height = height || false;

            if ($iframe.length) {
                if (width && height) {
                    $iframe.css('height', height);
                }else{
                    var blockWidth = $(block).width();
                    var ratio = 0.6;
                    var blockHeight = blockWidth * ratio;
                    $iframe.css('height', blockHeight);
                    $(block).css('height', blockHeight);
                }
            }
            this.saveState();
        },
        correctBlock: function(){
            var block = this.getHtmlBlock();
            this.correctVideoBlock(block);
        },
        onHeightResize: function(){
            var block = this.getHtmlBlock();
            this.correctVideoBlock(block, $(block).width(), $(block).height());
        }
    });

    meditor.pluginAdd('video', VideoBlock);
})(meditor, meditorBlock);