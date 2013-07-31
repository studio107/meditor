(function(window) {
    var Block = Class.extend({
        name: undefined,
        number: undefined,
        htmlblock: undefined,
        i18n: {
            'ru': {
                'hello world': 'привет бля'
            }
        },
        options: {
            hasPopup: false,
            hasToolbar: false,
            canVerticalResize: false,
            className: ''
        },

        events: function () {
            return {
                onClick: function () {
                    console.log('onClick', this);
                },
                onResize: function () {
                    console.log('onResize');
                }
            }
        },

        /**
         * Render html content for block toolbar
         * @returns {string} html
         */
        renderToolbar: function () {
            return '';
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
        render: function () {
            return this.htmlblock;
        },
        /**
         * Render html content of htmlblock for editing
         * @returns {string}
         */
        editable: function () {
            return this.htmlblock;
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