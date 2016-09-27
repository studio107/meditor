'use strict';

if (typeof console == 'undefined') {
    console = {
        log: function log(string) {
            alert(string);
        }
    };
}

var extend = function extend(dest) {
    // (Object[, Object, ...]) ->
    var sources = Array.prototype.slice.call(arguments, 1),
        i,
        j,
        len,
        src;

    for (j = 0, len = sources.length; j < len; j++) {
        src = sources[j] || {};
        for (i in src) {
            if (src.hasOwnProperty(i)) {
                dest[i] = src[i];
            }
        }
    }
    return dest;
};

;!function ($) {
    $.fn.classes = function (callback) {
        var classes = [];
        $.each(this, function (i, v) {
            var splitClassName = v.className.split(/\s+/);
            for (var j in splitClassName) {
                var className = splitClassName[j];
                if (-1 === classes.indexOf(className)) {
                    classes.push(className);
                }
            }
        });
        if ('function' === typeof callback) {
            for (var i in classes) {
                callback(classes[i]);
            }
        }
        return classes;
    };
}(jQuery);

if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}
'use strict';

var Class = function Class() {};
Class.prototype = {
    initialize: function initialize() {},
    events: function events() {
        return {
            onInitialize: function onInitialize() {},
            onAfterRender: function onAfterRender() {}
        };
    },
    fireEvent: function fireEvent(event) {
        var events = this.events();
        if (event in events) {
            if (events[event] instanceof Function) {
                events[event].call(this, arguments);
            }
        }
    }
};
Class.extend = function (props) {

    // extended class with the new prototype
    var NewClass = function NewClass() {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        this.fireEvent('onInitialize');
    };

    // instantiate class without calling constructor
    var F = function F() {};
    F.prototype = this.prototype;

    var proto = new F();
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix includes into the prototype
    if (props.templates) {
        extend.apply(null, [proto].concat(props.templates));
        delete props.templates;
    }

    // merge options
    if (props.options && proto.options) {
        props.options = extend({}, proto.options, props.options);
    }

    // mix given properties into the prototype
    extend(proto, props);

    var parent = this;
    // jshint camelcase: false
    NewClass.__super__ = parent.prototype;

    return NewClass;
};
'use strict';

$(function () {
    var register_desktop = {};
    var register_pad = {};
    var current_statement = 'desktop'; // or pad
    var getCol = function getCol($block) {
        var classes = $block[0].classList;

        var cn = '';
        var colClass = 'col-';

        var i = 0;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return parseInt(cn.substr(colClass.length));
            }
        }
        return 0;
    };

    var removeCls = function removeCls($block) {
        var classes = $block[0].classList;

        var cn = '';
        var colClass = 'col-';

        var i;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return $block.removeClass(cn);
            }
        }
    };

    function resize(register) {
        $('.row').each(function (t, row) {
            var sum = 0;
            var $items = $(row).find('[class*="col-"]');
            for (var i = 0; i < $items.length; i++) {
                var $block = $($items[i]);
                $block.removeClass('first');
                //sum += register[t][i];

                if (sum <= 0) {
                    $block.addClass('first');
                    sum = 12;
                }
                removeCls($block);
                $block.addClass('col-' + register[t][i]);
                sum -= register[t][i];
            }
        });
    }

    $('.row').each(function (t, row) {
        register_desktop[t] = {};
        register_pad[t] = {};

        var $items = $(row).find('[class*="col-"]');
        var summ = 0;
        var csumm = 0;
        var sum_after_middle = 0;
        var half = false;
        var middleitem = undefined;
        var tail = undefined;
        var append = undefined;

        for (var i = 0; i < $items.length; i++) {
            var $col = $($items[i]);
            register_desktop[t][i] = getCol($col);

            // Достигли экватора
            if (summ + getCol($col) >= 6 && summ < 6) {
                if (summ + getCol($col) == 6) half = true;
                middleitem = i;

                csumm = summ;
                if (half) csumm = summ + getCol($col);

                sum_after_middle = 12 - (summ + getCol($col));

                var to = half ? i : i - 1;

                if (to > 0) {
                    csumm = 12 - csumm * 2;
                    tail = csumm % (to + 1);
                    append = Math.floor(csumm / (to + 1));
                    for (var j = 0; j <= to; j++) {
                        register_pad[t][j] = register_desktop[t][j] * 2 + append;
                        if (j == to) register_pad[t][j] = register_desktop[t][j] * 2 + append + tail;
                    }
                } else if (to == 0) {
                    register_pad[t][to] = 12;
                }
                if (!half) register_pad[t][i] = 12;
            }

            summ += getCol($col);
        }

        var count = $items.length - (middleitem + 1);

        if (count) {
            csumm = 12 - sum_after_middle * 2;
            tail = csumm % count;
            append = Math.floor(csumm / count);

            for (j = middleitem + 1; j < $items.length; j++) {
                register_pad[t][j] = register_desktop[t][j] * 2 + append;
                if (j == $items.length - 1) register_pad[t][j] = register_desktop[t][j] * 2 + append + tail;
            }
        }
    });

    var handle_resize = function handle_resize(event) {
        var width = $(window).width();
        if (width < 978) {
            if (current_statement != 'pad') {
                current_statement = 'pad';
                resize(register_pad);
            }
        } else {
            if (current_statement != 'desktop') {
                current_statement = 'desktop';
                resize(register_desktop);
            }
        }
    };

    $(window).on('resize', handle_resize);
    $(window).on('orientationchange', handle_resize);
    handle_resize();
});
'use strict';

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

var EditorCore = function EditorCore($element, options, i18n) {
    this.$element = $element;
    this.options = $.extend(this.options, options);
    this.cn = this.options.classname;

    this._i18n = i18n;
    this._language = options['language'] || i18n.getLanguage();

    return this.init();
};

