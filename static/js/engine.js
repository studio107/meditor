/**
 * TODO class is too big! refactor it
 *
 * Editor core class
 *
 * @param $element
 * @param options
 * @param i18n
 * @returns {*}
 * @constructor
 */

var EditorCore = function ($element, options, i18n) {
    this.$element = $element;
    this.options = $.extend(this.options, options);
    this.cn = this.options.classname;

    this._i18n = i18n;
    this._language = options['language'] || i18n.getLanguage();

    return this.init();
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
        columns: 12,
        colsize: 54,
        colmargin: 30
    },

    /**
     * Элемент, над которым выполняются действия
     */
    $element: undefined,
    $controls: undefined,

    editor: undefined,
    area: undefined,
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

    init: function () {
        // @TODO move to external i18n language file
        this._i18n.addToDictionary({
            ru: {
                'Add block': 'Добавить блок',
                'You really want to remove this block?': 'Вы действительно хотите удалить данный блок?'
            }
        }, 'core');

        this.bindEvents();

        this.$element.hide();

        var editor = $('<div/>', {class: this.cn}),
            area = $('<div/>', {class: this.area_class(false)});

        this.editor = editor;
        this.area = area;

        this.setContent();
        $(editor).append(this.createControls(), area);
        this.$element.after(this.editor);
        this.initSortable();

        return this;
    },

    t: function (source, category, params) {
        return this._i18n.t(source, category || 'core', params || {}, this._language);
    },
    blockClass: function (dotted) {
        var cn = this.cn + '-block';
        return dotted ? '.' + cn : cn;
    },
    rowClass: function (dotted) {
        var cn = this.cn + '-row';
        return dotted ? '.' + cn : cn;
    },
    colClass: function (dotted, value) {
        var append = '';
        if (value)
            append = value.toString();
        var cn = 'col-' + append;
        return dotted ? '.' + cn : cn;
    },
    highlightedClasses: function () {
        return ['top', 'left', 'right', 'bottom'];
    },
    highlightedClass: function (direction, dotted) {
        var cn;
        if (direction) {
            cn = this.cn + '-highlighted-' + direction;
            return dotted ? '.' + cn : cn;
        }
        cn = '[class*=".' + this.cn + '-highlighted"]';
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
    bindEvents: function () {
        var me = this;

        this.$element.closest('form').on('submit', function () {
            me.$element.val(me.getContent());
            return true;
        });
        $(document).on('click', me.delete_class(true), function () {
            var confirmMessage = me.t('You really want to remove this block?');

            if (confirm(confirmMessage)) {
                $(this).closest(me.blockClass(true)).remove();
                me.clearStrings();
            }
        });
    },

    initSortable: function () {
        var $me = this;
        var moving_selector = this.blockClass(true) + ' ' + this.move_class(true);
        $(document).on('mousedown', moving_selector, function () {
            $me.movable = $(this).closest($me.blockClass(true));
            $me.startMove();
        });
        $(document).on('mousedown', this.blockClass(true) + ' ' + $me.resizer_class(true), function () {
            $me.resizable = $(this).closest($me.blockClass(true));
            $me.resizable_prev = $($me.resizable).prev();
            if ($me.resizable_prev.length) {
                $me.startResize();
            } else {
                $me.resizable = undefined;
                $me.resizable_prev = undefined;
            }
        });
    },
    getPlugin: function (name) {
        var plugins = this.options.plugins;
        return name in plugins ? plugins[name] : false;
    },
    getBlockPlugin: function (block) {
        return this.plugins[parseInt($(block).attr('rel'))];
    },
    /**
     * Начали перетаскивать
     */
    startMove: function () {
        var $me = this;
        $($me.movable).addClass($me.moving_class(false));
        $('body').addClass('unselectable');
        $('body').addClass('moving');
        $(document).on('mouseup', function (e) {
            var offset = {'left': e.offsetX, 'top': e.offsetY};
            $me.stopMove(e.target, offset);
        });
        $(this.blockClass(true)).on('mouseout', function () {
            $me.clearHighlight();
        });
        $(this.blockClass(true)).on('mousemove', function (e) {
            var offset = {'left': e.offsetX, 'top': e.offsetY};
            $me.clearHighlight();
            $me.highlightBlock(this, offset);
        });
    },
    /**
     * Закончили перетаскивать
     * @param drop_to
     * @param offset
     */
    stopMove: function (drop_to, offset) {
        drop_to = $(drop_to);
        $(this.movable).removeClass(this.moving_class(false));
        $('body').removeClass('unselectable');
        $('body').removeClass('moving');
        this.clearHighlight();
        $(this.blockClass(true)).off('mousemove');
        $(this.blockClass(true)).off('mouseout');
        $(document).off('mouseup');


        if (!drop_to.hasClass(this.blockClass(false)) && (drop_to.closest(this.blockClass(true)).length))
            drop_to = drop_to.closest(this.blockClass(true));

        if (drop_to.hasClass(this.blockClass(false)))
            if (!drop_to.is($(this.movable))) {

                this.dropped($(this.movable), drop_to, this.getDirection(drop_to, offset));
            } else if (!drop_to.hasClass(this.colClass(false, this.options.columns))) {
                this.dropped($(this.movable), drop_to, this.getDirection(drop_to, offset, 'y'));
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
            var row = this.createPureRow();
            var to_row = to.closest(this.rowClass(true));
            this.setColumnValue(element, this.options.columns);
            if (!element.hasClass('first'))
                element.addClass('first');
            row.append(element);

            if (direction == 'top') {
                to_row.before(row);
            } else if (direction == 'bottom') {
                to_row.after(row);
            }
        } else if (direction == 'left' || direction == 'right') {
            var col_element = $me.getColumnValue(element);
            var col_to = $me.getColumnValue(to);

            if (col_to > 1) {
                var new_col_element = Math.round(col_to / 2);
                var new_col_to = col_to - new_col_element;
                $me.setColumnValue(element, new_col_element);
                $me.setColumnValue(to, new_col_to);
                if (direction == 'left') {
                    $(to).before(element);
                } else if (direction == 'right') {
                    $(to).after(element)
                }
            }
        }

        this.clearStrings();
    },
    /**
     * Подсветить блок
     * @param highlight_this // HTMLElement
     * @param offset // {'left': int,'top': int}
     */
    highlightBlock: function (highlight_this, offset) {
        this.clearHighlight();
        var element = $(highlight_this);
        if (element.hasClass(this.blockClass(false))) {
            var direction = 'top';
            if (!element.is($(this.movable))) {
                direction = this.getDirection(element, offset);
            } else if (!element.hasClass(this.colClass(false, this.options.columns))) {
                direction = this.getDirection(element, offset, 'y');
            } else {
                return false;
            }

            if (direction == 'top' || direction == 'bottom') {
                element.closest(this.rowClass(true)).addClass(this.highlightedClass(direction, false));
            } else {
                element.addClass(this.highlightedClass(direction, false));
            }
        }
    },
    /**
     * Убрать подсветку блоков
     */
    clearHighlight: function () {
        var i = 0;
        var directions = this.highlightedClasses();
        var direction = '';
        for (i in directions) {
            direction = directions[i];
            $(this.highlightedClass(direction, true)).removeClass(this.highlightedClass(direction, false));
        }
    },
    /**
     * Прибираемся в строчках
     */
    clearStrings: function () {
        var $me = this;
        var last_element = undefined;
        var counted = 0;

        $(this.rowClass(true)).each(function () {
            if ($(this).children().length == 0) {
                $(this).remove()
            } else {
                counted = 0;
                $(this).children($me.blockClass(true)).each(function (index) {
                    if (index == 0) {
                        if (!$(this).hasClass('first'))
                            $(this).addClass('first');
                    } else {
                        $(this).removeClass('first');
                    }
                    counted += $me.getColumnValue($(this));
                });
                if (counted < $me.options.columns) {
                    var block = $(this).children($me.blockClass(true)).last();
                    var current = $me.getColumnValue(block);
                    $me.setColumnValue(block, $me.options.columns - counted + current);
                }
            }
        });
    },
    /**
     * Получить направление движения
     */
    getDirection: function (elem, offset, only) {
        var direction = 'top';

        if (only == 'y') {
            direction = (offset.top / elem.height() > 0.5) ? 'bottom' : 'top';
            return direction;
        } else if (only == 'x') {
            direction = (offset.left / elem.width() > 0.5) ? 'right' : 'left';
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
    startResize: function () {
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
                    this.incColumnValue($(this.resizable_prev), 1);
                }
            }
        } else if ($(target).is($(this.resizable_prev))) {
            displacement = target.width() - offset.left;
            if (displacement > this.options.colmargin) {
                if (this.dec_column_value(target, 1)) {
                    this.incColumnValue($(this.resizable), 1);
                }
            }
        }
    },
    /**
     * Получение ширины колонки
     */
    getColumnValue: function (block) {
        var classes = $(block)[0].classList;

        var cn = '';
        var colClass = this.colClass(false);

        var i = 0;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return parseInt(cn.substr(colClass.length))
            }
        }
        return 0;
    },
    /**
     * Установка ширины колонки
     * @param block
     * @param value
     */
    setColumnValue: function (block, value) {
        var current = this.getColumnValue(block);
        $(block).removeClass(this.colClass(false, current));
        $(block).addClass(this.colClass(false, value));
    },
    /**
     * Увеличение блока
     * @param block
     * @param value
     */
    incColumnValue: function (block, value) {
        var curr = this.getColumnValue(block);
        this.setColumnValue(block, curr + value);
    },
    /**
     * Уменьшение блока
     * @param block
     * @param value
     */
    dec_column_value: function (block, value) {
        var curr = this.getColumnValue(block);
        if (curr - value > 0) {
            this.setColumnValue(block, curr - value);
            return true;
        } else {
            return false;
        }
    },
    /**
     * Cоздание чистой строки
     * @returns HTMLElement
     */
    createPureRow: function () {
        return $('<div/>', {
            class: this.cn + '-row'
        });
    },
    /**
     * Добавляем контролы к редактору
     */
    createControls: function () {
        // TODO к текущему шагу уже должны быть инициализированы плагины

        var $controls = $('<div/>', {class: this.controls_class(false)}),
            $me = this,
            controlsHtml = this.renderTemplate('/templates/editor.jst', {
                plugins: this.plugins
            });

        $controls
            .html(controlsHtml)
            .find('.add-block')
            .on('click', function (e) {
                e.preventDefault();
                $me.create_block();
                return false;
            });

        return this.$controls = $controls;
    },

    getBaseUrl: function () {
        var i, match, path = this.options.baseUrl || undefined, scripts;

        if (!path) {
            scripts = document.getElementsByTagName("script");
            i = 0;
            while (i < scripts.length) {
                match = scripts[i].src.match(/(^|.*[\\\/])editor(?:.min)?.js(?:\?.*)?$/i);
                if (match) {
                    path = match[1];
                    break;
                }
                i++;
            }
        }
        if (path && path.indexOf(":/") === -1) {
            if (path.indexOf("/") === 0) {
                path = location.href.match(/^.*?:\/\/[^\/]*/)[0] + path;
            } else {
                path = location.href.match(/^[^\?]*\/(?:)/)[0] + path;
            }
        }

        if (!path) {
            throw "The Mindy Editor installation path could not be automatically detected. " +
                "Please set 'baseUrl' in options before creating editor instances.";
        }
        return path;
    },

    renderTemplate: function (src, data) {
        var tpl = this.loader.template(this.getBaseUrl() + src),
            compiled = _.template(tpl);
        data = data || {};
        data['i18n'] = this._i18n.getDictionary(this._language);
        return compiled(data);
    },

    /**
     * Создание нового блока
     */
    create_block: function () {
        var blockHtml = $('<div/>', {
            class: this.blockClass(false) + ' col-12 first',
            'data-plugin': 'text'
        });
        this.add_block(blockHtml);
    },
    /**
     * Добавление нового блока на страничку
     * @param block
     */
    add_block: function (block) {
        var row = this.createPureRow();
        var maked = this.makeBlock(block);
        row.append(maked);
        $(this.area_class(true)).append(row);
    },
    /**
     * Установка прошлого контента
     */
    setContent: function () {
        var content = this.$element.val();
        if (!content) {
            content = $('<div/>', {
                class: this.cn + '-block col-12 first',
                'data-plugin': 'text'
            });
        }
        this.setContentByRows(content);
    },
    /**
     * Разбиваем чистый блочный контент по строкам
     * @param content
     * @returns html
     */
    setContentByRows: function (content) {
        var $me = this;
        var out = $('<div/>');
        var row = this.createPureRow();
        $(content).filter(this.blockClass(true)).each(function (index) {
            if ($(this).hasClass('first') && index != 0) {
                $($me.area).append(row);
                row = $me.createPureRow();
            }
            row.append($me.makeBlock(this));
        });
        $($me.area).append(row);
    },
    /**
     * Подготовка блока к добавлению на страницу
     * @param element
     */
    makeBlock: function (element) {
        var name = $(element).data('plugin'), pluginClass, editableElement;

        pluginClass = this.getPlugin(name);
        if (!pluginClass) {
            pluginClass = this.getPlugin('lost')
        }

        editableElement = this.initPlugin(pluginClass, name, element);
        return this.appendDefaults(editableElement);

        /* Really ugly code
         if (!(plugin_name && (plugin = this.getPlugin(plugin_name)))) {
         plugin_name = 'lost';
         plugin = this.getPlugin(plugin_name);
         }
         */
    },
    initPlugin: function (pluginClass, name, element) {
        var plugin = new pluginClass(name, this);

        this.plugins.push(plugin);

        // TODO ugly, refactor it.
        $(element).attr('rel', plugin.getNumber());
        if (!$(element).hasClass(name + '-block')) {
            $(element).addClass(name + '-block');
        }
        $(element).attr('data-plugin', name);

        return plugin.setHtmlBlock(element).editable();
    },
    /**
     * Подключение стандартных элементов к блоку
     * @param block
     * @returns {*|jQuery|HTMLElement}
     */
    appendDefaults: function (block) {
        // TODO move to ui library and rename method like "renderToolbar" or "renderDefaultToolbar"
        /**
         * Создаем хелперы
         */
        var helpers = $('<div/>', {
                class: this.helpers_class(false)
            }),
            move = $('<div/>', {
                class: this.move_class(false),
                html: '<i class="icon-move"></i>'
            }),
            remove = $('<div/>', {
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

    /**
     * Получение очищенного контента из блока
     * @returns {*}
     */
    getContent: function () {
        var $me = this;
        var out = $('<div/>');
        $(this.area).find(this.blockClass(true)).each(function () {
            var cleared = $me.cleanBlock($(this));
            out.append(cleared);
        });
        return out.html();
    },
    /**
     * Очистка блока от данных редактора. Используется перед сохранением.
     *
     * @param block
     * @returns {*|string}
     */
    cleanBlock: function (block) {
        var plugin = this.getBlockPlugin(block);
        block = plugin.render();

        $(block).find(this.helpers_class(true) + ', ' + this.resizer_class(true)).remove();

        return block;
    },

    loader: {
        _templates: {},
        css: function (url, media, ie) {
            // TODO ie conditional comments support

            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            if (media) {
                link.media = media;
            }
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        },
        js: function (url, callback) {
            var script = document.getElementsByTagName('script')[0],
                newjs = document.createElement('script');

            // IE
            newjs.onreadystatechange = function () {
                if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
                    newjs.onreadystatechange = null;
                    callback();
                }
            };
            // others
            newjs.onload = function () {
                callback();
            };
            newjs.src = url;
            script.parentNode.insertBefore(newjs, script);
        },
        template: function (src) {
            var name = src.split('/').pop().replace('.jst'), tpl;

            if ((name in this._templates) == false) {
                $.ajax({
                    url: src,
                    method: 'GET',
                    dataType: 'html',
                    async: false,
                    contentType: 'text',
                    success: function (data) {
                        tpl = data;
                    }
                });

                $('head').append('<script id="meditor_tpl_' + name + '" type="text/template">' + tpl + '<\/script>');
                this._templates[name] = tpl;
            }

            return this._templates[name];
        }
    }
};