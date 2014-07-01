(function (window) {
    "use strict";

    var i18n = (function () {
        var dictionary = {};

        return {
            addToDictionary: function (dict, category) {
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
            getDictionary: function (language) {
                return dictionary[language] || {};
            },

            setDictionary: function (dict, lang) {
                if (typeof dictionary[lang] === 'undefined') {
                    lang = this.getLanguage();
                }
                dictionary[lang] = dict;
            },

            t: function (str, category, params, lang) {
                var transl = str, dict = this.getDictionary(lang);

                if (typeof category !== 'undefined' && category in dict) {
                    dict = dict[category] || {};
                }

                if (str in dict) {
                    transl = dict[str];
                }

                return this.printf(transl, params);
            },

            printf: function (source, params) {
                if (!params) return source;

                var nS = "";
                var tS = source.split("%s");

                for (var i = 0; i < params.length; i++) {
                    if (tS[i].lastIndexOf('%') == tS[i].length - 1 && i != params.length - 1)
                        tS[i] += "s" + tS.splice(i + 1, 1)[0];
                    nS += tS[i] + params[i];
                }
                return nS + tS[tS.length - 1];
            }
        };
    }());

    var meditor = (function () {
        var _plugins = {};

        return {
            i18n: i18n,
            init: function (element, options) {
                if (element == undefined) {
                    throw "element is undefined";
                }

                if (typeof element == 'string') {
                    element = $(element);
                }

                options['plugins'] = this.preparePlugins(options['plugins']) || {};

                return new EditorCore(element, options, this.i18n);
            },
            preparePlugins: function (rawPlugins) {
                var i, name, plugins = {};

                for (i in rawPlugins) {
                    name = rawPlugins[i];

                    if (name in _plugins) {
                        plugins[name] = _plugins[name];
                    }
                }

                return plugins
            },
            pluginAdd: function (name, object) {
                _plugins[name] = object;

            },
            plugins: function () {
                return _plugins;
            }
        };
    }());

    window.meditor = meditor;

    return meditor;
})(window);