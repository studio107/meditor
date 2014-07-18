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

        // TODO refactoring
        this.pluginsInit();

        this.setContent();
        $(editor).append(this.createControls(), area);
        this.$element.after(this.editor);
        this.initSortable();
        this.pluginsAfterRender();
        return this;
    },

    pluginsInit: function() {
        // TODO refactoring
        var name;

        for(name in this.options.plugins) {
            var plugin = this.options.plugins[name];
            this._plugins[name] = new plugin(name, this);
        }
    },

    t: function (source, category, params) {
        return this._i18n.t(source, category || 'core', params || {}, this._language);
    },
    blockClass: function (dotted) {
        var cn = this.cn + '-block';
        return dotted ? '.' + cn : cn;
    },
    rowClass: function (dotted) {
        var cn = 'row';
        return dotted ? '.' + cn : cn;
    },
    columnClass: function (dotted) {
        var cn = 'column';
        return dotted ? '.' + cn : cn;
    },
    colClass: function (dotted, value) {
        var append = '';
        if (value)
            append = value.toString();
        var cn = 'large-' + append;
        return dotted ? '.' + cn : cn;
    },
    highlighterClass: function (dotted) {
        var cn = this.cn + '-highlighter';
        return dotted ? '.' + cn : cn;
    },
    movingClasses: function() {
        return this.rowClass(true) + ', ' + this.columnClass(true) + ', ' + this.blockClass(true);
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
            ///console.log(me.getContent());
            me.$element.val(me.getContent());
            return true;
        });

        $(document).on('click', me.delete_class(true), function () {
            var confirmMessage = me.t('You really want to remove this block?');

            if (confirm(confirmMessage)) {
                me.helperable.remove();
                me.hideHelper();
                me.clearStrings();
            }
        });

        $(document).on('mouseover', 'body:not(.moving, .resizing) ' + me.blockClass(true), function (e) {
            var element = $(e.target).closest(me.blockClass(true));
            if (element.length >= 0){
                me.showHelper(element);
            }
        });

        $(document).on('mouseout', me.blockClass(true), function (e) {
            if ($(e.relatedTarget).closest(me.helpers_class(true)).length <= 0){
                me.hideHelper();
            }
        });

        $(document).on('selectstart', me.blockClass(true), function(e){
            if ($('body').hasClass('unselectable')){
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    },
    showHelper: function(element) {
        var helpers = $(this.editor).find(this.helpers_class(true));

        helpers.css({
            'display': 'block'
        });

        var element_width = element.width();
        var helpers_width = helpers.width();

        helpers.css({
            'margin-left': -helpers_width/2,
            'top': element.offset().top,
            'left': element.offset().left + element_width/2
        });
        this.helperable = element;
    },
    hideHelper: function() {
        var helpers = $(this.editor).find(this.helpers_class(true));
        helpers.css({
            'display': 'none'
        });
        this.helperable = undefined;
    },
    initSortable: function () {
        var $me = this;
        var moving_selector = this.move_class(true);
        $(document).on('mousedown', moving_selector, function () {
            $me.movable = $me.helperable;
            $me.startMove();
        });
        $(document).on('mousedown', this.columnClass(true) + ' ' + $me.resizer_class(true), function () {
            $me.resizable = $me.findColumn($(this));
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
        var plugin = this.options.plugins[name];
        if(!plugin) {
            plugin = this.options.plugins['lost'];
        }
        return new plugin(name, this);
    },
    getBlockPlugin: function (block) {
        return this.plugins[parseInt($(block).attr('rel'))];
    },
    setUnselectable: function() {
        $('body').addClass('unselectable');
    },
    setSelectable: function() {
        $('body').removeClass('unselectable');
    },
    /**
     * Начали перетаскивать
     */
    startMove: function () {
        var $me = this;
        $($me.movable).addClass($me.moving_class(false));
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
    calculateOffset: function(elem, e){
        var event = e.originalEvent;

        var top = event.offsetY?event.offsetY:event.layerY;
        var left = event.offsetX?event.offsetX:event.layerX;

        var element = this.findColumn(elem);
        if (!element.length && this.isRow(elem)){
            element = elem;
        }
        if (element.length){
            top = e.pageY - element.offset()['top'];
            left = e.pageX - element.offset()['left'];
        }
        return {'left': left, 'top': top};
    },
    /**
     * Закончили перетаскивать
     * @param drop_to
     * @param offset
     */
    stopMove: function (drop_to, offset) {
        drop_to = $(drop_to);
        $(this.movable).removeClass(this.moving_class(false));
        this.setSelectable();
        $('body').removeClass('moving');
        this.clearHighlight();
        $(this.movingClasses()).off('mousemove');
        $(this.movingClasses()).off('mouseout');
        $(document).off('mouseup');

        var dropped_to = this.findColumn(drop_to);
        var direction = drop_to.is($(this.movable)) ? 'y' : 'xy';
        if (!dropped_to.length && this.isRow(drop_to)){
            dropped_to = drop_to;
            direction = 'y';
        }
        if (dropped_to.length) {
            var drop_from = this.findColumn(this.movable);
            this.dropped($(this.movable), drop_from, dropped_to, this.getDirection(dropped_to, offset, direction));
        }

        this.movable = false;
    },
    /**
     * Расчет изменений
     * @param element
     * @param drop_from
     * @param drop_to (element column or row only)
     * @param direction
     */
    dropped: function (element, drop_from, drop_to, direction) {
        var $me = this;

        var col_to = this.isRow(drop_to) ? 12 : this.getColumnValue(drop_to);

        if (direction == 'top' || direction == 'bottom') {

            // Добавляем новую строку
            if (col_to == this.options.columns) {
                var to_row = this.isRow(drop_to) ? drop_to : drop_to.closest(this.rowClass(true));
                var row = this.wrapToRowColumn(element);

                if (direction == 'top') {
                    to_row.before(row);
                } else if (direction == 'bottom') {
                    to_row.after(row);
                }
            // Добавляем в хвост столбца
            } else {
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
                    $(drop_to).after($newColumn)
                }
            }
        }

        this.clearStrings();
    },
    /**
     * Подсветить блок
     * @param element // HTMLElement
     * @param offset // {'left': int,'top': int}
     */
    highlightBlock: function (element, offset) {
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

            if (direction == 'top' || direction == 'bottom') {
                this.highlightElement($column, direction);
            } else {
                var col_to = this.getColumnValue($column);
                if (col_to > 3){
                    this.highlightElement($column, direction);
                }
            }
        } else if(this.isRow(element)) {
            direction = this.getDirection(element, offset, 'y');
            this.highlightElement(element, direction);
        }
        return false;
    },
    /**
     * Подсветить конкретный элемент
     * @param element // HTMLElement
     * @param direction // string left|top|right|bottom
     */
    highlightElement: function (element, direction) {
        var highlighter = $('<div/>').addClass(this.highlighterClass(false)).addClass(direction);
        element.append(highlighter);
    },
    /**
     * Убрать подсветку блоков
     */
    clearHighlight: function () {
        $(this.highlighterClass(true)).remove();
    },
    /**
     * Прибираемся в строчках
     */
    clearStrings: function () {
        var $me = this;
        var counted = 0;

        $($me.area).find($me.rowClass(true)).each(function () {
            counted = 0;
            $(this).find($me.columnClass(true)).each(function () {
                if ($(this).find($me.blockClass(true)).length > 0){
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

                $(this).find($me.columnClass(true)).each(function(index){
                    var column = $(this);
                    var current = $me.getColumnValue(column);

                    if (index == count_blocks - 1) {
                        $me.setColumnValue(column, current+append_last_block);
                    }else{
                        $me.setColumnValue(column, current+append_per_block);
                    }
                });
            }

            if ($(this).find($me.columnClass(true)).length == 0) {
                $(this).remove();
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
        $('body').addClass('unselectable').addClass('resizing');

        $(document).on('mouseup', function (e) {
            var event = e.originalEvent;
            var offset = {
                'left': event.offsetX?event.offsetX:event.layerX,
                'top': event.offsetY?event.offsetY:event.layerY
            };
            $me.stopResize(e.target, offset);
        });
        var move_function = function (e) {
            var event = e.originalEvent;
            var offset = {
                'left': event.offsetX?event.offsetX:event.layerX,
                'top': event.offsetY?event.offsetY:event.layerY
            };
            $me.resizing(e.currentTarget, offset);
        };
        $(this.resizable).on('mousemove', move_function);
        $($(this.resizable).prev()).on('mousemove', move_function);
    },
    stopResize: function (target, offset) {
        $('body').removeClass('unselectable').removeClass('resizing');

        $(document).off('mouseup');
        $(this.resizable).off('mousemove');
        $($(this.resizable).prev()).off('mousemove');
    },
    resizing: function (target, offset) {
        var displacement = 0;
        var $target = $(target);

        if ($target.is($(this.resizable))) {
            displacement = offset.left;
            if (displacement > this.options.colmargin) {
                if (this.dec_column_value($target, 1)) {
                    this.incColumnValue($(this.resizable_prev), 1);
                }
            }
        } else if ($target.is($(this.resizable_prev))) {
            displacement = $target.width() - offset.left;
            if (displacement > this.options.colmargin) {
                if (this.dec_column_value($target, 1)) {
                    this.incColumnValue($(this.resizable), 1);
                }
            }
        }
    },
    /**
     * Получение ширины колонки
     */
    getColumnValue: function (block) {
        var classes = block[0].classList;

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
        var $block = $(block);
        var current = this.getColumnValue(block);
        $block.removeClass(this.colClass(false, current));
        $block.addClass(this.colClass(false, value));
        return $block;
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
        if (curr - value > 1) {
            this.setColumnValue(block, curr - value);
            return true;
        } else {
            return false;
        }
    },
    createResizeHandler: function () {
        return $('<span/>').addClass(this.resizer_class(false));
    },
    /**
     * Cоздание чистой строки
     * @returns HTMLElement
     */
    createPureRow: function () {
        return $('<div/>', {
            class: 'row'
        });
    },
    /**
     * Cоздание чистого блока
     * @returns HTMLElement
     */
    createPureColumn: function () {
        return $('<div/>', {
            class: this.columnClass(false) + ' large-12'
        }).append(this.createResizeHandler());
    },
    /**
     * Обернуть элемент в строку и столбец
     * @returns HTMLElement
     */
    wrapToRowColumn: function ($element) {
        var row = this.createPureRow();
        return row.append(this.createPureColumn().append($element));
    },
    /**
     * Обернуть элемент в столбец
     * @returns HTMLElement
     */
    wrapToColumn: function ($element) {
        return this.createPureColumn().append($element);
    },
    /**
     * Поиск колонки
     * @returns HTMLElement
     */
    findColumn: function (element) {
        var $element = $(element);
        if ($element && $element.length > 0){
            return $element.closest(this.columnClass(true));
        }
        return $();
    },
    /**
     * Проверка на строку
     * @returns bool
     */
    isRow: function (element) {
        return $(element).hasClass(this.rowClass(false));
    },
    /**
     * Добавляем контролы к редактору
     */
    createControls: function () {
        // TODO к текущему шагу уже должны быть инициализированы плагины

        var $controls = $('<div/>', {class: this.controls_class(false)}),
            $me = this,
            controlsHtml = this.renderTemplate('/templates/editor.jst', {
                plugins: this._plugins
            });

        $controls
            .html(controlsHtml)
            .find('.add-block')
            .on('click', function (e) {
                e.preventDefault();

                var $data = $(this).data();
                $me.createBlock($data);
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
    createBlock: function (data) {
        var $block = $('<div/>', {
            'data-plugin': data['plugin']
        });
        $block.addClass(this.blockClass(false));
        this.addBlock($block);
    },
    /**
     * Добавление нового блока на страничку
     * @param block
     */
    addBlock: function (block) {
        var row = this.createPureRow();
        var column = this.createPureColumn();
        var maked = this.makeBlock(block);
        column.append(maked);
        row.append(column);
        $(this.area_class(true)).append(row);
        this.blockAfterRender(block);
    },
    /**
     * Установка прошлого контента
     */
    setContent: function () {
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
        var row = this.createPureRow();
        $(content).find($me.rowClass(true)).each(function (index) {
            row = $me.createPureRow();
            $(this).find($me.columnClass(true)).each(function(index){
                var column = $me.createPureColumn();
                $(this).find($me.blockClass(true)).each(function(index){
                    column.append($me.makeBlock(this));
                });
                row.append(column);
            });
            $($me.area).append(row);
        });
    },
    /**
     * Подготовка блока к добавлению на страницу
     * @param element
     */
    makeBlock: function (element) {
        var name = $(element).data('plugin'),
            plugin = this.getPlugin(name);

        return this.initPlugin(plugin, element, name);
    },
    initPlugin: function (plugin, element, name) {
        this.plugins.push(plugin);

        // TODO ugly, refactor it.
        $(element).attr('rel', plugin.getNumber());
        if (!$(element).hasClass(name + '-block')) {
            $(element).addClass(name + '-block');
        }
        $(element).attr('data-plugin', name);
        $(element).data('plugin', name);

        return plugin.setHtmlBlock(element).render();
    },
    blockAfterRender: function(block){
        var plugin = this.getBlockPlugin(block);
        this.pluginAfterRender(plugin);
    },
    pluginsAfterRender: function(){
        var key = 0;
        for (key in this.plugins){
            this.pluginAfterRender(this.plugins[key]);
        }
    },
    pluginAfterRender: function(plugin){
        plugin.fireEvent('onAfterRender');
    },
    /**
     * Получение очищенного контента из блока
     * @returns {*}
     */
    getContent: function () {
        var $me = this;
        var out = $('<div/>');
        $(this.area).find(this.rowClass(true)).each(function () {
            var cleared = $me.getRowContent($(this));
            out.append(cleared);
        });
        return out.html();
    },
    getRowContent: function (row) {
        var $me = this;
        var out = $('<div/>').addClass(this.rowClass(false));
        row.find(this.blockClass(true)).each(function () {
            var cleared = $me.cleanBlock($(this));
            out.append(cleared);
        });
        return out;
    },
    /**
     * Очистка блока от данных редактора. Используется перед сохранением.
     *
     * @param block
     * @returns {*|string}
     */
    cleanBlock: function (block) {
        var plugin = this.getBlockPlugin(block);

        block = plugin.getContent();

        $(block).find(this.helpers_class(true) + ', ' + this.resizer_class(true)).remove();
        $(block).removeAttr('rel');

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