EditorCore.prototype = {
    /**
     * Default settings
     * Настройки по умолчанию
     */
    options: {
        plugins: {},
        language: 'en',
        option: 'value',
        classname: 'meditor',
        columns: 12,
        colsize: 54,
        colmargin: 30,
        minHeightBlock: 95
    },

    $element: undefined,
    $controls: undefined,

    editor: undefined,
    area: undefined,
    cn: undefined,

    _language: undefined,
    _i18n: undefined,

    plugins: [],

    // TODO refactoring
    _plugins: {},

    blocks: {},
    blocks_menu: {},

    movable: undefined,
    resizable: undefined,
    resizable_prev: undefined,
    helperable: undefined,
    i18n: undefined,

    counter: 0,

    /**
     * Editor initialization
     * Инициализация редактора
     *
     * @returns {EditorCore}
     */
    init: function init() {
        // @TODO move to external i18n language file
        this._i18n.addToDictionary({
            ru: {
                'Add block': 'Добавить блок',
                'You really want to remove this block?': 'Вы действительно хотите удалить данный блок?',
                'Main settings': 'Основные настройки',
                'Small screen': 'Маленький экран',
                'Medium screen': 'Средний экран',
                'Default action': 'Действие по-умолчанию',
                'Columns: ': 'Колонок: ',
                'Save': 'Сохранить'
            }
        }, 'core');

        this.bindEvents();

        this.$element.hide(0);

        var editor = $('<div/>', { class: this.cn }),
            area = $('<div/>', { class: this.areaClass(false) });

        this.editor = editor;
        this.area = area;

        // TODO refactoring
        this.pluginsInit();

        this.setContent();
        $(editor).append(area, this.createControls());
        this.$element.after(this.editor);
        this.initGrid();
        this.pluginsAfterRender();
        return this;
    },

    /**
     * Plugins initialization
     * Инициализация плагинов
     */
    pluginsInit: function pluginsInit() {
        // TODO refactoring
        var name;

        for (name in this.options.plugins) {
            var plugin = this.options.plugins[name],
                pluginOptions = this.options[name] || {};
            this._plugins[name] = new plugin(name, this, pluginOptions);
        }
    },

    t: function t(source, category, params) {
        return this._i18n.t(source, category || 'core', params || {}, this._language);
    },

    /**
     * Classes
     * Используемые классы
     */

    blockClass: function blockClass(dotted) {
        var cn = this.cn + '-block';
        return dotted ? '.' + cn : cn;
    },
    rowClass: function rowClass(dotted) {
        var cn = 'row';
        return dotted ? '.' + cn : cn;
    },
    columnClass: function columnClass(dotted) {
        var cn = 'column';
        return dotted ? '.' + cn : cn;
    },
    colClass: function colClass(dotted, value) {
        var append = '';
        if (value) append = value.toString();
        var cn = 'large-' + append;
        return dotted ? '.' + cn : cn;
    },
    highlighterClass: function highlighterClass(dotted) {
        var cn = this.cn + '-highlighter';
        return dotted ? '.' + cn : cn;
    },
    plugClass: function plugClass(dotted) {
        var cn = 'plug';
        return dotted ? '.' + cn : cn;
    },
    pluggedClass: function pluggedClass(dotted) {
        var cn = 'plugged';
        return dotted ? '.' + cn : cn;
    },
    movingClasses: function movingClasses() {
        return this.rowClass(true) + ', ' + this.columnClass(true) + ', ' + this.blockClass(true);
    },
    areaClass: function areaClass(dotted) {
        var cn = this.cn + '-area';
        return dotted ? '.' + cn : cn;
    },
    controlsClass: function controlsClass(dotted) {
        var cn = this.cn + '-controls';
        return dotted ? '.' + cn : cn;
    },
    moveClass: function moveClass(dotted) {
        var cn = this.cn + '-move';
        return dotted ? '.' + cn : cn;
    },
    deleteClass: function deleteClass(dotted) {
        var cn = this.cn + '-delete';
        return dotted ? '.' + cn : cn;
    },
    settingsClass: function settingsClass(dotted, part) {
        var cn = this.cn + '-settings';
        part = part || false;
        if (part) {
            cn += '-' + part;
        }
        return dotted ? '.' + cn : cn;
    },
    movingClass: function movingClass(dotted) {
        var cn = this.cn + '-moving';
        return dotted ? '.' + cn : cn;
    },
    helpersClass: function helpersClass(dotted) {
        var cn = this.cn + '-helpers';
        return dotted ? '.' + cn : cn;
    },
    resizerClass: function resizerClass(dotted) {
        var cn = this.cn + '-resizer';
        return dotted ? '.' + cn : cn;
    },
    resizingClass: function resizingClass(dotted) {
        var cn = 'resizing';
        return dotted ? '.' + cn : cn;
    },
    resizingSiblingClass: function resizingSiblingClass(dotted) {
        var cn = 'resizing-sibling';
        return dotted ? '.' + cn : cn;
    },
    heightResizerClass: function heightResizerClass(dotted) {
        var cn = this.cn + '-height-resizer';
        return dotted ? '.' + cn : cn;
    },
    heightResizingClass: function heightResizingClass(dotted) {
        var cn = 'height-resizing';
        return dotted ? '.' + cn : cn;
    },
    heightBlockResizingClass: function heightBlockResizingClass(dotted) {
        var cn = 'height-block-resizing';
        return dotted ? '.' + cn : cn;
    },
    helperableClass: function helperableClass(dotted) {
        var cn = 'helperable';
        return dotted ? '.' + cn : cn;
    },
    settingsId: function settingsId(name) {
        return 'settings-' + name;
    },
    /**
     * Binding events
     * "Навешиваем" события
     */
    bindEvents: function bindEvents() {
        var me = this;

        $(document).on('click', me.deleteClass(true), function () {
            var confirmMessage = me.t('You really want to remove this block?');

            if (confirm(confirmMessage)) {
                me.helperable.remove();
                me.hideHelper();
                me.clearStrings();
            }
        });

        $(document).on('click', me.settingsClass(true), function () {
            var plugin = me.getBlockPlugin(me.helperable);
            plugin.showSettings();
            return false;
        });

        $(document).on('mouseover', 'body:not(.moving, .resizing, .height-resizing) ' + me.blockClass(true), function (e) {
            var element = $(e.target).closest(me.blockClass(true));

            if (element.length >= 0) {
                me.showHelper(element);
            }
        });

        $(document).on('mouseout', 'body:not(.height-resizing) ' + me.blockClass(true), function (e) {
            if ($(e.relatedTarget).closest(me.helpersClass(true)).length <= 0) {
                me.hideHelper();
            }
        });

        $(document).on('mouseout', 'body:not(.height-resizing) ' + me.helpersClass(true), function (e) {
            if ($(e.relatedTarget).closest(me.helpersClass(true)).length <= 0) {
                me.hideHelper();
            }
        });

        $(document).on('selectstart', me.blockClass(true), function (e) {
            if ($('body').hasClass('unselectable')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    },
    /**
     * Show block settings panel
     * Отобразить панель настроек блока
     *
     * @param element
     */
    showHelper: function showHelper(element) {
        var helpers = $(this.editor).find(this.helpersClass(true));
        helpers.css({ 'display': 'block' });

        var $me = $(this.editor);
        $(element).addClass(this.helperableClass(false));
        helpers.css({
            'top': element.offset().top - $me.offset().top,
            'left': element.offset().left - $me.offset().left + element.width()
        });
        this.helperable = element;
    },
    /**
     * Hide settings panel
     * Скрыть панель настроек
     */
    hideHelper: function hideHelper() {
        var helpers = $(this.editor).find(this.helpersClass(true));
        helpers.css({
            'display': 'none'
        });
        $(this.helperable).removeClass(this.helperableClass(false));
        this.helperable = undefined;
    },
    /**
     * Grid initialization
     * Инициализация грида (расположения блоков)
     */
    initGrid: function initGrid() {
        var $me = this;
        var moving_selector = this.moveClass(true);
        $(document).on('mousedown', moving_selector, function () {
            $me.movable = $me.helperable;
            $me.startMove();
        });
        $(document).on('mousedown', this.columnClass(true) + ' ' + $me.resizerClass(true), function () {
            $me.resizable = $me.findColumn($(this));
            $me.resizable_prev = $($me.resizable).prev();
            if ($me.resizable_prev.length) {
                $me.startResize();
            } else {
                $me.resizable = undefined;
                $me.resizable_prev = undefined;
            }
        });
        $(document).on('mousedown', this.blockClass(true) + ' ' + $me.heightResizerClass(true), function () {
            $me.resizable = $(this).closest($me.blockClass(true));
            $me.startHeightResize();
        });
    },
    /**
     * Get plugin by name
     * Получить плагин по имени
     *
     * @param name
     * @returns {plugin}
     */
    getPlugin: function getPlugin(name) {
        var plugin = this.options.plugins[name];
        if (!plugin) {
            /**
             * If requested block not found show special "Lost block"
             * Если запрашиваемый блок не найден - отображаем специальный "Утерянный блок"
             */
            plugin = this.options.plugins['lost'];
        }
        return new plugin(name, this);
    },
    /**
     * Get block plugin
     * Получить плагин по блоку
     *
     * @param block
     * @returns {*}
     */
    getBlockPlugin: function getBlockPlugin(block) {
        return this.plugins[parseInt($(block).attr('rel'))];
    },
    /**
     * Set body as unselectable
     * Отключаем выделение текста на странице
     */
    setUnselectable: function setUnselectable() {
        $('body').addClass('unselectable');
    },
    /**
     * Unset body as unselectable
     * Влючаем выделение текста на странице
     */
    setSelectable: function setSelectable() {
        $('body').removeClass('unselectable');
    },

    /**
     * Service functions to simplify the calculations
     * Сервисные функции для упрощения расчетов
     */

    /**
     * Calculating offset of mouse cursor inset element
     * Расчет смещения курсора мыши внутри элемента
     *
     * @param elem
     * @param e
     * @returns {{left: Number, top: Number}}
     */
    calculateOffset: function calculateOffset(elem, e) {
        var event = e.originalEvent;

        var top = event.offsetY ? event.offsetY : event.layerY;
        var left = event.offsetX ? event.offsetX : event.layerX;

        var element = this.findColumn(elem);
        if (!element.length && this.isRow(elem)) {
            element = elem;
        }
        if (element.length) {
            top = e.pageY - element.offset()['top'];
            left = e.pageX - element.offset()['left'];
        }
        return { 'left': left, 'top': top };
    },

    /**
     * Get direction
     * Получить направление движения
     */
    getDirection: function getDirection(elem, offset, only) {
        var direction = 'top';

        if (only == 'y') {
            direction = offset.top / elem.height() > 0.5 ? 'bottom' : 'top';
            return direction;
        } else if (only == 'x') {
            direction = offset.left / elem.width() > 0.5 ? 'right' : 'left';
            return direction;
        }

        var nw = { 'x': 0, 'y': 0 };
        var ne = { 'x': elem.width(), 'y': 0 };
        var sw = { 'x': 0, 'y': elem.height() };
        var se = { 'x': elem.width(), 'y': elem.height() };

        var x = offset.left;
        var y = offset.top;

        var nw_se = (x - nw.x) / (se.x - nw.x) - (y - nw.y) / (se.y - nw.y);
        var ne_sw = (x - ne.x) / (sw.x - ne.x) - (y - ne.y) / (sw.y - ne.y);

        if (nw_se > 0) {
            if (ne_sw > 0) direction = 'top';else direction = 'right';
        } else {
            if (ne_sw > 0) direction = 'left';else direction = 'bottom';
        }

        return direction;
    },

    /**
     * Service functions for the Grid
     * Сервисные функции для работы с гридом
     */

    /**
     * Getting the width of a column
     * Получение ширины колонки
     */
    getColumnValue: function getColumnValue(block) {
        var classes = block[0].classList;

        var cn = '';
        var colClass = this.colClass(false);

        var i = 0;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return parseInt(cn.substr(colClass.length));
            }
        }
        return 0;
    },

    /**
     * Setting the width of a column
     * Установка ширины колонки
     *
     * @param block
     * @param value
     */
    setColumnValue: function setColumnValue(block, value) {
        var $block = $(block);
        var current = this.getColumnValue(block);
        var $me = this;
        $block.removeClass(this.colClass(false, current));
        $block.addClass(this.colClass(false, value));
        $block.find(this.blockClass(true)).each(function () {
            $me.blockColumnChangeSize($(this));
        });
        return $block;
    },

    /**
     * Increasing the block size
     * Увеличение размера блока
     *
     * @param block
     * @param value
     */
    incColumnValue: function incColumnValue(block, value) {
        var curr = this.getColumnValue(block);
        this.setColumnValue(block, curr + value);
    },

    /**
     * Decreasing the block size
     * Уменьшение размера блока
     *
     * @param block
     * @param value
     */
    decColumnValue: function decColumnValue(block, value) {
        var curr = this.getColumnValue(block);
        if (curr - value > 1) {
            this.setColumnValue(block, curr - value);
            return true;
        } else {
            return false;
        }
    },

    /**
     * Column searching
     * Поиск колонки
     *
     * @returns HTMLElement
     */
    findColumn: function findColumn(element) {
        var $element = $(element);
        if ($element && $element.length > 0) {
            return $element.closest(this.columnClass(true));
        }
        return $();
    },

    /**
     * Check is line
     * Проверка на строку
     *
     * @returns bool
     */
    isRow: function isRow(element) {
        return $(element).hasClass(this.rowClass(false));
    },

    /**
     * Check is column
     * Проверка на столбец
     *
     * @returns bool
     */
    isColumn: function isColumn(element) {
        return $(element).hasClass(this.columnClass(false));
    },

    /**
     * Clean up the lines
     * Прибираемся в строчках
     */
    clearStrings: function clearStrings() {
        var $me = this;
        var counted = 0;

        $($me.area).find($me.rowClass(true)).each(function () {
            counted = 0;
            $(this).find($me.columnClass(true)).each(function () {
                if ($(this).find($me.blockClass(true)).length > 0) {
                    counted += $me.getColumnValue($(this));
                } else {
                    $(this).remove();
                }
            });

            if (counted > 0 && counted < $me.options.columns) {
                var need_append = $me.options.columns - counted;
                var count_blocks = $(this).find($me.columnClass(true)).length;

                var append_per_block = Math.round(need_append / count_blocks);
                var append_last_block = need_append - append_per_block * (count_blocks - 1);

                $(this).find($me.columnClass(true)).each(function (index) {
                    var column = $(this);
                    var current = $me.getColumnValue(column);

                    if (index == count_blocks - 1) {
                        $me.setColumnValue(column, current + append_last_block);
                    } else {
                        $me.setColumnValue(column, current + append_per_block);
                    }
                });
            }

            if ($(this).find($me.columnClass(true)).length == 0) {
                $(this).remove();
            }
        });

        this.saveState();
    },

    /**
     * Drag and drop blocks
     * Перетаскивания блоков
     */

    /**
     * Started drag
     * Начали перетаскивать
     */
    startMove: function startMove() {
        var $me = this;
        $($me.movable).addClass($me.movingClass(false));
        $me.setUnselectable();
        $('body').addClass('moving');
        $(document).on('mouseup', function (e) {
            var offset = $me.calculateOffset(e.target, e);
            $me.stopMove($(e.target), offset);
        });
        $(this.movingClasses()).on('mouseout', function () {
            $me.clearHighlight();
        });
        $(this.movingClasses()).on('mousemove', function (e) {
            var offset = $me.calculateOffset(e.target, e);
            $me.highlightBlock($(e.target), offset);
        });
    },
    /**
     * Finished drag
     * Закончили перетаскивать
     *
     * @param drop_to
     * @param offset
     */
    stopMove: function stopMove(drop_to, offset) {
        drop_to = $(drop_to);
        $(this.movable).removeClass(this.movingClass(false));
        this.setSelectable();
        $('body').removeClass('moving');
        this.clearHighlight();
        $(this.movingClasses()).off('mousemove');
        $(this.movingClasses()).off('mouseout');
        $(document).off('mouseup');

        var dropped_to = this.findColumn(drop_to);
        var direction = drop_to.is($(this.movable)) ? 'y' : 'xy';
        if (!dropped_to.length && this.isRow(drop_to)) {
            dropped_to = drop_to;
            direction = 'y';
        }
        if (dropped_to.length) {
            var drop_from = this.findColumn(this.movable);
            this.dropped($(this.movable), drop_from, dropped_to, this.getDirection(dropped_to, offset, direction));
            this.blockAfterMove($(this.movable));
        }

        this.movable = false;
        this.saveState();
    },
    /**
     * Calculating changes after drop
     * Расчет изменений после перетаскивания
     *
     * @param element
     * @param drop_from
     * @param drop_to (element column or row only)
     * @param direction
     */
    dropped: function dropped(element, drop_from, drop_to, direction) {
        var $me = this;

        var col_to = this.isRow(drop_to) ? 12 : this.getColumnValue(drop_to);

        if (direction == 'top' || direction == 'bottom') {

            /**
             * Append new row
             * Добавляем новую строку
             */
            if (col_to == this.options.columns) {
                var to_row = this.isRow(drop_to) ? drop_to : drop_to.closest(this.rowClass(true));
                var row = this.wrapToRowColumn(element);

                if (direction == 'top') {
                    to_row.before(row);
                } else if (direction == 'bottom') {
                    to_row.after(row);
                }
            } else {
                /**
                 * Add to the tail or the head of the column
                 * Добавляем в хвост или голову столбца
                 */
                if (direction == 'top') {
                    drop_to.prepend(element);
                } else if (direction == 'bottom') {
                    drop_to.append(element);
                }
            }
        } else if (direction == 'left' || direction == 'right') {
            if (col_to > 3) {
                var new_col_element = Math.round(col_to / 2);
                var new_col_to = col_to - new_col_element;

                this.setColumnValue(drop_to, new_col_to);

                var $newColumn = this.wrapToColumn(element);
                $newColumn = $me.setColumnValue($newColumn, new_col_element);

                if (direction == 'left') {
                    $(drop_to).before($newColumn);
                } else if (direction == 'right') {
                    $(drop_to).after($newColumn);
                }
            }
        }

        this.clearStrings();
    },

    /**
     * Highlighting blocks
     * Подсвечивание блоков
     */

    /**
     * Highlight the block
     * Подсветить блок
     *
     * @param element // HTMLElement
     * @param offset // {'left': int,'top': int}
     */
    highlightBlock: function highlightBlock(element, offset) {
        this.clearHighlight();
        var $column = this.findColumn(element);
        if ($column.length) {
            var direction = 'top';
            if (!$column.is($(this.movable))) {
                direction = this.getDirection($column, offset);
            } else if ($column.hasClass(this.colClass(false, this.options.columns))) {
                direction = this.getDirection($column, offset, 'y');
            } else {
                return false;
            }

            var col_to = this.getColumnValue($column);

            if (direction == 'top' || direction == 'bottom') {
                if (col_to == this.options.columns) {
                    var $element = $column.closest(this.rowClass(true));
                    this.highlightElement($element, direction);
                } else {
                    this.highlightElement($column, direction);
                }
            } else {
                if (col_to > 3) {
                    this.highlightElement($column, direction);
                }
            }
        } else if (this.isRow(element)) {
            direction = this.getDirection(element, offset, 'y');
            this.highlightElement(element, direction);
        }
        return false;
    },
    /**
     * Highlight a specific element
     * Подсветить конкретный элемент
     *
     * @param element // HTMLElement
     * @param direction // string left|top|right|bottom
     */
    highlightElement: function highlightElement(element, direction) {
        // Меняем подсветку текущего блока на следующий (дабы выделение не скакало как бешеное)
        if (this.isRow(element) && direction == 'bottom') {
            var next = element.next(this.rowClass(true));
            if (next.length > 0) {
                element = $(next[0]);
                direction = 'top';
            }
        }

        if (this.isColumn(element) && direction == 'right') {
            var next = element.next(this.columnClass(true));
            if (next.length > 0) {
                element = $(next[0]);
                direction = 'left';
            }
        }

        var highlighter = $('<div/>').addClass(this.highlighterClass(false)).addClass(direction);
        element.append(highlighter);
    },
    /**
     * Remove the highlight blocks
     * Убрать подсветку блоков
     */
    clearHighlight: function clearHighlight() {
        $(this.highlighterClass(true)).remove();
    },

    /**
     * Change the size of columns
     * Изменение ширины столбцов
     */

    /**
     * Started resizing
     * Начали изменение размера
     */
    startResize: function startResize() {
        var $me = this;
        $('body').addClass('unselectable').addClass(this.resizingClass(false));

        $(document).on('mouseup', function (e) {
            var event = e.originalEvent;
            var offset = {
                'left': event.offsetX ? event.offsetX : event.layerX,
                'top': event.offsetY ? event.offsetY : event.layerY
            };
            $me.stopResize(e.target, offset);
        });
        var move_function = function move_function(e) {
            var event = e.originalEvent;
            var offset = {
                'left': event.offsetX ? event.offsetX : event.layerX,
                'top': event.offsetY ? event.offsetY : event.layerY
            };
            $me.resizing(e.currentTarget, offset);
        };

        $(this.resizable).addClass(this.resizingClass(false));
        $(this.resizable).on('mousemove', move_function);

        var $prev = $(this.resizable).prev();
        if ($prev.length) {
            $prev.addClass(this.resizingSiblingClass(false)).on('mousemove', move_function);
        }
    },

    /**
     * Finished resizing
     * Закончили изменение размера
     *
     * @param target
     * @param offset
     */
    stopResize: function stopResize(target, offset) {
        $('body').removeClass('unselectable').removeClass(this.resizingClass(false));

        $(document).off('mouseup');

        $(this.resizable).removeClass(this.resizingClass(false));
        $(this.resizable).off('mousemove');
        var $prev = $(this.resizable).prev();
        if ($prev.length) {
            $prev.removeClass(this.resizingSiblingClass(false)).off('mousemove');
        }
        this.saveState();
    },

    /**
     * Resizing
     * Изменение размера
     *
     * @param target
     * @param offset
     */
    resizing: function resizing(target, offset) {
        var displacement = 0;
        var $target = $(target);

        if ($target.is($(this.resizable))) {
            displacement = offset.left;
            if (displacement > this.options.colmargin) {
                if (this.decColumnValue($target, 1)) {
                    this.incColumnValue($(this.resizable_prev), 1);
                }
            }
        } else if ($target.is($(this.resizable_prev))) {
            displacement = $target.width() - offset.left;
            if (displacement > this.options.colmargin) {
                if (this.decColumnValue($target, 1)) {
                    this.incColumnValue($(this.resizable), 1);
                }
            }
        }
    },

    /**
     * Change the height of blocks
     * Изменение высоты блоков
     */

    /**
     * Start change the height of block
     * Начали изменение высоты блока
     */
    startHeightResize: function startHeightResize() {
        var $me = this;
        $('body').addClass('unselectable').addClass(this.heightResizingClass(false));

        $($me.resizable).addClass($me.heightBlockResizingClass(false));

        $(document).on('mousemove', function (e) {
            var resizable_offset = $($me.resizable).offset();
            var offset = {
                'left': e.pageX - resizable_offset.left,
                'top': e.pageY - resizable_offset.top
            };
            $me.heightResize(offset);
        });

        $(document).on('mouseup', function (e) {
            $me.stopHeightResize();
        });
    },
    /**
     * Change the height of block
     * Изменение высоты блока
     *
     * @param offset
     */
    heightResize: function heightResize(offset) {
        var height = this.options.minHeightBlock;
        var resizer = this.resizable.find(this.heightResizerClass(true));
        var type = resizer.data('type');
        if (!type) {
            type = 'min-height';
        }
        if (offset.top >= this.options.minHeightBlock) {
            height = offset.top;
        }
        $(this.resizable).css(type, height);
        this.blockHeightResize(this.resizable);
    },
    /**
     * Finish change the height of block
     * Закончили изменение высоты блока
     */
    stopHeightResize: function stopHeightResize() {
        $('body').removeClass('unselectable').removeClass(this.heightResizingClass(false));
        $(document).off('mouseup');
        $(document).off('mousemove');
        $(this.resizable).removeClass(this.heightBlockResizingClass(false));
        this.resizable = undefined;
        this.saveState();
    },

    /**
     * Creation functions
     * Функции создания элементов
     */

    /**
     * Create an element that changes the column width
     * Создать элемент изменения ширины колонки
     *
     * @returns {*|jQuery}
     */
    createResizeHandler: function createResizeHandler() {
        return $('<span/>').addClass(this.resizerClass(false));
    },

    /**
     * Create clean (empty) row
     * Создать чистую (пустую) строку
     *
     * @returns HTMLElement
     */
    createPureRow: function createPureRow() {
        return $('<div/>', {
            class: 'row'
        });
    },

    /**
     * Create clean (empty) column
     * Создать чистый (пустой) столбец
     *
     * @returns HTMLElement
     */
    createPureColumn: function createPureColumn() {
        return $('<div/>', {
            class: this.columnClass(false) + ' large-12'
        }).append(this.createResizeHandler());
    },

    /**
     * Wrap the element in the row and column
     * Обернуть элемент в строку и столбец
     *
     * @returns HTMLElement
     */
    wrapToRowColumn: function wrapToRowColumn($element) {
        var row = this.createPureRow();
        return row.append(this.createPureColumn().append($element));
    },

    /**
     * Wrap the element in column
     * Обернуть элемент в столбец
     *
     * @returns HTMLElement
     */
    wrapToColumn: function wrapToColumn($element) {
        return this.createPureColumn().append($element);
    },

    /**
     * Adding controls to the editor
     * Добавляем элементы управления к редактору
     */
    createControls: function createControls() {
        // TODO to the current step has to be initialized plugins
        // TODO к текущему шагу уже должны быть инициализированы плагины

        var $controls = $('<div/>', { class: this.controlsClass(false) }),
            $me = this,
            controlsHtml = this.renderTemplate('/templates/editor.jst', {
            plugins: this._plugins
        });

        $controls.html(controlsHtml).find('.add-block').on('click', function (e) {
            e.preventDefault();

            var $data = $(this).data();
            $me.createBlock($data);
            return false;
        });

        return this.$controls = $controls;
    },

    /**
     * Functions for working with blocks
     * Функции для работы с блоками
     */

    /**
     * Creating a new block
     * Создание нового блока
     */
    createBlock: function createBlock(data) {
        var $block = $('<div/>', {
            'data-plugin': data['plugin']
        });
        $block.addClass(this.blockClass(false));
        this.addBlock($block);
    },
    /**
     * Добавление блока на страницу
     * Adding the block to the page
     *
     * @param block
     */
    addBlock: function addBlock(block) {
        var row = this.createPureRow();
        var column = this.createPureColumn();
        var maked = this.makeBlock(block);
        column.append(maked);
        row.append(column);
        $(this.areaClass(true)).append(row);
        this.blockAfterRender(block);
        this.saveState();
    },

    /**
     * Initialization of the grid elements
     * Инициализация элементов грида
     */

    /**
     * Setting old content
     * Установка прошлого контента
     */
    setContent: function setContent() {
        var content = this.$element.val();
        if (!content) {
            var block = $('<div/>', {
                'data-plugin': 'text'
            });
            block.addClass(this.blockClass(false)).addClass('text-block');

            var row = this.createPureRow();
            var column = this.createPureColumn();
            column.append(block);
            row.append(column);

            content = $('<div/>').append(row);
        } else {
            content = $('<div/>').html(content);
        }
        this.setContentByRows(content);
    },
    /**
     * Splitting a clean block content in rows
     * Разбиваем чистый блочный контент по строкам
     *
     * @param content
     * @returns html
     */
    setContentByRows: function setContentByRows(content) {
        var $me = this;
        var row = this.createPureRow();
        $(content).find($me.rowClass(true)).each(function (index) {
            row = $me.createPureRow();
            $(this).find($me.columnClass(true)).each(function (index) {
                $(this).find($me.resizerClass(true)).remove();
                var column = $(this).append($me.createResizeHandler());
                $(this).find($me.blockClass(true)).each(function (index) {
                    column.append($me.makeBlock(this));
                });
                row.append(column);
            });
            $($me.area).append(row);
        });
    },
    /**
     * Preparing block to add to the page
     * Подготовка блока к добавлению на страницу
     *
     * @param element
     */
    makeBlock: function makeBlock(element) {
        var name = $(element).data('plugin'),
            plugin = this.getPlugin(name);

        return this.initPlugin(plugin, element, name);
    },
    /**
     * Initialize the plugin when adding block
     * Инициализация плагина при добавлении блока
     *
     * @param plugin
     * @param element
     * @param name
     * @returns {*|string}
     */
    initPlugin: function initPlugin(plugin, element, name) {
        this.plugins.push(plugin);

        var $element = $(element);
        $element.attr('rel', plugin.getNumber());
        if (!$element.hasClass(name + '-block')) {
            $element.addClass(name + '-block');
        }
        $element.attr('data-plugin', name).data('plugin', name);
        return plugin.setHtmlBlock(element).render();
    },

    /**
     * Saving
     * Сохранение
     */

    /**
     * Getting clean content
     * Получение очищенного контента
     *
     * @returns {*}
     */
    getContent: function getContent() {
        var $me = this,
            out = $('<div/>');

        $(this.area).find(this.rowClass(true)).each(function () {
            var cleared = $me.getRowContent($(this));
            out.append(cleared);
        });
        return out.html();
    },
    /**
     * Getting clean content from row
     * Получение очищенного контента из строки
     *
     * @param row
     * @returns {*|jQuery}
     */
    getRowContent: function getRowContent(row) {
        var $me = this;
        var out = $('<div/>').addClass($me.rowClass(false));
        row.find($me.columnClass(true)).each(function () {
            var out_column = $(this).clone().html('');
            $(this).find($me.blockClass(true)).each(function () {
                var cleared = $me.cleanBlock($(this));
                out_column.append(cleared);
            });
            out.append(out_column);
        });
        return out;
    },
    /**
     * Cleaning the block. Used before saving.
     * Очистка блока от данных редактора. Используется перед сохранением.
     *
     * @param block
     * @returns {*|string}
     */
    cleanBlock: function cleanBlock(block) {
        var plugin = this.getBlockPlugin(block);

        block = plugin.getContent();

        var $block = $(block);

        $block.find(this.helpersClass(true)).remove();
        $block.find(this.resizerClass(true)).remove();
        $block.find(this.plugClass(true)).remove();
        $block.find(this.heightResizerClass(true)).remove();

        $block.removeAttr('rel');

        return block;
    },

    /**
     * Events
     * События
     */
    blockAfterRender: function blockAfterRender(block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginAfterRender(plugin);
    },
    pluginsAfterRender: function pluginsAfterRender() {
        var key = 0;
        for (key in this.plugins) {
            this.pluginAfterRender(this.plugins[key]);
        }
    },
    pluginAfterRender: function pluginAfterRender(plugin) {
        plugin.fireEvent('onAfterRender');
    },
    blockHeightResize: function blockHeightResize(block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginHeightResize(plugin);
    },
    pluginHeightResize: function pluginHeightResize(plugin) {
        plugin.fireEvent('onHeightResize');
    },
    blockAfterMove: function blockAfterMove(block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginAfterMove(plugin);
    },
    pluginAfterMove: function pluginAfterMove(plugin) {
        plugin.fireEvent('onAfterMove');
    },
    blockColumnChangeSize: function blockColumnChangeSize(block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginColumnChangeSize(plugin);
    },
    pluginColumnChangeSize: function pluginColumnChangeSize(plugin) {
        plugin.fireEvent('onColumnChangeSize');
    },
    /**
     * Some changes! Update content in element!
     */
    saveState: function saveState() {
        console.log(this.getContent());
        this.$element.val(this.getContent());
    },
    /**
     * Прочие сервисные функции
     */
    renderTemplate: function renderTemplate(src, data) {
        var appendBlock = this.t('Add block');
        var compiled = _.template('' + '<div class="row">' + '<div class="column large-12">' + '<nav class="meditor-controls">' + '<ul class="no-bullet">' + '<li class="append">' + '<span>' + appendBlock + '</span>' + '</li>' + '<% _.each(plugins, function(plugin) { %>' + '<li>' + '<a class="add-block" data-popup="<%= plugin.options.hasPopup %>" href="#" data-plugin="<%= plugin.getName() %>" rel="<%= plugin.getNumber() %>">' + '<%= plugin.getI18nName() %>' + '</a>' + '</li>' + '<% }); %>' + '</ul>' + '</nav>' + '</div>' + '</div>' + '<div class="meditor-helpers">' + '<span class="meditor-move">' + '<i class="move-icon"></i>' + '</span>' + '<span class="meditor-settings">' + '<i class="gear-icon"></i>' + '</span>' + '<span class="meditor-delete">' + '<i class="delete-icon"></i>' + '</span>' + '</div>');
        data = data || {};
        data['i18n'] = this._i18n.getDictionary(this._language);
        return compiled(data);
    }
};
'use strict';

(function (window) {
    "use strict";

    var i18n = function () {
        var dictionary = {};

        return {
            addToDictionary: function addToDictionary(dict, category) {
                for (var l in dict) {
                    if (typeof dictionary[l] === 'undefined') {
                        dictionary[l] = {};
                    }

                    if (typeof dictionary[l][category] === 'undefined') {
                        dictionary[l][category] = {};
                    }

                    dictionary[l][category] = dict[l];
                }
            },
            getDictionary: function getDictionary(language) {
                return dictionary[language] || {};
            },

            setDictionary: function setDictionary(dict, lang) {
                if (typeof dictionary[lang] === 'undefined') {
                    lang = this.getLanguage();
                }
                dictionary[lang] = dict;
            },

            t: function t(str, category, params, lang) {
                var transl = str,
                    dict = this.getDictionary(lang);

                if (typeof category !== 'undefined' && category in dict) {
                    dict = dict[category] || {};
                }

                if (str in dict) {
                    transl = dict[str];
                }

                return this.printf(transl, params);
            },

            printf: function printf(source, params) {
                if (!params) return source;

                var nS = "";
                var tS = source.split("%s");

                for (var i = 0; i < params.length; i++) {
                    if (tS[i].lastIndexOf('%') == tS[i].length - 1 && i != params.length - 1) tS[i] += "s" + tS.splice(i + 1, 1)[0];
                    nS += tS[i] + params[i];
                }
                return nS + tS[tS.length - 1];
            }
        };
    }();

    var meditor = function () {
        var _plugins = {};

        return {
            i18n: i18n,
            init: function init(element, options) {
                if (element == undefined) {
                    throw "element is undefined";
                }

                if (typeof element == 'string') {
                    element = $(element);
                }

                options['plugins'] = this.preparePlugins(options['plugins']) || {};

                return new EditorCore(element, options, this.i18n);
            },
            preparePlugins: function preparePlugins(rawPlugins) {
                var i,
                    name,
                    plugins = {};

                for (i in rawPlugins) {
                    name = rawPlugins[i];

                    if (name in _plugins) {
                        plugins[name] = _plugins[name];
                    }
                }

                return plugins;
            },
            pluginAdd: function pluginAdd(name, object) {
                _plugins[name] = object;
            },
            plugins: function plugins() {
                return _plugins;
            }
        };
    }();

    window.meditor = meditor;

    return meditor;
})(window);
'use strict';

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

        settings: {},

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
         * @param settings
         */
        initialize: function initialize(name, parent, settings) {
            this._name = name;
            this._parent = parent;
            this._number = parent.plugins.length;
            this.settings = _.extend(this.settings, settings);

            parent._i18n.addToDictionary(this.i18n, this.getName());
        },

        /**
         * Current number of plugin
         * Текущий номер плагина
         *
         * @returns {*}
         */
        getNumber: function getNumber() {
            return this._number;
        },

        /**
         * Plugin short name (ex: 'text', 'video', etc)
         * Короткое имя плагина (например: 'text', 'video' ...)
         * @returns {*}
         */
        getName: function getName() {
            return this._name;
        },

        /**
         * Setting content to html block
         * Устанавливаем контент в html блок
         *
         * @param html
         * @returns {Block}
         */
        setHtmlBlock: function setHtmlBlock(html) {
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
        getHtmlBlock: function getHtmlBlock() {
            return this._htmlBlock;
        },

        /**
         * Handlers initialization
         * Инициализация обработчиков
         */
        attachHandlers: function attachHandlers() {
            // Uses after setting content
        },

        getI18nName: function getI18nName() {
            throw "Not implemented error";
        },

        /**
         * Internalization
         *
         * @param source
         * @param params
         * @param name
         * @returns {*}
         */
        t: function t(source, params, name) {
            return this._parent.t(source, name || this.getName(), params);
        },

        /**
         * Block events
         * События блока
         */
        events: function events() {
            return {
                onClick: $.noop,
                onResize: $.noop,
                // TODO event on close (remove || delete) current block
                onClose: $.noop,
                onAfterRender: $.noop,
                onHeightResize: $.noop,
                onAfterMove: $.noop,
                onColumnChangeSize: $.noop
            };
        },

        /**
         * Render html content for settings
         * Создание html-формы настроек
         *
         * @returns {string} html
         */
        renderSettings: function renderSettings() {
            var fieldsets = this.getMainFieldsets();
            $.merge(fieldsets, this.getFieldsets());

            var fields = this.getMainFields();
            $.extend(fields, this.getFields());

            var $form = $('<form></form>').addClass(this._parent.settingsClass(false, 'form'));

            for (var key in fieldsets) {
                $form.append(this.renderFieldset(fieldsets[key], fields));
            }

            var $buttons = $('<div></div>').addClass(this._parent.settingsClass(false, 'buttons'));
            $buttons.append($('<button type="submit"></button>').html(this.t('Save', {}, 'core')));

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
        renderFieldset: function renderFieldset(fieldset, fields) {
            var $fieldset = $('<fieldset></fieldset>');
            $fieldset.append($('<legend></legend>').html(fieldset.name));

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
        renderField: function renderField(name, field) {
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
        renderSelect: function renderSelect(name, value, values, multiple) {
            var $select = $('<select></select>');

            $select.attr('name', name);

            if (value instanceof Array === false) {
                value = [value];
            }

            for (var key in values) {
                var $option = $('<option></option>');
                $option.attr('value', key);
                $option.html(values[key]);
                if (_.contains(value, key)) {
                    $option.attr('selected', 'selected');
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
        renderTextInput: function renderTextInput(name, value) {
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
        getMainFieldsets: function getMainFieldsets() {
            return [{
                name: this.t('Main settings', {}, 'core'),
                fields: ['small', 'medium']
            }];
        },

        /**
         * Plugin custom fieldsets
         * Группы полей плагина
         */
        getFieldsets: function getFieldsets() {
            return [];
        },

        /**
         * Default main fields
         * Поля по умолчанию
         */
        getMainFields: function getMainFields() {
            var me = this;
            return {
                small: {
                    type: 'select',
                    multiple: false,
                    label: this.t('Small screen', {}, 'core'),
                    values: {
                        'default': this.t('Default action', {}, 'core'),
                        'small-1': this.t('Columns: ', {}, 'core') + 1,
                        'small-2': this.t('Columns: ', {}, 'core') + 2,
                        'small-3': this.t('Columns: ', {}, 'core') + 3,
                        'small-4': this.t('Columns: ', {}, 'core') + 4,
                        'small-5': this.t('Columns: ', {}, 'core') + 5,
                        'small-6': this.t('Columns: ', {}, 'core') + 6,
                        'small-7': this.t('Columns: ', {}, 'core') + 7,
                        'small-8': this.t('Columns: ', {}, 'core') + 8,
                        'small-9': this.t('Columns: ', {}, 'core') + 9,
                        'small-10': this.t('Columns: ', {}, 'core') + 10,
                        'small-11': this.t('Columns: ', {}, 'core') + 11,
                        'small-12': this.t('Columns: ', {}, 'core') + 12
                    },
                    getValue: function getValue() {
                        var value = 'default';
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function (c) {
                            if (c.startsWith('small-')) {
                                value = c;
                            }
                        });
                        return [value];
                    },
                    setValue: function setValue(value) {
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function (c) {
                            if (c.startsWith('small-')) {
                                $column.removeClass(c);
                            }
                        });
                        if (value != 'default') {
                            $column.addClass(value);
                        }
                    },
                    validate: function validate(value) {
                        return true;
                    }
                },
                medium: {
                    type: 'select',
                    multiple: false,
                    label: this.t('Medium screen', {}, 'core'),
                    values: {
                        'default': this.t('Default action', {}, 'core'),
                        'medium-1': this.t('Columns: ', {}, 'core') + 1,
                        'medium-2': this.t('Columns: ', {}, 'core') + 2,
                        'medium-3': this.t('Columns: ', {}, 'core') + 3,
                        'medium-4': this.t('Columns: ', {}, 'core') + 4,
                        'medium-5': this.t('Columns: ', {}, 'core') + 5,
                        'medium-6': this.t('Columns: ', {}, 'core') + 6,
                        'medium-7': this.t('Columns: ', {}, 'core') + 7,
                        'medium-8': this.t('Columns: ', {}, 'core') + 8,
                        'medium-9': this.t('Columns: ', {}, 'core') + 9,
                        'medium-10': this.t('Columns: ', {}, 'core') + 10,
                        'medium-11': this.t('Columns: ', {}, 'core') + 11,
                        'medium-12': this.t('Columns: ', {}, 'core') + 12
                    },
                    getValue: function getValue() {
                        var value = 'default';
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function (c) {
                            if (c.startsWith('medium-')) {
                                value = c;
                            }
                        });
                        return [value];
                    },
                    setValue: function setValue(value) {
                        var $column = me._parent.findColumn(me._htmlBlock);
                        $column.classes(function (c) {
                            if (c.startsWith('medium-')) {
                                $column.removeClass(c);
                            }
                        });
                        if (value != 'default') {
                            $column.addClass(value);
                        }
                    },
                    validate: function validate(value) {
                        return true;
                    }
                }
            };
        },

        /**
         * Plugin custom fields
         * Поля плагина
         */
        getFields: function getFields() {
            return [];
        },

        /**
         * Show settings form
         * Отобразить форму настроек
         */
        showSettings: function showSettings() {
            var me = this;
            this._parent.hideHelper();
            $(this.renderSettings()).mmodal({
                onSubmit: function onSubmit(element) {
                    var form = $(element).closest('form');

                    var fields = me.getMainFields();
                    $.extend(fields, me.getFields());

                    var data = form.serializeArray();
                    var errors = me.validateSettings(data, fields);
                    if (errors === true) {
                        me.setSettings(data, fields);
                        $('.mmodal-close').trigger('click');
                    } else {
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
        showSettingsErrors: function showSettingsErrors(errors) {
            for (var name in errors) {
                var id = this._parent.settingsId(name);
                var error_list = errors[name];

                var $errors_list = $('#' + id).siblings(this._parent.settingsClass(true, 'errors'));
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
        setSettings: function setSettings(data, fields) {
            for (var key in data) {
                var field_data = data[key];

                var name = field_data.name;
                var field = fields[name];

                field.setValue(field_data.value);
            }
            this.saveState();
        },

        /**
         * Validate settings
         * Проверить настройки на ошибки
         */
        validateSettings: function validateSettings(data, fields) {
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
        makePlug: function makePlug() {
            return $('<div/>').addClass(this._parent.plugClass(false));
        },

        /**
         * Render plug for block
         * Получение объекта-заглушки
         *
         * @returns {string} html
         */
        renderPlug: function renderPlug() {
            return this.makePlug();
        },

        /**
         * Show plug for block
         * Отобразить заглушку для блока
         */
        showPlug: function showPlug() {
            $(this._htmlBlock).addClass('plugged');
        },

        /**
         * Hide plug
         * Скрыть заглушку для блока
         */
        hidePlug: function hidePlug() {
            $(this._htmlBlock).removeClass('plugged');
        },

        /**
         * Make height resizer
         * Создать элемент изменения высоты блока
         *
         * @returns {*|jQuery}
         */
        makeHeightResizer: function makeHeightResizer(type) {
            var $heightResizer = $('<div/>');
            $heightResizer.append('<i class="updown-icon"></i>');
            return $heightResizer.data('type', type).addClass(this._parent.heightResizerClass(false));
        },

        /**
         * Render height resizer element
         * Получение элемента для изменения высоты блока
         *
         * @returns {string} html
         */
        renderHeightResizer: function renderHeightResizer(type) {
            type = type || 'min-height';
            return this.makeHeightResizer(type);
        },

        /**
         * Render html content of htmlblock for view
         * Получение контента блока для просмотра
         *
         * @returns {string}
         */
        getContent: function getContent() {
            return $(this._htmlBlock).clone()[0];
        },

        /**
         * Getting html block
         * Получение html block
         *
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _render: function _render() {
            var block = this.getHtmlBlock();
            return $(block);
        },
        /**
         * Render html content of htmlblock for editing
         * Получение контента блока для редактирования
         *
         * @returns {string}
         */
        render: function render() {
            return this._render()[0];
        },
        /**
         * Some changes! Update content in element!
         */
        saveState: function saveState() {
            this._parent.saveState();
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
})(window);
'use strict';

(function (meditor, meditorBlock) {
    "use strict";

    var TextBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Text block': 'Текст',
                'Click here to edit text': 'Щелкните для редактирования текста'
            }
        },
        editableClass: function editableClass(dotted) {
            var cn = 'text-editable';
            return dotted ? '.' + cn : cn;
        },
        getI18nName: function getI18nName() {
            return this.t('Text block');
        },

        // TODO refactoring
        getContent: function getContent() {
            var $htmlBlock = $(this._htmlBlock).clone(),
                $editable = $htmlBlock.find(this.editableClass(true));

            var content = CKEDITOR.instances[$editable.attr('id')].getData();

            $editable.remove();
            $htmlBlock.html(content);

            return $htmlBlock;
        },
        attachHandlers: function attachHandlers() {
            var $me = this;
            $(this._htmlBlock).on('click', function (e) {
                if ($(e.target).is(this) || $(e.target).closest('.plug').length > 0) {
                    $me.hidePlug();
                    $(this).find($me.editableClass(true)).focusEnd();
                }
            });
        },
        renderPlug: function renderPlug() {
            var $plug = this.makePlug();
            $plug.append($('<div/>').addClass('plug-info').html(this.t('Click here to edit text')));
            return $plug;
        },
        // TODO refactoring
        render: function render() {
            var $me = this;
            var block = this.getHtmlBlock(),
                $editable = $('<div/>'),
                html = $(block).html();
            $(block).html('');

            $editable.addClass(this.editableClass(false)).css('width', '100%').attr('contenteditable', true).html(html);
            var id = 'text-' + $(block).attr('rel');
            $editable.attr('id', id);
            $editable.on('blur', function () {
                // Empty html - Ckeditor
                if ($me.isEmpty($editable)) {
                    $me.showPlug();
                }
            });

            $(block).append($editable);
            $(block).append(this.renderPlug());
            $(block).append(this.renderHeightResizer('min-height'));

            if (!html) {
                this.showPlug();
            }

            return this._render()[0];
        },
        isEmpty: function isEmpty($editable) {
            return !$editable.html() || $editable.html() == '<p><br></p>';
        },
        events: function events() {
            return {
                onClick: $.noop,
                onResize: $.noop,
                onClose: $.noop,
                onAfterRender: this.onAfterRender
            };
        },
        onAfterRender: function onAfterRender() {
            var me = this;
            CKEDITOR.disableAutoInline = true;
            $('.text-block').each(function () {
                var editable = $(this).find(me.editableClass(true));
                if (editable.length && !editable.data('enabled')) {
                    editable.data('enabled', true);
                    CKEDITOR.inline(editable.attr('id'));
                    CKEDITOR.instances[editable.attr('id')].on('change', function () {
                        me.saveState();
                        if (!me.isEmpty(editable)) {
                            me.hidePlug();
                        }
                    });
                }
            });
        }
    });

    meditor.pluginAdd('text', TextBlock);
})(meditor, meditorBlock);

new function ($) {
    $.fn.focusEnd = function () {
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
    };
}(jQuery);
'use strict';

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
            youtube: {
                matcher: /(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
                params: {
                    autohide: 1,
                    fs: 1,
                    rel: 0,
                    hd: 1,
                    wmode: 'opaque',
                    enablejsapi: 1
                },
                url: '//www.youtube.com/embed/$3'
            },
            vimeo: {
                matcher: /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
                params: {
                    hd: 1,
                    show_title: 1,
                    show_byline: 1,
                    show_portrait: 0,
                    fullscreen: 1
                },
                url: '//player.vimeo.com/video/$1'
            }
        },
        defaultIFrameOptions: {
            'width': '100%'
        },
        format: function format(url, rez, params) {
            params = params || '';

            if ($.type(params) === "object") {
                params = $.param(params, true);
            }

            $.each(rez, function (key, value) {
                url = url.replace('$' + key, value || '');
            });

            if (params.length) {
                url += (url.indexOf('?') > 0 ? '&' : '?') + params;
            }

            return url;
        },
        holderClass: function holderClass(dotted) {
            var cn = 'meditor-video-holder';
            return dotted ? '.' + cn : cn;
        },
        events: function events() {
            return {
                onColumnChangeSize: this.correctBlock,
                onHeightResize: this.onHeightResize,
                onAfterMove: this.correctBlock
            };
        },
        getI18nName: function getI18nName() {
            return this.t('Video block');
        },
        renderPlug: function renderPlug() {
            var $plug = this.makePlug();
            $plug.append($('<div/>').addClass('plug-info').html(this.t('Set video url in settings')));
            return $plug;
        },
        render: function render() {
            var block = this.getHtmlBlock();
            $(block).append(this.renderPlug());
            if ($(block).find('iframe').length <= 0) {
                this.showPlug();
            }
            $(block).append(this.renderHeightResizer('height'));
            return this._render()[0];
        },
        /**
         * Settings
         */
        getFieldsets: function getFieldsets() {
            return [{
                name: this.t('Video settings'),
                fields: ['url']
            }];
        },
        getFields: function getFields() {
            var me = this;
            return {
                url: {
                    type: 'text',
                    multiple: false,
                    label: this.t('Video url'),
                    getValue: function getValue() {
                        var block = me.getHtmlBlock();
                        var url = $(block).data('url') ? $(block).data('url') : '';
                        return url;
                    },
                    setValue: function setValue(value) {
                        for (var key in me.types) {
                            var item = me.types[key];
                            var rez = value.match(item.matcher);
                            if (rez) {
                                var url = me.format(item.url, rez, item.params);
                                me.insertVideo(value, url);
                                break;
                            }
                        }
                    },
                    validate: function validate(value) {
                        for (var key in me.types) {
                            var item = me.types[key];
                            var rez = value.match(item.matcher);
                            if (rez) {
                                return true;
                            }
                        }
                        return [me.t('This video hosting is not supported!')];
                    }
                }
            };
        },
        insertVideo: function insertVideo(url, objectUrl) {
            var block = this.getHtmlBlock();
            var object = this.makeObject(objectUrl);
            $(block).find('iframe').remove();
            $(block).append(object);
            $(block).attr('data-url', url).data('url', url);
            this.hidePlug();
            this.correctBlock();
            return block;
        },
        makeObject: function makeObject(url) {
            var iframe = $('<iframe/></iframe>').css(this.defaultIFrameOptions);
            iframe.attr('src', url);
            return iframe;
        },
        correctVideoBlock: function correctVideoBlock(block, width, height) {
            var $iframe = $(block).find('iframe');
            width = width || false;
            height = height || false;

            if ($iframe.length) {
                if (width && height) {
                    $iframe.css('height', height);
                } else {
                    var blockWidth = $(block).width();
                    var ratio = 0.6;
                    var blockHeight = blockWidth * ratio;
                    $iframe.css('height', blockHeight);
                    $(block).css('height', blockHeight);
                }
            }
            this.saveState();
        },
        correctBlock: function correctBlock() {
            var block = this.getHtmlBlock();
            this.correctVideoBlock(block);
        },
        onHeightResize: function onHeightResize() {
            var block = this.getHtmlBlock();
            this.correctVideoBlock(block, $(block).width(), $(block).height());
        }
    });

    meditor.pluginAdd('video', VideoBlock);
})(meditor, meditorBlock);
'use strict';

(function (meditor, meditorBlock) {
    "use strict";

    var LostBlock = meditorBlock.extend({
        getI18nName: function getI18nName() {
            return this.t('Lost block');
        }
    });

    meditor.pluginAdd('lost', LostBlock);
})(meditor, meditorBlock);
'use strict';

(function (meditor, meditorBlock) {
    "use strict";

    var SpaceBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Space block': 'Отступ'
            }
        },
        getI18nName: function getI18nName() {
            return this.t('Space block');
        }
    });

    meditor.pluginAdd('space', SpaceBlock);
})(meditor, meditorBlock);
'use strict';

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
        holderClass: function holderClass(dotted) {
            var cn = 'meditor-image-holder';
            return dotted ? '.' + cn : cn;
        },
        flowHandlerClass: function flowHandlerClass(dotted) {
            var cn = 'meditor-image-flow-handler';
            return dotted ? '.' + cn : cn;
        },
        events: function events() {
            return {
                onColumnChangeSize: this.correctBlock,
                onAfterMove: this.correctBlock
            };
        },
        getI18nName: function getI18nName() {
            return this.t('Image block');
        },
        /**
         * Settings
         */
        getFieldsets: function getFieldsets() {
            return [{
                name: this.t('Image settings'),
                fields: ['cover']
            }];
        },
        getFields: function getFields() {
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
                    getValue: function getValue() {
                        var block = me.getHtmlBlock();
                        return $(block).find(me.holderClass(true)).css('background-size');
                    },
                    setValue: function setValue(value) {
                        var block = me.getHtmlBlock();
                        $(block).find(me.holderClass(true)).css('background-size', value);
                        me.correctBlock();
                    },
                    validate: function validate(value) {
                        return true;
                    }
                }
            };
        },
        attachHandlers: function attachHandlers() {
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
                r.assignBrowse($flowHandler[0], false, false, { accept: 'image/*' });
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
        getFlowHandler: function getFlowHandler() {
            return $('<div/>').addClass(this.flowHandlerClass(false)).css(this.flowHandlerOptions);
        },
        flowTemplate: function flowTemplate() {
            var drop = this.t('Drop files here to upload or');
            var select = this.t('select images');
            return '<div class="flow-drop" ondragenter="$(this).addClass(\'flow-dragover\');" ondragend="$(this).removeClass(\'flow-dragover\');" ondrop="$(this).removeClass(\'flow-dragover\');">' + drop + ' <a class="flow-browse-image"><u>' + select + '</u></a>' + '</div>';
        },
        renderPlug: function renderPlug() {
            var $plug = this.makePlug();
            // $plug.append($('<div/>').addClass('plug-info').html(this.t('Drop image here')));
            $plug.append($('<div/>').addClass('plug-info').html(this.flowTemplate()));
            return $plug;
        },
        render: function render() {
            var $block = $(this.getHtmlBlock());
            $block.append(this.renderPlug());
            if ($block.find('img').length <= 0) {
                this.showPlug();
            }
            $block.append(this.renderHeightResizer('height'));
            return this._render()[0];
        },
        droppedFiles: function droppedFiles(files, block) {
            var $me = this;
            if (files.length > 0) {
                var file = files[0];
                this.readFileAsDataURL(file).then(function (data) {
                    $me.insertFile(file, data, block);
                });
            }
        },
        insertFile: function insertFile(file, data, block) {
            var $me = this,
                $block = $(block);
            this.hidePlug();
            $block.find(this.holderClass(true)).remove();
            var $img = $('<img/>').attr('src', data).css({ 'display': 'none' });
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
        getContent: function getContent() {
            var $htmlBlock = $(this._htmlBlock).clone();
            $htmlBlock.find(this.flowHandlerClass(true)).remove();
            return $htmlBlock;
        },
        correctImageBlock: function correctImageBlock(block) {
            var $block = $(block);
            var $img = $block.find('img');
            if ($img.length) {
                var img = $img[0];
                if (this.isCover()) {
                    $block.css({ 'height': $block.width() * (img.height / img.width) });
                } else {
                    $block.css({ 'height': img.height });
                }
            }
            this.saveState();
        },
        readFileAsDataURL: function readFileAsDataURL(file) {
            return $.Deferred(function (deferred) {
                $.extend(new FileReader(), {
                    onload: function onload(e) {
                        var data = e.target.result;
                        deferred.resolve(data);
                    },
                    onerror: function onerror() {
                        deferred.reject(this);
                    }
                }).readAsDataURL(file);
            }).promise();
        },
        correctBlock: function correctBlock() {
            var block = this.getHtmlBlock();
            this.correctImageBlock(block);
        },
        getBackgroundSize: function getBackgroundSize() {
            var block = this.getHtmlBlock();
            return $(block).find(this.holderClass(true)).css('background-size');
        },
        isCover: function isCover() {
            return this.getBackgroundSize() == 'cover';
        }
    });

    meditor.pluginAdd('image', ImageBlock);
})(meditor, meditorBlock);
'use strict';

