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
                onAfterRender: $.noop,
                onHeightResize: $.noop,
                onAfterMove: $.noop,
                onColumnChangeSize: $.noop
            }
        },

        /**
         * Render html content for settings
         * @returns {string} html
         */
        renderSettings: function () {
            var fieldsets = this.getFieldsets();
            var fields = this.getFields();

            var $form = $('<form></form>').addClass(this._parent.settingsClass(false, 'form'));

            for (var key in fieldsets) {
                $form.append(this.renderFieldset(fieldsets[key], fields))
            }

            var $buttons = $('<div></div>').addClass(this._parent.settingsClass(false, 'buttons'));
            $buttons.append($('<button type="submit"></button>').html(this.t('Save')));

            $form.append($buttons);
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
            var input = '';
            switch (field.type) {
                case 'select':
                    var multiple = false;
                    if (field.multiple) {
                        multiple = field.multiple;
                    }
                    input = this.renderSelect(name, field.getValue(), field.values, multiple);
                    break;
            }

            var id = this._parent.settingsId(name);

            var row = $('<div></div>').addClass(this._parent.settingsClass(false, 'row'));
            row.append($('<label></label>').html(field.label).attr('for', '#' + id));
            row.append(input.attr('id', id).addClass(this._parent.settingsClass(false, 'input')));
            row.append($('<ul></ul>').addClass(this._parent.settingsClass(false, 'errors')));

            if (field.hint) {
                row.append($('<div></div>').addClass(this._parent.settingsClass(false, 'hint')).html(field.hint));
            }

            return row;
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
                        'small',
                        'medium'
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
                    label: this.t('Small screen'),
                    values: {
                        'default': this.t('Default action'),
                        'small-1': this.t('Columns: ') + 1,
                        'small-2': this.t('Columns: ') + 2,
                        'small-3': this.t('Columns: ') + 3,
                        'small-4': this.t('Columns: ') + 4,
                        'small-5': this.t('Columns: ') + 5,
                        'small-6': this.t('Columns: ') + 6,
                        'small-7': this.t('Columns: ') + 7,
                        'small-8': this.t('Columns: ') + 8,
                        'small-9': this.t('Columns: ') + 9,
                        'small-10': this.t('Columns: ') + 10,
                        'small-11': this.t('Columns: ') + 11,
                        'small-12': this.t('Columns: ') + 12
                    },
                    getValue: function () {
                        var value = 'default';
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function(c){
                            if (c.startsWith('small-')) {
                                value = c;
                            }
                        });
                        return [value];
                    },
                    setValue: function (value) {
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function(c){
                            if (c.startsWith('small-')) {
                                $column.removeClass(c);
                            }
                        });
                        if (value != 'default') {
                            $column.addClass(value);
                        }
                    },
                    validate: function (value) {
                        return false;
                    }
                },
                medium: {
                    type: 'select',
                    multiple: false,
                    label: this.t('Medium screen'),
                    values: {
                        'default': this.t('Default action'),
                        'medium-1': this.t('Columns: ') + 1,
                        'medium-2': this.t('Columns: ') + 2,
                        'medium-3': this.t('Columns: ') + 3,
                        'medium-4': this.t('Columns: ') + 4,
                        'medium-5': this.t('Columns: ') + 5,
                        'medium-6': this.t('Columns: ') + 6,
                        'medium-7': this.t('Columns: ') + 7,
                        'medium-8': this.t('Columns: ') + 8,
                        'medium-9': this.t('Columns: ') + 9,
                        'medium-10': this.t('Columns: ') + 10,
                        'medium-11': this.t('Columns: ') + 11,
                        'medium-12': this.t('Columns: ') + 12
                    },
                    getValue: function () {
                        var value = 'default';
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function(c){
                            if (c.startsWith('medium-')) {
                                value = c;
                            }
                        });
                        return [value];
                    },
                    setValue: function (value) {
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function(c){
                            if (c.startsWith('medium-')) {
                                $column.removeClass(c);
                            }
                        });
                        if (value != 'default') {
                            $column.addClass(value);
                        }
                    },
                    validate: function (value) {
                        return false;
                    }
                }
            };
        },

        showSettings: function () {
            var me = this;
            this._parent.hideHelper();
            $(this.renderSettings()).mmodal({
                onSubmit: function(element) {
                    var form = $(element).closest('form');
                    var fields = me.getFields();
                    var data = form.serializeArray();
                    var errors = me.validateSettings(data, fields);
                    if (errors === false) {
                        me.setSettings(data, fields);
                        $('.mmodal-close').trigger('click');
                    }else{
                        me.showSettingsErrors(errors);
                    }
                    return false;
                },
                skin: this._parent.settingsClass(false, 'modal')
            });
        },

        showSettingsErrors: function (errors) {
            for (var name in errors) {
                var id = this._parent.settingsId(name);
                var error_list = errors[name];

                var $errors_list = $('#' + id).siblings(this._parent.settingsClass(true,'errors'));
                $errors_list.html('');

                for (var key in error_list) {
                    var error = error_list[key];
                    var $li = $('<li></li>').html(error);
                    $errors_list.append($li);
                }
            }
        },

        setSettings: function (data, fields) {
            for (var key in data) {
                var field_data = data[key];

                var name = field_data.name;
                var field = fields[name];

                field.setValue(field_data.value);
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
         * Make height resizer
         * @returns {*|jQuery}
         */
        makeHeightResizer: function(type) {
            var $heightResizer = $('<div/>');
            $heightResizer.append('<i class="fa fa-sort"></i>');
            return $heightResizer.data('type', type).addClass(this._parent.heightResizerClass(false));
        },

        /**
         * Render plug for block
         * @returns {string} html
         */
        renderHeightResizer: function (type) {
            type = type || 'min-height';
            return this.makeHeightResizer(type);
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