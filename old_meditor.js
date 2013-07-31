(function(window, $) {
    "use strict";

    var meditor = (function () {
        var _plugins = {};

        return {
            init: function(element, options) {
                var i = 0;
                var plugins = {};
                if (options.plugins)
                    for (i in options.plugins){
                        var plugin_name = options.plugins[i];
                        if (_plugins[plugin_name])
                            plugins[plugin_name] = _plugins[plugin_name]
                    }
                options['plugins'] = plugins;
                return new EditorCore(element, options);
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