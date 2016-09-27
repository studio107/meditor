"use strict";

import { strtr } from './utils';
import Translate from './Translate';

const translator = new Translate;

export default class Editor {
    defaultOptions = {
        element: undefined,
        blocks: []
    };
    translator = undefined;

    constructor(options = {}) {
        this.options = { ...this.defaultOptions, ...options };
        this.translator = new Translate;

        this.render();
    }

    static loadTranslate(domain, data) {
        translator.add(domain, data);
    }

    getEditorTemplate() {
        let username = 'max';
        return `<div>${username}</div>`;
    }

    render() {
        $(this.getEditorTemplate()).appendTo(this.options.element)
    }
}