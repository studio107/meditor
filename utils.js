var extend = function (dest) { // (Object[, Object, ...]) ->
    var sources = Array.prototype.slice.call(arguments, 1),
        i, j, len, src;

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