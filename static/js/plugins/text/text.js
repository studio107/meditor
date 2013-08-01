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
            var $htmlBlock = $(this._htmlblock),
                $editable = $htmlBlock.find(this.editableClass(true)),
                content = $editable.html();

            $editable.remove();
            $htmlBlock.html(content);

            return this._htmlBlock;
        },
        attachHandlers: function(){
            var $me = this;
            $(this._htmlBlock).on('click',function(e){
                if ($(e.target).is(this)){
                    $(this).find($me.editableClass(true)).focusEnd();
                }
            })
        },
        // TODO refactoring
        render: function () {
            var $block = this._render(),
                $editable = $('<div/>');
            $editable.addClass(this.editableClass(false)).css('width', '100%').attr('contenteditable', true);

            $($editable).popline();

            $block.append($editable);
            return $block[0];
        }
    });

    meditor.pluginAdd('text', TextBlock);
})(meditor, meditorBlock);

/* popline  */
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


;(function($) {

    var LEFT = -2, UP = -1, RIGHT = 2, DOWN = 1, NONE = 0, ENTER = 13;

    var isIMEMode = false;
    $(document).on('compositionstart', function(event) {
        isIMEMode = true;
    });
    $(document).on('compositionend', function(event) {
        isIMEMode = false;
    });

    var toggleBox = function(event) {
        if ($.popline.utils.isNull($.popline.current)) {
            return;
        }
        var isTargetOrChild = $.contains($.popline.current.target.get(0), event.target) || $.popline.current.target.get(0) === event.target;
        var isBarOrChild = $.contains($.popline.current.bar.get(0), event.target) || $.popline.current.bar.get(0) === event.target;
        if ((isTargetOrChild || isBarOrChild) && window.getSelection().toString().length > 0) {
            var target= $.popline.current.target, bar = $.popline.current.bar;
            if (bar.is(":hidden") || bar.is(":animated")) {
                bar.stop(true, true);
                var left = null, top = null;
                var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
                left = event.pageX - bar.width() / 2;
                if (left < 0) left = 10;
                top = event.pageY - bar.outerHeight() - parseInt(target.css('font-size')) / 2;
                $.popline.current.show({left: left, top: top});
            }
        }else {
            $.popline.hideAllBar();
        }
    };

    var targetEvent = {
        mousedown: function(event) {
            $.popline.current = $(this).data("popline");
            $.popline.hideAllBar();
        },
        keyup: function(event) {
            var popline = $(this).data("popline"), bar = popline.bar;
            if (!isIMEMode && window.getSelection().toString().length > 0) {
                var left = null, top = null;
                var rect = $.popline.getRect(), keyMoved = isKeyMove(popline.target);
                if (keyMoved === DOWN || keyMoved === RIGHT) {
                    left = rect.right - bar.width() / 2;
                    top = $(document).scrollTop() + rect.bottom - bar.outerHeight() - parseInt($(this).css("font-size"));
                }else if (keyMoved === UP || keyMoved === LEFT) {
                    left = rect.left - bar.width() / 2;
                    top = $(document).scrollTop() + rect.top - bar.outerHeight();
                }
                $.popline.current.show({left: left, top: top});
            }else {
                $.popline.current.hide();
            }
        },
        keydown: function(event) {
            var rects = window.getSelection().getRangeAt(0).getClientRects();
            if (rects.length > 0) {
                $(this).data('lastKeyPos', $.popline.boundingRect());
            }
        }
    }

    var isKeyMove = function(target) {
        var lastKeyPos = target.data('lastKeyPos');
        currentRect = $.popline.boundingRect();
        if ($.popline.utils.isNull(lastKeyPos)) {
            return null;
        }
        if (currentRect.top === lastKeyPos.top && currentRect.bottom !== lastKeyPos.bottom) {
            return DOWN;
        }
        if (currentRect.bottom === lastKeyPos.bottom && currentRect.top !== lastKeyPos.top) {
            return UP;
        }
        if (currentRect.right !== lastKeyPos.right) {
            return RIGHT;
        }
        if (currentRect.left !== lastKeyPos.left) {
            return LEFT;
        }
        return NONE;
    };

    $.fn.popline = function(options) {

        if ($.popline.utils.browser.ie) {
            return;
        }

        this.each(function() {
            if (typeof(options) === "string" && $(this).data("popline")) {
                $(this).data("popline")[options]();
            }else if (!$(this).data("popline")) {
                var popline = new $.popline(options, this);
            }
        });

        if (!$(document).data("popline-global-binded")) {
            $(document).mouseup(function(event){
                var _this = this;
                setTimeout((function(){
                    toggleBox.call(_this, event);
                }), 1);
            });
            $(document).data("popline-global-binded", true);
        }
    };

    $.popline = function(options, target) {
        this.settings = $.extend(true, {}, $.popline.defaults, options);
        this.target = $(target);
        this.init();
        $.popline.addInstance(this);
    };

    $.extend($.popline, {

        defaults: {
            zIndex: 9999,
            mode: "edit",
            enable: null,
            disable: null
        },

        instances: [],

        current: null,

        prototype: {
            init: function() {
                this.bar = $("<ul class='popline' style='z-index:" + this.settings.zIndex + "'></ul>").appendTo("body");
                this.bar.data("popline", this);
                this.target.data("popline", this);
                var me = this;

                var isEnable = function(array, name) {
                    if (array === null) {
                        return true;
                    }
                    for (var i = 0, l = array.length; i < l; i++) {
                        var v = array[i];
                        if (typeof(v) === "string" && name === v) {
                            return true;
                        }else if ($.isArray(v)) {
                            if (isEnable(v, name)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }


                var isDisable = function(array, name) {
                    if (array === null) {
                        return false;
                    }
                    for (var i = 0, l = array.length; i < l; i++) {
                        var v = array[i];
                        if (typeof(v) === "string" && name === v) {
                            return true;
                        }else if ($.isArray(v)) {
                            if ((v.length === 1 || !$.isArray(v[1])) && isDisable(v, name)) {
                                return true;
                            }else if (isDisable(v.slice(1), name)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                var makeButtons = function(parent, buttons) {
                    for (var name in buttons) {
                        var button = buttons[name];
                        var mode = $.popline.utils.isNull(button.mode) ? $.popline.defaults.mode : button.mode;

                        if (mode !== me.settings.mode
                            || !isEnable(this.settings.enable, name)
                            || isDisable(this.settings.disable, name)) {
                            continue;
                        }
                        var $button = $("<li><span class='btn'></span></li>");

                        $button.addClass("popline-button popline-" + name + "-button")

                        if (button.iconClass) {
                            $button.children(".btn").append("<i class='" + button.iconClass + "'></i>");
                        }

                        if (button.text) {
                            $button.children(".btn").append("<span class='text " + (button.textClass || '') + "'>" + button.text + "</span>");
                        }

                        if ($.isFunction(button.beforeShow)) {
                            this.beforeShowCallbacks.push({name: name, callback: button.beforeShow});
                        }

                        if ($.isFunction(button.afterHide)) {
                            this.afterHideCallbacks.push({name: name, callback: button.afterHide});
                        }

                        $button.appendTo(parent);

                        if (button.buttons) {
                            $subbar = $("<ul class='subbar'></ul>");
                            $button.append($subbar);
                            makeButtons.call(this, $subbar, button.buttons);
                            $button.click(function(event) {
                                var _this = this;
                                if (!$(this).hasClass("boxed")) {
                                    me.switchBar($(this), function() {
                                        $(_this).siblings("li").hide().end()
                                            .children(".btn").hide().end()
                                            .children("ul").show().end()
                                    });
                                    event.stopPropagation();
                                }
                            });
                        }else if($.isFunction(button.action)) {
                            $button.click((function(button) {
                                return function(event) {
                                    button.action.call(this, event, me);
                                }
                            })(button)
                            );
                        }
                        $button.mousedown(function(event) {
                            if (!$(event.target).is("input")) {
                                event.preventDefault();
                            }
                        });
                        $button.mouseup(function(event) {
                            event.stopPropagation();
                        });
                    }
                }

                makeButtons.call(this, this.bar, $.popline.buttons);

                this.target.bind(targetEvent);

                this.bar.on("mouseenter", "li", function() {
                    if (!($(this).hasClass("boxed"))) {
                        $(this).addClass("hover");
                    }
                });
                this.bar.on("mouseleave", "li", function() {
                    if (!($(this).hasClass("boxed"))) {
                        $(this).removeClass("hover");
                    }
                });
            },

            show: function(options) {
                for (var i = 0, l = this.beforeShowCallbacks.length; i < l; i++) {
                    var obj = this.beforeShowCallbacks[i];
                    var $button = this.bar.find("li.popline-" + obj.name + "-button");
                    obj.callback.call($button, this);
                }
                this.bar.css('top', options.top + "px").css('left', options.left + "px").stop(true, true).fadeIn();
            },

            hide: function() {
                var _this = this;
                if (this.bar.is(":visible") && !this.bar.is(":animated")) {
                    this.bar.fadeOut(function(){
                        _this.bar.find("li").removeClass("boxed").show();
                        _this.bar.find(".subbar").hide();
                        _this.bar.find(".textfield").hide();
                        _this.bar.find(".btn").show();
                        for (var i = 0, l = _this.afterHideCallbacks.length; i < l; i++) {
                            var obj = _this.afterHideCallbacks[i];
                            var $button = _this.bar.find("li.popline-" + obj.name + "-button");
                            obj.callback.call($button, _this);
                        }
                    });
                }
            },

            destroy: function() {
                this.target.unbind(targetEvent);
                this.target.removeData("popline");
                this.target.removeData("lastKeyPos");
                this.bar.remove();
            },

            switchBar: function(button, hideFunc, showFunc) {
                if (typeof(hideFunc) === "function") {
                    var _this = this;
                    var position = parseInt(_this.bar.css('left')) + _this.bar.width() / 2;
                    _this.bar.animate({ opacity: 0, marginTop: -_this.bar.height() + 'px' }, function() {
                        hideFunc.call(this);
                        button.removeClass('hover').addClass('boxed').show();
                        _this.bar.css("margin-top", _this.bar.height() + "px")
                        _this.bar.css("left", position - _this.bar.width() / 2 + "px");
                        if (typeof(showFunc) === "function") {
                            _this.bar.animate({ opacity: 1, marginTop: 0 }, showFunc)
                        }else {
                            _this.bar.animate({ opacity: 1, marginTop: 0 })
                        }
                    });
                }
            },

            beforeShowCallbacks: [],

            afterHideCallbacks: []

        },

        hideAllBar: function() {
            for (var i = 0, l = $.popline.instances.length; i < l; i++) {
                $.popline.instances[i].hide();
            }
        },

        addInstance: function(popline){
            $.popline.instances.push(popline);
        },

        boundingRect: function(rects) {
            if ($.popline.utils.isNull(rects)) {
                rects = window.getSelection().getRangeAt(0).getClientRects();
            }
            return {
                top: parseInt(rects[0].top),
                left: parseInt(rects[0].left),
                right: parseInt(rects[rects.length -1].right),
                bottom: parseInt(rects[rects.length - 1].bottom)
            }
        },

        webkitBoundingRect: function() {
            var rects = window.getSelection().getRangeAt(0).getClientRects();
            var wbRects = [];
            for (var i = 0, l = rects.length; i < l; i++) {
                var rect = rects[i];
                if (rect.width === 0) {
                    continue;
                }else if ((i === 0 || i === rects.length - 1) && rect.width === 1) {
                    continue;
                }else {
                    wbRects.push(rect);
                }
            }
            return $.popline.boundingRect(wbRects);
        },

        getRect: function() {
            if ($.popline.utils.browser.firefox || $.popline.utils.browser.opera) {
                return $.popline.boundingRect();
            }else if ($.popline.utils.browser.chrome || $.popline.utils.browser.safari) {
                return $.popline.webkitBoundingRect();
            }
        },

        utils: {
            isNull: function(data) {
                if (typeof(data) === "undefined" || data === null) {
                    return true;
                }
                return false;
            },
            randomNumber: function() {
                return Math.floor((Math.random() * 10000000) + 1);
            },
            trim: function(string) {
                return string.replace(/^\s+|\s+$/g, '');
            },
            browser: {
                chrome: navigator.userAgent.match(/chrome/i) ? true : false,
                safari: navigator.userAgent.match(/safari/i) && !navigator.userAgent.match(/chrome/i) ? true : false,
                firefox: navigator.userAgent.match(/firefox/i) ? true : false,
                opera: navigator.userAgent.match(/opera/i) ? true : false,
                ie: navigator.userAgent.match(/msie/i) ? true : false,
                webkit: navigator.userAgent.match(/webkit/i) ? true : false
            },
            findNodeWithTags: function(node, tags) {
                if (!$.isArray(tags)) {
                    tags = [tags];
                }
                while (node) {
                    if (node.nodeType !== 3) {
                        var index = tags.indexOf(node.tagName);
                        if (index !== -1) {
                            return node;
                        }
                    }
                    node = node.parentNode;
                }
                return null;
            }
        },

        addButton: function(button) {
            $.extend($.popline.buttons, button);
        },

        buttons: {}

    });
})(jQuery);

// "P", "H1", "H2", "H3", "H4", "H5", "H6", "VOID"
;(function($) {

    var tags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "VOID"];

    var wrap = function(tag) {
        var range = window.getSelection().getRangeAt(0);
        var anchorNode = window.getSelection().anchorNode, focusNode = window.getSelection().focusNode;
        var matchedNode = $.popline.utils.findNodeWithTags(focusNode, tags);
        tag = matchedNode && matchedNode.tagName === tag ? "VOID" : tag;
        var node = document.createElement(tag);
        var fragment = range.extractContents();

        removeEmptyTag(matchedNode);

        var textNode = document.createTextNode($(fragment).text());
        node.appendChild(textNode);

        range.insertNode(node);
        window.getSelection().selectAllChildren(node);
    }

    var removeEmptyTag = function(node) {
        if ($.popline.utils.trim($(node).text()) === "") {
            $(node).remove();
        }
    }

    $.popline.addButton({
        blockFormat: {
            text: "H",
            mode: "edit",
            buttons: {
                normal: {
                    text: "P",
                    textClass: "lighter",
                    action: function(event) {
                        wrap("P");
                    }
                },
                h1: {
                    text: "H1",
                    action: function(event) {
                        wrap("H1");
                    }
                },
                h2: {
                    text: "H2",
                    action: function(event) {
                        wrap("H2");
                    }
                },
                h3: {
                    text: "H3",
                    action: function(event) {
                        wrap("H3");
                    }
                },
                h4: {
                    text: "H4",
                    action: function(event) {
                        wrap("H4");
                    }
                },
                h5: {
                    text: "H5",
                    action: function(event) {
                        wrap("H5");
                    }
                },
                h6: {
                    text: "H6",
                    action: function(event) {
                        wrap("H6");
                    }
                }
            },
            afterHide: function(popline){
                popline.target.find("void").contents().unwrap();
            }
        }
    });

})(jQuery);

// P, BLOCKQUOTE
;(function($) {

    $.popline.addButton({
        blockquote: {
            iconClass: "icon-quote-left",
            mode: "edit",
            action: function(event, popline) {
                var selection = window.getSelection();
                var node = $.popline.utils.findNodeWithTags(selection.focusNode, 'BLOCKQUOTE');
                if (node) {
                    document.execCommand('formatblock', false, 'P');
                }else {
                    document.execCommand('formatblock', false, 'BLOCKQUOTE');
                }
            }
        }
    });
})(jQuery);

// bold, italic, underline, strikethrough
;(function($) {

    $.popline.addButton({
        bold: {
            iconClass: "icon-bold",
            mode: "edit",
            action: function(event) {
                document.execCommand("bold");
            }
        },

        italic: {
            iconClass: "icon-italic",
            mode: "edit",
            action: function(event) {
                document.execCommand("italic");
            }
        },

        strikethrough: {
            iconClass: "icon-strikethrough",
            mode: "edit",
            action: function(event) {
                document.execCommand("strikethrough");
            }
        },

        underline: {
            iconClass: "icon-underline",
            mode: "edit",
            action: function(event) {
                document.execCommand("underline");
            }
        }
    });
})(jQuery);

// justify
;(function($) {
    $.popline.addButton({
        justify: {
            iconClass: "icon-align-justify",
            mode: "edit",
            buttons: {
                justifyLeft: {
                    iconClass: "icon-align-left",
                    action: function(event) {
                        document.execCommand("JustifyLeft");
                    }
                },

                justifyCenter: {
                    iconClass: "icon-align-center",
                    action: function(event) {
                        document.execCommand("JustifyCenter");
                    }
                },

                justifyRight: {
                    iconClass: "icon-align-right",
                    action: function(event) {
                        document.execCommand("JustifyRight");
                    }
                },

                indent: {
                    iconClass: "icon-indent-right",
                    action: function(event) {
                        document.execCommand("indent");
                    }
                },

                outdent: {
                    iconClass: "icon-indent-left",
                    action: function(event) {
                        document.execCommand("outdent");
                    }
                }
            }
        }
    });
})(jQuery);

// link
;(function($) {

    var selectionIsLink = function() {
        var result = false;
        var selection = window.getSelection();
        if ($.popline.utils.browser.webkit) {
            result = $.popline.utils.findNodeWithTags(selection.focusNode, 'A');
        }else if ($.popline.utils.browser.firefox) {
            result = firefoxSelectionIsLink();
        }
        return result;
    }

    var firefoxSelectionIsLink = function() {
        //firefox has diffrerent behavior between double click selection and mouse move selection
        //when double click to select link, we need lookup from descendants
        var selection = window.getSelection();
        var range = window.getSelection().getRangeAt(0);
        var fragment = range.cloneContents();
        if (fragment.childNodes.length === 1 && fragment.firstChild.tagName === "A") {
            return true;
        }
        //if not found, lookup from ancestries
        return $.popline.utils.findNodeWithTags(selection.focusNode, 'A');
    }

    var buildTextField = function(popline, button) {
        if (button.find(":text").length === 0) {
            var $textField = $("<input type='text' />");
            $textField.addClass("textfield");
            $textField.attr("placeholder", "Type Url Here");

            $textField.keyup(function(event) {
                if (event.which === 13) {
                    $(this).blur();
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(button.data('selection'));
                    document.execCommand("createlink", false, $(this).val());
                    popline.hide();
                }
            });

            $textField.mouseup(function(event) {
                event.stopPropagation();
            });
            button.append($textField);
        }
    }

    $.popline.addButton({
        link: {
            iconClass: "icon-link",
            mode: "edit",
            beforeShow: function(popline) {
                if (selectionIsLink()) {
                    this.find("i").removeClass("icon-link").addClass("icon-unlink");
                }else {
                    this.find("i").removeClass("icon-unlink").addClass("icon-link");
                }

                if (!this.data("click-event-binded")) {

                    this.click(function(event) {
                        var $_this = $(this);

                        if (selectionIsLink()) {

                            document.execCommand("unlink");
                            $_this.find("i").removeClass("icon-unlink").addClass("icon-link");

                        }else {

                            buildTextField(popline, $_this);

                            if (!$_this.hasClass("boxed")) {
                                popline.switchBar($_this, function() {
                                    $_this.siblings("li").hide().end()
                                        .children(":text").show().end()
                                }, function() {
                                    $_this.children(":text").focus()
                                });
                                $_this.data('selection', window.getSelection().getRangeAt(0));
                                event.stopPropagation();
                            }
                        }
                    });

                    this.data("click-event-binded", true);
                }

            },
            afterHide: function() {
                this.find(":text").val('');
            }
        }
    });
})(jQuery);

// lists
;(function($) {

    $.popline.addButton({
        orderedList: {
            iconClass: "icon-list-ol",
            mode: "edit",
            action: function(event) {
                document.execCommand("InsertOrderedList");
            }
        },

        unOrderedList: {
            iconClass: "icon-list-ul",
            mode: "edit",
            action: function(event) {
                document.execCommand("InsertUnorderedList");
            }
        }
    });
})(jQuery);
