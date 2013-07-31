(function(window) {
    "use strict";

    var i18n = (function () {
        var language = 'en',
            dictionary = {
                'en': {
                    'hello world': 'Привет'
                }
            };

        return {
            setLanguage: function (lang) {
                language = lang;
            },
            getLanguage: function () {
                return language;
            },
            addToDictionary: function (dict, category) {
                for(var l in dict) {
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
                if (typeof dictionary[language] !== 'undefined') {
                    return dictionary[language];
                } else {
                    return {};
                }
            },

            setDictionary: function (dict, lang) {
                if (typeof dictionary[lang] === 'undefined') {
                    lang = this.getLanguage();
                }
                dictionary[lang] = dict;
            },

            t: function (str, category, params) {
                var transl = str, dict = this.getDictionary(language);

                if (typeof category !== 'undefined' && typeof dict[category] !== 'undefined') {
                    dict = dictionary[category];
                }

                if (dict[str]) {
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
            init: function(element, options) {
                var i = 0;
                var plugins = {};
                if (!options.plugins)
                    options['plugins'] = [];

                for (i in options.plugins){
                    var plugin_name = options.plugins[i];
                    if (_plugins[plugin_name])
                        plugins[plugin_name] = _plugins[plugin_name]
                }
                options['plugins'] = plugins;
                return new EditorCore(element, options, this.i18n);
            },
            pluginAdd: function(name, object) {
                _plugins[name] = object;

            },
            plugins: function() {
                return _plugins;
            }
        };
    }());

    window.meditor = meditor;

    return meditor;
})(window);