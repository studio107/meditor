var EditorCore = function (element, options, i18n) {
    if (element === undefined) return;

    this.element = element;
    this.options = $.extend(this.options, options);
    this.cn = this.options.classname;

    this._i18n = i18n;
    this._language = options['language'] || i18n.getLanguage();

    this.bind();
    this.start();
    return this;
};

EditorCore.prototype = {
    /**
     * Настройки по умолчанию
     */
    options: {
            plugins: {},
            language: 'en',
            option: 'value',
            classname: 'meditor',
            localization: {
            add_block: 'Add block'
        },
        columns: 12,
        colsize: 54,
        colmargin: 30
    },
    /**
     * Элемент, над которым выполняются действия
     */
    element: undefined,
    editor: undefined,
    controls: undefined,
    area: undefined,
    temp: undefined,
    cn: undefined,

    _language: undefined,
    _i18n: undefined,

    plugins: [],
    blocks: {},
    blocks_menu: {},

    movable: undefined,
    resizable: undefined,
    resizable_prev: undefined,
    i18n: undefined,

    counter: 0,

    t: function(source, category) {
        return this._i18n.t(source, category || 'core');
    },
    block_class: function (dotted) {
        var cn = this.cn + '-block';
        return dotted ? '.' + cn : cn;
    },
    row_class: function (dotted) {
        var cn = this.cn + '-row';
        return dotted ? '.' + cn : cn;
    },
    col_class: function (dotted, value) {
        var append = '';
        if (value)
            append = value.toString();
        var cn = 'col-' + append;
        return dotted ? '.' + cn : cn;
    },
    highlighted_classes: function () {
        return ['top', 'left', 'right', 'bottom'];
    },
    highlighted_class: function (direction, dotted) {
        if (direction) {
            var cn = this.cn + '-highlighted-' + direction;
            return dotted ? '.' + cn : cn;
        }
        var cn = '[class*=".' + this.cn + '-highlighted"]';
        return cn;
    },
    area_class: function (dotted) {
        var cn = this.cn + '-area';
        return dotted ? '.' + cn : cn;
    },
    controls_class: function (dotted) {
        var cn = this.cn + '-controls';
        return dotted ? '.' + cn : cn;
    },
    move_class: function (dotted) {
        var cn = this.cn + '-move';
        return dotted ? '.' + cn : cn;
    },
    delete_class: function (dotted) {
        var cn = this.cn + '-delete';
        return dotted ? '.' + cn : cn;
    },
    moving_class: function (dotted) {
        var cn = this.cn + '-moving';
        return dotted ? '.' + cn : cn;
    },
    helpers_class: function (dotted) {
        var cn = this.cn + '-helpers';
        return dotted ? '.' + cn : cn;
    },
    resizer_class: function (dotted) {
        var cn = this.cn + '-resizer';
        return dotted ? '.' + cn : cn;
    },
    /**
     * "Навешиваем" события
     */
    bind: function () {
        var $me = this;
        $($me.element).closest('form').on('submit', function () {
            $($me.element).val($me.get_content());
            return true;
        });
        $(document).on('click', $me.delete_class(true), function () {
            $(this).closest($me.block_class(true)).remove();
            $me.clear_strings();
        });
    },
    start: function () {
        $(this.element).hide(0);

        var editor = $('<div/>', {class: this.cn});
        var controls = $('<div/>', {class: this.controls_class(false)});
        var area = $('<div/>', {class: this.area_class(false)});
        var temp = $('<div/>', {style: 'display: none;'});

        this.editor = editor;
        this.controls = controls;
        this.area = area;
        this.temp = temp;

        this.create_controls();
        this.set_content();
        $(editor).append(controls, area, temp);
        $(this.element).after(this.editor);
        this.init_sortable();
    },
    init_sortable: function () {
        var $me = this;
        var moving_selector = this.block_class(true) + ' ' + this.move_class(true);
        $(document).on('mousedown', moving_selector, function () {
            $me.movable = $(this).closest($me.block_class(true));
            $me.start_move();
        });
        $(document).on('mousedown', this.block_class(true) + ' ' + $me.resizer_class(true), function () {
            $me.resizable = $(this).closest($me.block_class(true));
            $me.resizable_prev = $($me.resizable).prev();
            if ($me.resizable_prev.length) {
                $me.start_resize();
            } else {
                $me.resizable = undefined;
                $me.resizable_prev = undefined;
            }
        });
    },
    getPlugin: function(name){
        if (this.options.plugins[name]){
            return this.options.plugins[name];
        }else{
            return false;
        }
    },
    getBlockPlugin: function(block){
        return this.plugins[parseInt($(block).attr('rel'))];
    },
    /**
     * Начали перетаскивать
     */
    start_move: function () {
        var $me = this;
        $($me.movable).addClass($me.moving_class(false));
        $('body').addClass('unselectable');
        $('body').addClass('moving');
        $(document).on('mouseup', function (e) {
            var offset = {'left': e.offsetX, 'top': e.offsetY};
            $me.stop_move(e.target, offset);
        });
        $(this.block_class(true)).on('mouseout', function () {
            $me.clear_highlight();
        });
        $(this.block_class(true)).on('mousemove', function (e) {
            var offset = {'left': e.offsetX, 'top': e.offsetY};
            $me.clear_highlight();
            $me.highlight_block(this, offset);
        });
    },
    /**
     * Закончили перетаскивать
     * @param drop_to
     * @param offset
     */
    stop_move: function (drop_to, offset) {

        drop_to = $(drop_to);
        $(this.movable).removeClass(this.moving_class(false));
        $('body').removeClass('unselectable');
        $('body').removeClass('moving');
        this.clear_highlight();
        $(this.block_class(true)).off('mousemove');
        $(this.block_class(true)).off('mouseout');
        $(document).off('mouseup');


        if (!drop_to.hasClass(this.block_class(false)) && (drop_to.closest(this.block_class(true)).length))
                drop_to = drop_to.closest(this.block_class(true));

        if (drop_to.hasClass(this.block_class(false)))
            if (!drop_to.is($(this.movable))) {

                this.dropped($(this.movable), drop_to, this.get_direction(drop_to, offset));
            } else if (!drop_to.hasClass(this.col_class(false, this.options.columns))) {
                this.dropped($(this.movable), drop_to, this.get_direction(drop_to, offset, 'y'));
            }

        this.movable = false;
    },
    /**
     * Расчет изменений
     * @param element
     * @param to
     * @param direction
     */
    dropped: function (element, to, direction) {
        var $me = this;


        if (direction == 'top' || direction == 'bottom') {
            var row = this.create_pure_row();
            var to_row = to.closest(this.row_class(true));
            this.set_column_value(element, this.options.columns);
            if (!element.hasClass('first'))
                element.addClass('first');
            row.append(element);

            if (direction == 'top') {
                to_row.before(row);
            } else if (direction == 'bottom') {
                to_row.after(row);
            }
        } else if (direction == 'left' || direction == 'right') {
            var col_element = $me.get_column_value(element);
            var col_to = $me.get_column_value(to);

            if (col_to > 1) {
                var new_col_element = Math.round(col_to / 2);
                var new_col_to = col_to - new_col_element;
                $me.set_column_value(element, new_col_element);
                $me.set_column_value(to, new_col_to);
                if (direction == 'left') {
                    $(to).before(element);
                } else if (direction == 'right') {
                    $(to).after(element)
                }
            }
        }

        this.clear_strings();
    },
    /**
     * Подсветить блок
     * @param highlight_this // HTMLElement
     * @param offset // {'left': int,'top': int}
     */
    highlight_block: function (highlight_this, offset) {
        this.clear_highlight();
        var element = $(highlight_this);
        if (element.hasClass(this.block_class(false))) {
            var direction = 'top';
            if (!element.is($(this.movable))) {
                direction = this.get_direction(element, offset);
            } else if (!element.hasClass(this.col_class(false, this.options.columns))) {
                direction = this.get_direction(element, offset, 'y');
            } else {
                return false;
            }

            if (direction == 'top' || direction == 'bottom') {
                element.closest(this.row_class(true)).addClass(this.highlighted_class(direction, false));
            } else {
                element.addClass(this.highlighted_class(direction, false));
            }
        }
    },
    /**
     * Убрать подсветку блоков
     */
    clear_highlight: function () {
        var i = 0;
        var directions = this.highlighted_classes();
        var direction = '';
        for (i in directions) {
            direction = directions[i];
            $(this.highlighted_class(direction, true)).removeClass(this.highlighted_class(direction, false));
        }
    },
    /**
     * Прибираемся в строчках
     */
    clear_strings: function () {
        var $me = this;
        var last_element = undefined;
        var counted = 0;

        $(this.row_class(true)).each(function () {
            if ($(this).children().length == 0) {
                $(this).remove()
            } else {
                counted = 0;
                $(this).children($me.block_class(true)).each(function (index) {
                    if (index == 0) {
                        if (!$(this).hasClass('first'))
                            $(this).addClass('first');
                    } else {
                        $(this).removeClass('first');
                    }
                    counted += $me.get_column_value($(this));
                });
                if (counted < $me.options.columns) {
                    var block = $(this).children($me.block_class(true)).last();
                    var current = $me.get_column_value(block);
                    $me.set_column_value(block, $me.options.columns - counted + current);
                }
            }
        });
    },
    /**
     * Получить направление движения
     */
    get_direction: function (elem, offset, only) {
        var direction = 'top';

        if (only == 'y') {
            direction = (offset.top / elem.height() > 0.5) ? 'bottom' : 'top';
            return direction;
        }
        var nw = {'x': 0, 'y': 0};
        var ne = {'x': elem.width(), 'y': 0};
        var sw = {'x': 0, 'y': elem.height()};
        var se = {'x': elem.width(), 'y': elem.height()};

        var x = offset.left;
        var y = offset.top;

        var nw_se = ((x - nw.x) / (se.x - nw.x)) - ((y - nw.y) / (se.y - nw.y));
        var ne_sw = ((x - ne.x) / (sw.x - ne.x)) - ((y - ne.y) / (sw.y - ne.y));

        if (nw_se > 0) {
            if (ne_sw > 0)
                direction = 'top';
            else
                direction = 'right';
        } else {
            if (ne_sw > 0)
                direction = 'left';
            else
                direction = 'bottom';
        }

        return direction;
    },

    /**
     * Начали ресайз
     */
    start_resize: function () {
        var $me = this;
        $('body').addClass('unselectable');
        $('body').addClass('resizing');

        $(document).on('mouseup', function (e) {
            var offset = {'left': e.offsetX, 'top': e.offsetY};
            $me.stop_resize(e.target, offset);
        });
        var move_function = function (e) {
            var offset = {'left': e.offsetX, 'top': e.offsetY};
            $me.resizing(e.currentTarget, offset);
        };
        $(this.resizable).on('mousemove', move_function);
        $($(this.resizable).prev()).on('mousemove', move_function);
    },
    stop_resize: function () {
        $('body').removeClass('unselectable');
        $('body').removeClass('resizing');

        $(document).off('mouseup');
        $(this.resizable).off('mousemove');
        $($(this.resizable).prev()).off('mousemove');
    },
    resizing: function (target, offset) {
        var displacement = 0;
        target = $(target);

        if ($(target).is($(this.resizable))) {
            displacement = offset.left;
            if (displacement > this.options.colmargin) {
                if (this.dec_column_value(target, 1)) {
                    this.inc_column_value($(this.resizable_prev), 1);
                }
            }
        } else if ($(target).is($(this.resizable_prev))) {
            displacement = target.width() - offset.left;
            if (displacement > this.options.colmargin) {
                if (this.dec_column_value(target, 1)) {
                    this.inc_column_value($(this.resizable), 1);
                }
            }
        }
    },
    /**
     * Получение ширины колонки
     */
    get_column_value: function (block) {
        var classes = $(block)[0].classList;

        var cn = '';
        var col_class = this.col_class(false);

        var i = 0;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(col_class) == 0) {
                return parseInt(cn.substr(col_class.length))
            }
        }
        return 0;
    },
    /**
     * Установка ширины колонки
     * @param block
     * @param value
     */
    set_column_value: function (block, value) {
        var current = this.get_column_value(block);
        $(block).removeClass(this.col_class(false, current));
        $(block).addClass(this.col_class(false, value));
    },
    /**
     * Увеличение блока
     * @param block
     * @param value
     */
    inc_column_value: function (block, value) {
        var curr = this.get_column_value(block);
        this.set_column_value(block, curr + value);
    },
    /**
     * Уменьшение блока
     * @param block
     * @param value
     */
    dec_column_value: function (block, value) {
        var curr = this.get_column_value(block);
        if (curr - value > 0) {
            this.set_column_value(block, curr - value);
            return true;
        } else {
            return false;
        }
    },
    /**
     * Cоздание чистой строки
     * @returns HTMLElement
     */
    create_pure_row: function () {
        return $('<div/>', {
            class: this.cn + '-row'
        });
    },
    /**
     * Добавляем контролы к редактору
     */
    create_controls: function () {
        var $me = this;
        var add_block = $('<button/>', {
            class: 'button add-block',
            html: $me.options.localization.add_block
        });
        $(add_block).on('click', function () {
            $me.create_block();
            return false;
        });
        $(this.controls).append(add_block)
    },
    /**
     * Создание нового блока
     */
    create_block: function () {
        var blockHtml = $('<div/>', {
            class: this.block_class(false) + ' col-12 first',
            'data-plugin': 'text'
        });
        this.add_block(blockHtml);
    },
    /**
     * Добавление нового блока на страничку
     * @param block
     */
    add_block: function (block) {
        var row = this.create_pure_row();
        var maked = this.make_block(block);
        row.append(maked);
        $(this.area_class(true)).append(row);
    },
    /**
     * Установка прошлого контента
     */
    set_content: function () {
        var content = $(this.element).val();
        if (!content) {
            content = $('<div/>', {
                class: this.cn + '-block col-12 first',
                'data-plugin': 'text'
            });
        }
        this.set_content_by_rows(content);
    },
    /**
     * Разбиваем чистый блочный контент по строкам
     * @param content
     * @returns html
     */
    set_content_by_rows: function (content) {
        var $me = this;
        var out = $('<div/>');
        var row = this.create_pure_row();
        $(content).filter(this.block_class(true)).each(function (index) {
            if ($(this).hasClass('first') && index != 0) {
                $($me.area).append(row);
                row = $me.create_pure_row();
            }
            row.append($me.make_block(this));
        });
        $($me.area).append(row);
    },
    /**
     * Подготовка блока к добавлению на страничку
     * @param element
     */
    make_block: function (element) {
        var plugin_name = $(element).data('plugin');
        var plugin = undefined;
        var instance = undefined;
        if (!(plugin_name && (plugin = this.getPlugin(plugin_name)))){
            plugin_name = 'lost';
            plugin = this.getPlugin(plugin_name);
        }
        instance = new plugin();
        var editable_element = this.init_plugin(instance,plugin_name,element);
        return this.append_defaults(editable_element);
    },
    init_plugin: function(instance, name, element){
        instance.name = name;
        this._i18n.addToDictionary(instance.i18n, name);
        this.plugins.push(instance);

        instance.number = this.plugins.length - 1;
        $(element).attr('rel',instance.number);

        var plugin_class = name + '-block';
        if (!$(element).hasClass(plugin_class))
            $(element).addClass(plugin_class);

        $(element).attr('data-plugin',name);

        instance.htmlblock = element;

        return element;
    },
    /**
     * Подключение стандартных элементов к блоку
     * @param block
     * @returns {*|jQuery|HTMLElement}
     */
    append_defaults: function(block){
        /**
         * Создаем хелперы
         */
        var helpers = $('<div/>', {
            class: this.helpers_class(false)
        });
        var move = $('<div/>', {
            class: this.move_class(false),
            html: '<i class="icon-move"></i>'
        });
        var remove = $('<div/>', {
            class: this.delete_class(false),
            html: '<i class="icon-x"></i>'
        });
        helpers.append(move);
        helpers.append(remove);
        $(block).append(helpers);

        /**
         * Создаем ресайзер
         */
        var resizer = $('<div/>', {
            class: this.resizer_class(false)
        });
        $(block).append(resizer);

        return block;
    },
    get_content: function () {
        var $me = this;
        var out = $('<div/>');
        $(this.area).find(this.block_class(true)).each(function () {
            var cleared = $me.clean_block($(this));
            out.append(cleared);
        });
        return out.html();
    },
    clean_block: function(block){
        var plugin = this.getBlockPlugin(block);
        block = plugin.render();

        $(block).find(this.helpers_class(true)).remove();
        $(block).find(this.resizer_class(true)).remove();

        return block;
    }
};