"use strict";

import { strtr } from './utils';

export default class Translate {
    dict = {};

    add(domain, data) {
        this.dict[domain] = data;
    }

    trans(domain, id, parameters = {}) {
        let message = this.dict[domain];
        if (message) {
            return strtr(message, parameters);
        }

        return id;
    }
}