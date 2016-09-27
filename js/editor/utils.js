"use strict";

export default {
    strtr: (template, parameters = {}) => {
        for (let key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                template = template.replace('/' + key + '/g', parameters[key]);
            }
        }
        return template;
    }
}