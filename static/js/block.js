(function (window) {
    var Block = Class.extend({
        i18n: {
            'ru': {
                'Abstract block': 'Служебный блок'
            }
        },

        options: {
            hasPopup: false,
            hasToolbar: false,
            canVerticalResize: false,
            className: ''
        },

        _parent: undefined,
        _name: undefined,
        _number: undefined,
        _htmlBlock: '',
        _htmlToolbar: '',

        initialize: function (name, parent) {
            this._name = name;
            this._parent = parent;
            this._number = parent.plugins.length;

            parent._i18n.addToDictionary(this.i18n, this.name);
        },

        getNumber: function () {
            return this._number;
        },

        getName: function () {
            return this._name;
        },

        setHtmlBlock: function (html) {
            this._htmlBlock = html;
            this.attachHandlers();
            return this;
        },
        attachHandlers: function(){
            // Uses after setting content
        },
        getHtmlBlock: function () {
            return this._htmlBlock;
        },

        getI18nName: function () {
            throw "Not implemented error";
        },

        t: function (source, params) {
            return this._parent.t(source, this.name, params);
        },

        events: function () {
            return {
                onClick: $.noop,
                onResize: $.noop,
                // TODO event on close (remove || delete) current block
                onClose: $.noop
            }
        },



        /**
         * Render html content for block toolbar
         * @returns {string} html
         */
        renderToolbar: function () {
            var me = this;

            // TODO ugly, refactoring
            var $toolbar = this._htmlToolbar = $('<nav/>');
            $toolbar.addClass(this._parent.helpers_class(false));

            var move = this.renderButton(this._parent.move_class(false), '<i class="icon-move"></i>'),
                del = this.renderButton(this._parent.delete_class(false), '<i class="icon-x"></i>');

            $toolbar.append(move, del);

            return $toolbar;
        },

        renderResizeHandler: function () {
            return this.renderButton(this._parent.resizer_class(false));
        },
        renderHighlightHelper: function(){
            return $('<div/>').addClass(this._parent.highlight_helper_class(false));
        },
        renderButton: function (className, html) {
            var $button = $('<span/>');
            $button.addClass(className).append(html || '');
            return $button;
        },

        /**
         * Render html content for block popup
         * @returns {string} html
         */
        renderPopup: function () {
            return '';
        },
        /**
         * Render html content of htmlblock for view
         * @returns {string}
         */
        getContent: function () {
            // TODO remove plugin data for clear html
            return this.getHtmlBlock();
        },
        _render: function() {
            var block = this.getHtmlBlock(),
                $toolbar = this.renderToolbar(),
                $highlight = this.renderHighlightHelper(),
                $resizer = this.renderResizeHandler();

            var $block = $(block);
            $block.append($toolbar, $resizer, $highlight);
            return $block;
        },
        /**
         * Render html content of htmlblock for editing
         * @returns {string}
         */
        render: function () {
            return this._render()[0];
        }
    });

    (function () {
        if (typeof Block.prototype.uniqueId == "undefined") {
            var id = 0;
            Block.prototype.uniqueId = function () {
                if (typeof this.__uniqueid == "undefined") {
                    this.__uniqueid = ++id;
                }
                return this.parent.id + this.__uniqueid;
            };
        }
    })();

    window.meditorBlock = Block;

    return Block;
}(window));