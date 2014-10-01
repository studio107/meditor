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

        /**
         * Plugin initialization
         * Инициализация плагина
         *
         * @param name
         * @param parent
         */
        initialize: function (name, parent) {
            this._name = name;
            this._parent = parent;
            this._number = parent.plugins.length;

            parent._i18n.addToDictionary(this.i18n, this.name);
        },

        /**
         * Current number of plugin
         * Текущий номер плагина
         *
         * @returns {*}
         */
        getNumber: function () {
            return this._number;
        },

        /**
         * Plugin short name (ex: 'text', 'video', etc)
         * Короткое имя плагина (например: 'text', 'video' ...)
         * @returns {*}
         */
        getName: function () {
            return this._name;
        },

        /**
         * Setting content to html block
         * Устанавливаем контент в html блок
         *
         * @param html
         * @returns {Block}
         */
        setHtmlBlock: function (html) {
            this._htmlBlock = html;
            this.attachHandlers();
            return this;
        },
        /**
         * Getting html block content
         * Получение контента html блока
         *
         * @returns {string}
         */
        getHtmlBlock: function () {
            return this._htmlBlock;
        },

        /**
         * Handlers initialization
         * Инициализация обработчиков
         */
        attachHandlers: function(){
            // Uses after setting content
        },

        getI18nName: function () {
            throw "Not implemented error";
        },

        /**
         * Internalization
         *
         * @param source
         * @param params
         * @returns {*}
         */
        t: function (source, params) {
            return this._parent.t(source, this.name, params);
        },

        /**
         * Block events
         * События блока
         */
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
         * Создание html-формы настроек
         *
         * @returns {string} html
         */
        renderSettings: function () {
            var fieldsets = this.getMainFieldsets();
            $.merge(fieldsets, this.getFieldsets());

            var fields = this.getMainFields();
            $.extend(fields, this.getFields());

            var $form = $('<form></form>').addClass(this._parent.settingsClass(false, 'form'));

            for (var key in fieldsets) {
                $form.append(this.renderFieldset(fieldsets[key], fields))
            }

            var $buttons = $('<div></div>').addClass(this._parent.settingsClass(false, 'buttons'));
            $buttons.append($('<button type="submit"></button>').html(this.t('Save')));

            $form.append($buttons);
            return $form;
        },

        /**
         * Render html fieldset for settings
         * Создание html-fieldset настроек
         *
         * @param fieldset
         * @param fields
         * @returns {*|jQuery|HTMLElement}
         */
        renderFieldset: function (fieldset, fields) {
            var $fieldset = $('<fieldset></fieldset>');
            $fieldset.append( $('<legend></legend>').html(fieldset.name));

            for (var key in fieldset.fields) {
                var name = fieldset.fields[key];
                $fieldset.append(this.renderField(name, fields[name]));
            }
            return $fieldset;
        },

        /**
         * Render field for settings
         * Создание поля настроек
         *
         * @param name
         * @param field
         * @returns {*|jQuery}
         */
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
                case 'text':
                    input = this.renderTextInput(name, field.getValue());
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

        /**
         * Render "select" field
         * Создание поля типа "select"
         *
         * @param name
         * @param value
         * @param values
         * @param multiple
         * @returns {*|jQuery|HTMLElement}
         */
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

        /**
         * Render "text" input
         * Создание поля типа "text"
         *
         * @param name
         * @param value
         * @returns {*|jQuery|HTMLElement}
         */
        renderTextInput: function(name, value) {
            var $input = $('<input type="text" />');
            $input.attr('name', name);
            if (value) {
                $input.val(value);
            }
            return $input;
        },

        /**
         * Default main fieldsets
         * Группы полей по умолчанию
         */
        getMainFieldsets: function () {
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

        /**
         * Plugin custom fieldsets
         * Группы полей плагина
         */
        getFieldsets: function() {
            return [];
        },

        /**
         * Default main fields
         * Поля по умолчанию
         */
        getMainFields: function () {
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
                        return true;
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
                        return true;
                    }
                }
            };
        },

        /**
         * Plugin custom fields
         * Поля плагина
         */
        getFields: function() {
            return [];
        },

        /**
         * Show settings form
         * Отобразить форму настроек
         */
        showSettings: function () {
            var me = this;
            this._parent.hideHelper();
            $(this.renderSettings()).mmodal({
                onSubmit: function(element) {
                    var form = $(element).closest('form');

                    var fields = me.getMainFields();
                    $.extend(fields, me.getFields());

                    var data = form.serializeArray();
                    var errors = me.validateSettings(data, fields);
                    if (errors === true) {
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

        /**
         * Show settings form errors
         * Показать ошибки в настройках
         */
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

        /**
         * Apply settings
         * Применить настройки
         */
        setSettings: function (data, fields) {
            for (var key in data) {
                var field_data = data[key];

                var name = field_data.name;
                var field = fields[name];

                field.setValue(field_data.value);
            }
        },

        /**
         * Validate settings
         * Проверить настройки на ошибки
         */
        validateSettings: function (data, fields) {
            var errors = {};

            for (var key in data) {
                var field_data = data[key];

                var name = field_data.name;
                var value = field_data.value;

                var field = fields[name];

                var field_errors = field.validate(value);
                if (field_errors !== true) {
                    errors[name] = field_errors;
                }
            }

            return _.size(errors) == 0 ? true : errors;
        },

        /**
         * Make clean plug
         * Создать объект-заглушку
         *
         * @returns {*|jQuery}
         */
        makePlug: function() {
            return $('<div/>').addClass(this._parent.plugClass(false));
        },

        /**
         * Render plug for block
         * Получение объекта-заглушки
         *
         * @returns {string} html
         */
        renderPlug: function () {
            return this.makePlug();
        },

        /**
         * Show plug for block
         * Отобразить заглушку для блока
         */
        showPlug: function() {
            $(this._htmlBlock).addClass('plugged');
        },

        /**
         * Hide plug
         * Скрыть заглушку для блока
         */
        hidePlug: function() {
            $(this._htmlBlock).removeClass('plugged');
        },

        /**
         * Make height resizer
         * Создать элемент изменения высоты блока
         *
         * @returns {*|jQuery}
         */
        makeHeightResizer: function(type) {
            var $heightResizer = $('<div/>');
            $heightResizer.append('<i class="fa fa-sort"></i>');
            return $heightResizer.data('type', type).addClass(this._parent.heightResizerClass(false));
        },

        /**
         * Render height resizer element
         * Получение элемента для изменения высоты блока
         *
         * @returns {string} html
         */
        renderHeightResizer: function (type) {
            type = type || 'min-height';
            return this.makeHeightResizer(type);
        },

        /**
         * Render html content of htmlblock for view
         * Получение контента блока для просмотра
         *
         * @returns {string}
         */
        getContent: function () {
            // TODO remove plugin data for clear html
            return this.getHtmlBlock();
        },

        /**
         * Getting html block
         * Получение html block
         *
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _render: function() {
            var block = this.getHtmlBlock();
            return $(block);
        },
        /**
         * Render html content of htmlblock for editing
         * Получение контента блока для редактирования
         *
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