(function (meditor, meditorBlock) {
    "use strict";

    var mapItem = 0;

    var MapBlock = meditorBlock.extend({
        i18n: {
            'ru': {
                'Map block': 'Блок с картой'
            }
        },
        map: undefined,
        events: function events() {
            var self = this;
            return {
                onAfterRender: function onAfterRender() {
                    var container = $('.map-' + mapItem)[0];
                    this.map = L.map(container).setView([51.505, -0.09], 13);

                    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'OSM',
                        maxZoom: 18
                    }).addTo(this.map);

                    mapItem++;
                }
            };
        },
        getI18nName: function getI18nName() {
            return this.t('Map block');
        },
        getContent: function getContent() {
            var center = this.map.getCenter(),
                $block = this.getHtmlBlock(),
                className = 'col-' + this._parent.getColumnValue($block);

            if ($block.hasClass('first')) {
                className += ' first';
            }

            return this._parent.renderTemplate('/plugins/map/map_save.jst', {
                id: L.Util.stamp(this.map),
                lat: center.lat,
                lng: center.lng,
                zoom: this.map.getZoom(),
                className: className
            });
        },
        render: function render() {
            var $block = this._render(),
                tpl = this._parent.renderTemplate('/plugins/map/map.jst', { mapItem: mapItem });

            $block.append(tpl);
            return $block[0];
        }
    });

    meditor.pluginAdd('map', MapBlock);
})(meditor, meditorBlock);