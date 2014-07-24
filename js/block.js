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
                onClose: $.noop,
                onAfterRender: $.noop
            }
        },

        /**
         * Render html content for settings
         * @returns {string} html
         */
        renderSettings: function () {
            var fieldsets = this.getFieldsets();
            var fields = this.getFields();

            var $form = $('<form></form>');

            for (var key in fieldsets) {
                $form.append(this.renderFieldset(fieldsets[key], fields))
            }

            $form.append($('<button type="submit"></button>').html(this.t('Save')));
            return $form;
        },

        renderFieldset: function (fieldset, fields) {
            var $fieldset = $('<fieldset></fieldset>');
            $fieldset.append( $('<legend></legend>').html(fieldset.name));

            for (var key in fieldset.fields) {
                var name = fieldset.fields[key];
                $fieldset.append(this.renderField(name, fields[name]));
            }
            return $fieldset;
        },

        renderField: function (name, field) {
            switch (field.type) {
                case 'select':
                    var multiple = false;
                    if (field.multiple) {
                        multiple = field.multiple;
                    }
                    return this.renderSelect(name, field.getValue(), field.values, multiple);
                    break;
            }
            return '';
        },

        renderSelect: function (name, value, values, multiple) {
            var $select = $('<select></select>');

            $select.attr('name', name);

            if( !Object.prototype.toString.call( value ) === '[object Array]' ) {
                value = [value];
            }

            for (var key in values) {
                var $option = $('<option></option>');
                $option.attr('value', key);
                $option.html(values[key]);
                if (_.contains(value, key)) {
                    $option.attr('selected', 'selected')
                }
                $select.append($option);
            }

            if (multiple) {
                $select.attr('multiple', 'multiple');
            }

            return $select;
        },

        getFieldsets: function () {
            return [
                {
                    name: this.t('Main settings'),
                    fields: [
                        'small'
                    ]
                }
            ];
        },

        getFields: function () {
            var me = this;
            return {
                small: {
                    type: 'select',
                    multiple: false,
                    values: {
                        'default': this.t('Default action'),
                        'small-1': this.t('1 column'),
                        'small-2': this.t('2 columns'),
                        'small-3': this.t('3 columns'),
                        'small-4': this.t('4 columns'),
                        'small-5': this.t('5 columns'),
                        'small-6': this.t('6 columns'),
                        'small-7': this.t('7 columns'),
                        'small-8': this.t('8 columns'),
                        'small-9': this.t('9 columns'),
                        'small-10': this.t('10 columns'),
                        'small-11': this.t('11 columns'),
                        'small-12': this.t('12 columns')
                    },
                    getValue: function () {
                        var value = 'default';
                        $(me._htmlBlock).classes(function(c){
                            if (c.startsWith('small-')) {
                                value = c;
                            }
                        });
                        return [value];
                    },
                    setValue: function (value) {
                        console.log('Set value');
                        console.log(value);
                    },
                    /**
                     * Returns false if valid or string array with errors
                     * @param value
                     * @returns {boolean}
                     */
                    validate: function (value) {
                        console.log('Validation');
                        return false;
                    }
                }
            };
        },

        showSettings: function () {
            var me = this;
            $(this.renderSettings()).mmodal({
                onSubmit: function(element) {
                    var form = $(element).closest('form');
                    var fields = me.getFields();
                    var data = form.serializeArray();
                    var errors = me.validateSettings(data, fields);
                    if (errors === false) {
                        me.setSettings(data, fields);
                    }
                    return false;
                }
            });
        },

        setSettings: function (data, fields) {
            for (var key in data) {
                var field_data = data[key];

                var name = field_data.name;
                var value = field_data.value;

                var field = fields[name];

                var field_errors = field.setValue(value);
            }
        },

        validateSettings: function (data, fields) {
            var errors = {};

            for (var key in data) {
                var field_data = data[key];

                var name = field_data.name;
                var value = field_data.value;

                var field = fields[name];

                var field_errors = field.validate(value);
                if (field_errors !== false) {
                    errors[name] = field_errors;
                }
            }

            return _.size(errors) == 0 ? false : errors;
        },

        /**
         * Make clean plug
         * @returns {*|jQuery}
         */
        makePlug: function() {
            return $('<div/>').addClass(this._parent.plugClass(false));
        },

        /**
         * Render plug for block
         * @returns {string} html
         */
        renderPlug: function () {
            return this.makePlug();
        },

        /**
         * Show plug for block
         */
        showPlug: function() {
            $(this._htmlBlock).addClass('plugged');
        },

        /**
         * Hide plug
         */
        hidePlug: function() {
            $(this._htmlBlock).removeClass('plugged');
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
            var block = this.getHtmlBlock();
            return $(block);
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