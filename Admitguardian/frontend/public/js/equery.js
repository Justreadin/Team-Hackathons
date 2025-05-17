/**
 * @license
 * EQuery.js 3.0.4 <https://enemetronics.com.ng/equery/>
 * By Sharon Abodunrin
 * Copyright Enemetronics. <https://enemetronics.com.ng/privacy-policy>
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('global/window'), require('global/document')) : typeof define === 'function' && define.amd ? define(['global/window', 'global/document'], factory) : (global = global || self,
        global.EQuery = factory(global.window, global.document));
    if (!global.document) { throw new Error('EQuery need a window and a document'); }
}(this, (function (window$1, document) {

    window$1 = window$1 && Object.prototype.hasOwnProperty.call(window$1, 'default') ? window$1['default'] : window$1;
    document = document && Object.prototype.hasOwnProperty.call(document, 'default') ? document['default'] : document;

    /**
     * @file create-logger.js
     * @module create-logger
     */

    let _func;
    let history = [];
    let time = () => {return `[${/\d\d\:\d\d\:\d\d/.exec(Date())[0]}]`};
    let LogByTypeFactory = function LogByTypeFactory(name, log) {
        return function (type, level, args) {
            let _args = args
            let lvl = log.levels[level];
            let lvlRegExp = new RegExp('^(' + lvl + ')$');

            if (type !== 'log') {
                args.unshift(type.toUpperCase() + ':');
            }

            args.unshift(`${time()} ${name}:`);

            if (history) {
                history.push([].concat(args));

                let splice = history.length - 1000;
                history.splice(0, splice > 0 ? splice : 0);
            }

            if (!console) { return; }
            let fn = console[type];
            if (!fn && type === 'debug') { fn = console.info || console.log; }
            if (!fn || !lvl || !lvlRegExp.test(type)) { return; }

            fn[Array.isArray(args) ? 'apply' : 'call'](console, args);
            if (_func !== undefined) _func(_args);
        };
    };
    let excludedElt = ['select', 'options'];

    function createLogger(name) {
        let level = 'info';
        let logByType;

        class log {
            constructor() {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                logByType('log', level, args);
            }
            static createLogger(subname) {
                return createLogger(name + ': ' + subname);
            }
            static level(lvl) {
                if (typeof lvl === 'string') {
                    if (!log.levels.hasOwnProperty(lvl)) {
                        throw new Error('\'' + lvl + '\' in not a valid log level');
                    }

                    level = lvl;
                }

                return level;
            }
            static history() {
                return history ? [].concat(history) : [];
            }
            static error() {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return logByType('error', level, args);
            }
            static warn() {
                for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                return logByType('warn', level, args);
            }
            static debug() {
                for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                }

                return logByType('debug', level, args);
            }
            static printLog(func) { _func = func; }
        }

        logByType = LogByTypeFactory(name, log);

        log.levels = {
            all: 'debug|log|warn|error',
            off: '',
            debug: 'debug|log|warn|error',
            info: 'log|warn|error',
            warn: 'warn|error',
            error: 'error',
            DEFAULT: level
        };

        log.history.filter = function (fname) {
            return (history || []).filter(function (historyItem) {
                return new RegExp('.*' + fname + '.*').test(historyItem[0]);
            });
        };

        log.history.clear = function () {
            if (history) {
                history.length = 0;
            }
        };

        log.history.disable = function () {
            if (history !== null) {
                history.length = 0;
                history = null;
            }
        };

        log.history.enable = function () {
            if (history === null) {
                history = [];
            }
        };
        
        return log;
    }

    const log = createLogger('EQuery');

    /**
     * @file guid.js
     * @module guid
     */
    let _initialGuid = 3;
    let _guid = _initialGuid;
    function newGUID() {
        return _guid++;
    }

    /**
     * @file dom-data.js
     * @module dom-data
     */
    let FakeWeakMap;

    if (!window$1.WeakMap) {
        FakeWeakMap = function () {
            function FakeWeakMap() {
                this.vdata = `vdata${Math.floor(window$1.performance && window$1.performance.now() || Date.now())}`;
                this.data = {};
            }

            let _proto = FakeWeakMap.prototype;

            _proto.set = function set(key, value) {
                let access = key[this.vdata] || newGUID();

                if (!key[this.vdata]) {
                    key[this.vdata] = access;
                }

                this.data[access] = value;
                return this;
            };

            _proto.get = function get(key) {
                let access = key[this.vdata];

                if (access) {
                    return this.data[access];
                }

                log('We have no data for this element', key);
                return undefined;
            };

            _proto.has = function has(key) {
                let access = key[this.vdata];
                return access in this.data;
            };

            _proto['delete'] = function _delete(key) {
                let access = key[this.vdata];

                if (access) {
                    delete this.data[access];
                    delete key[this.vdata];
                }
            };

            return FakeWeakMap;
        }();
    }

    let DomData = window$1.WeakMap ? new WeakMap() : new FakeWeakMap();

    /**
     * @file events.js
     * @module events
     */

    function _cleanUpEvents(elemt, type) {
        if (!DomData.has(elemt)) {
            return;
        }

        let data = DomData.get(elemt);

        if (data.handlers[type].length === 0) {
            delete data.handlers[type];

            if (elemt.removeEventListener) {
                elemt.removeEventListener(type, data.dispatcher, false);
            } else if (elemt.detachEvent) {
                elemt.detachEvent(`on${type}`, data.dispatcher);
            }
        }


        if (Object.getOwnPropertyNames(data.handlers).length <= 0) {
            delete data.handlers;
            delete data.dispatcher;
            delete data.disabled;
        }


        if (Object.getOwnPropertyNames(data).length === 0) {
            DomData['delete'](elemt);
        }
    }

    function _handleMultipleEvents(fn, elemt, types, callback) {
        types.forEach(function (type) {
            fn(elemt, type, callback);
        });
    }
    
    function fixEvent(event) {
        if (event.fixed_) {
            return event;
        }

        function returnTrue() {
            return true;
        }

        function returnFalse() {
            return false;
        }

        if (!event || !event.isPropagationStopped) {
            let old = event || window$1.event;
            event = {};
            for (let key in old) {
                if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation' && key !== 'webkitMovementX' && key !== 'webkitMovementY') {
                    if (!(key === 'returnValue' && old.preventDefault)) {
                        event[key] = old[key];
                    }
                }
            }


            if (!event.target) {
                event.target = event.srcElement || document;
            }


            if (!event.relatedTarget) {
                event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
            }


            event.preventDefault = function () {
                if (old.preventDefault) {
                    old.preventDefault();
                }

                event.returnValue = false;
                old.returnValue = false;
                event.defaultPrevented = true;
            };

            event.defaultPrevented = false;

            event.stopPropagation = function () {
                if (old.stopPropagation) {
                    old.stopPropagation();
                }

                event.cancelBubble = true;
                old.cancelBubble = true;
                event.isPropagationStopped = returnTrue;
            };

            event.isPropagationStopped = returnFalse;

            event.stopImmediatePropagation = function () {
                if (old.stopImmediatePropagation) {
                    old.stopImmediatePropagation();
                }

                event.isImmediatePropagationStopped = returnTrue;
                event.stopPropagation();
            };

            event.isImmediatePropagationStopped = returnFalse;

            if (event.clientX !== null && event.clientX !== undefined) {
                let doc = document.documentElement;
                let body = document.body;
                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }


            event.which = event.charCode || event.keyCode;

            if (event.button !== null && event.button !== undefined) {
                event.button = event.button & 1 ? 0 : event.button & 4 ? 1 : event.button & 2 ? 2 : 0;
            }
        }

        event.fixed_ = true;

        return event;
    }
    
    let _supportsPassive;

    let supportsPassive = function supportsPassive() {
        if (typeof _supportsPassive !== 'boolean') {
            _supportsPassive = false;

            try {
                let opts = Object.defineProperty({}, 'passive', {
                    get: function get() {
                        _supportsPassive = true;
                    }
                });
                window$1.addEventListener('test', null, opts);
                window$1.removeEventListener('test', null, opts);
            } catch (e) {}
        }

        return _supportsPassive;
    };
    
    let passiveEvents = ['touchstart', 'touchmove'];
    
    function on(elemt, type, fn) {
        if (Array.isArray(type)) {
            return _handleMultipleEvents(on, elemt, type, fn);
        }

        if (!DomData.has(elemt)) {
            DomData.set(elemt, {});
        }

        let data = DomData.get(elemt);

        if (!data.handlers) {
            data.handlers = {};
        }

        if (!data.handlers[type]) {
            data.handlers[type] = [];
        }

        if (!fn.guid) {
            fn.guid = newGUID();
        }

        data.handlers[type].push(fn);

        if (!data.dispatcher) {
            data.disabled = false;

            data.dispatcher = function (event, hash) {
                if (data.disabled) {
                    return;
                }

                event = fixEvent(event);
                let handlers = data.handlers[event.type];

                if (handlers) {
                    let handlersCopy = handlers.slice(0);

                    for (let m = 0, n = handlersCopy.length; m < n; m++) {
                        if (event.isImmediatePropagationStopped()) {
                            break;
                        } else {
                            try {
                                handlersCopy[m].call(elemt, event, hash);
                            } catch (e) {
                                log.error(e);
                            }
                        }
                    }
                }
            };
        }

        if (data.handlers[type].length === 1) {
            if (elemt.addEventListener) {
                let options = false;

                if (supportsPassive() && passiveEvents.indexOf(type) > -1) {
                    options = {
                        passive: true
                    };
                }

                elemt.addEventListener(type, data.dispatcher, options);
            } else if (elemt.attachEvent) {
                elemt.attachEvent(`on${type}`, data.dispatcher);
            }
        }
    }
    
    function off(elemt, type, fn) {
        if (!DomData.has(elemt)) {
            return;
        }

        let data = DomData.get(elemt);

        if (!data.handlers) {
            return;
        }

        if (Array.isArray(type)) {
            return _handleMultipleEvents(off, elemt, type, fn);
        }

        let removeType = function removeType(el, t) {
            data.handlers[t] = [];
            _cleanUpEvents(el, t);
        };

        if (type === undefined) {
            for (let t in data.handlers) {
                if (Object.prototype.hasOwnProperty.call(data.handlers || {}, t)) {
                    removeType(elemt, t);
                }
            }
            return;
        }

        let handlers = data.handlers[type];

        if (!handlers) {
            return;
        }


        if (!fn) {
            removeType(elemt, type);
            return;
        }


        if (fn.guid) {
            for (let n = 0; n < handlers.length; n++) {
                if (handlers[n].guid === fn.guid) {
                    handlers.splice(n--, 1);
                }
            }
        }

        _cleanUpEvents(elemt, type);
    }

    function trigger(elemt, event, hash) {
        let elemData = DomData.has(elemt) ? DomData.get(elemt) : {};
        let parent = elemt.parentNode || elemt.ownerDocument;

        if (typeof event === 'string') {
            event = {
                type: event,
                target: elemt
            };
        } else if (!event.target) {
            event.target = elemt;
        }

        event = fixEvent(event);

        if (elemData.dispatcher) {
            elemData.dispatcher.call(elemt, event, hash);
        }

        if (parent && !event.isPropagationStopped() && event.bubbles === true) {
            trigger.call(null, parent, event, hash);
        } else if (!parent && !event.defaultPrevented && event.target && event.target[event.type]) {
            if (!DomData.has(event.target)) {
                DomData.set(event.target, {});
            }

            let targetData = DomData.get(event.target);

            if (event.target[event.type]) {
                targetData.disabled = true;

                if (typeof event.target[event.type] === 'function') {
                    event.target[event.type]();
                }

                targetData.disabled = false;
            }
        }

        return !event.defaultPrevented;
    }

    function one(elemt, type, fn) {
        if (Array.isArray(type)) {
            return _handleMultipleEvents(one, elemt, type, fn);
        }

        let func = function func() {
            off(elemt, type, func);
            fn.apply(this, arguments);
        };

        func.guid = fn.guid = fn.guid || newGUID();
        on(elemt, type, func);
    }

    function any(elemt, type, fn) {
        let func = function func() {
            off(elemt, type, func);
            fn.apply(this, arguments);
        };

        func.guid = fn.guid = fn.guid || newGUID();
        on(elemt, type, func);
    }
    
    let EventTarget = function EventTarget() { };

    EventTarget.prototype.allowedEvents_ = {};

    EventTarget.prototype.on = function (type, fn) {
        let ael = this.addEventListener;
        this.addEventListener = function () { };
        on(this, type, fn);
        this.addEventListener = ael;
    };
    
    EventTarget.prototype.addEventListener = EventTarget.prototype.on;

    EventTarget.prototype.off = function (type, fn) {
        off(this, type, fn);
    };

    EventTarget.prototype.removeEventListener = EventTarget.prototype.off;
    
    EventTarget.prototype.one = function (type, fn) {
        let ael = this.addEventListener;
        this.addEventListener = function () { };
        one(this, type, fn);
        this.addEventListener = ael;
    };

    EventTarget.prototype.any = function (type, fn) {
        let ael = this.addEventListener;
        this.addEventListener = function () { };
        any(this, type, fn);
        this.addEventListener = ael;
    };

    EventTarget.prototype.trigger = function (event) {
        let type = event.type || event;

        if (typeof event === 'string') {
            event = {
                type: type
            };
        }

        event = fixEvent(event);

        if (this.allowedEvents_[type] && this[`on${type}`]) {
            this[`on${type}`](event);
        }

        trigger(this, event);
    };
    
    EventTarget.prototype.dispatchEvent = EventTarget.prototype.trigger;
    let EVENT_MAP;

    EventTarget.prototype.queueTrigger = function (event) {
        let _this = this;
        if (!EVENT_MAP) {
            EVENT_MAP = new Map();
        }

        let type = event.type || event;
        let map = EVENT_MAP.get(this);

        if (!map) {
            map = new Map();
            EVENT_MAP.set(this, map);
        }

        let oldTimeout = map.get(type);
        map['delete'](type);
        window$1.clearTimeout(oldTimeout);
        let timeout = window$1.setTimeout(function () {
            if (map.size === 0) {
                map = null;
                EVENT_MAP['delete'](_this);
            }

            _this.trigger(event);
        }, 0);
        map.set(type, timeout);
    };

    /**
     * The EQuery stored variable where all functions below is stored on an object,
     * able to allow custom functions into it. For example:
     * the `EQuery.fn.css` function return the `css` function {@link css}.
     *
     * @see [EQuery Spec]{@link https://enemetronics.com.ng/equery/}
     * @see [EQuery func]{@link init @alias q.fn.init}
     * @class EQuery
     */

    let q = function (selector, context) {
        return new q.fn.init(selector, context);
    };

    let arr = [], slice = arr.slice, push = arr.push, toString = {}.toString;

    q.fn = q.prototype = {
        equery: q,
        constructor: q,
        length: 0,
        toArray: function () {
            return slice.call(this);
        },
        get: function (a) {
            return a == null ? slice.call(this) : (a < 0 ? this[a + this.length] : this[a]);
        },
        pushStack: function (a) {
            let ret = q.merge(this.constructor(), a);
            ret.prevObject = this;
            return ret;
        },
        each: function (callback) {
            return q.each(this, callback);
        },
        map: function (callback) {
            return this.pushStack(q.map(this, function (elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        slice: function () {
            return this.pushStack(slice.apply(this, arguments));
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(-1);
        },
        eq: function (i) {
            let len = this.length,
                j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        end: function () {
            return this.prevObject || this.constructor();
        },
        push: push,
        sort: arr.sort,
        splice: arr.splice
    };

    /**
     * 
     * @param {Element|String} parent 
     * @param {String} color 
     * @returns an element of `height: 30px` and `width: 30px` and color styles
     */
    let drawBox = function (parent, color) {
        let box;
        parent = typeof parent == 'string' ? getElemt(parent) : parent;
        if (color) { box = elemt('div', null, 'box', null, `height: 30px;width: 30px;background-color: ${color};float: left`) }
        else { box = elemt('div', null, 'box', null, 'height: 30px;width: 30px;background-color: #000;float: left') }
        if (parent) { append(parent, box) }
        else if (!parent) { append('body', box) }
        else if (!color && !parent) { box = elemt('div', null, 'box', null, 'height: 30px;width: 30px;background-color: #000;float: left'); append('body', box) }
        return box;
    };

    /**
     * 
     * @param {Element|String} parent
     * Appends an element of `height: 30px` and `width: 30px` to add a new line effect ot that of {@link drawBox}
     */
    let newLine = function (parent) {
        parent = typeof parent == 'string' ? getElemt(parent) : parent;
        let bl = elemt('div', null, 'box', null, 'height: 30px;');
        if (parent) { append(parent, bl) }
        else if (!parent) { append('body', bl) }
    };

    /**
     * 
     * @param {Element|String} parent 
     * Removes all boxes appended into an element from {@link drawBox}
     */
    let clearBox = function (parent) {
        parent = typeof parent == 'string' ? getElemt(parent) : parent;
        for (let i = 0; i < parent.length; i++) { remove(parent[i].querySelector('div.box')) }
    };

    /**
     * 
     * @param {Element|String} elemt 
     * @param {Boolean} x 
     * @param {Boolean} y 
     * @param {Boolean} resize
     * 
     * Gives an element a dragging effect. For instance if the element has a 
     * child with id name: `element.id + '-header'`, the child will have the dragging
     * effect that will move the entire element else the entire element will be
     * moved on its own.
     * 
     * The element can also be resized by the {@link resize} function
     */
    let dragElement = function (elemt, x, y, resize) {
        elemt = typeof elemt == 'string' ? getElemt(elemt) : elemt;
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (elemt.querySelector(`#${elemt.id}-header`)) {
            on(elemt.querySelector(`#${elemt.id}-header`), 'mousedown', dragMouseDown);
        } else {
            on(elemt, 'mousedown', dragMouseDown);
        }

        if (resize) resize(elemt, x, y);

        function dragMouseDown(event) {
            event = event || window.event;
            event.preventDefault();
            pos3 = event.clientX;
            pos4 = event.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(event) {
            event = event || window.event;
            event.preventDefault();
            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;

            if (x && !y) {
                css(elemt, `left: ${(elemt.offsetLeft - pos1)}px !important;`);
            } else if (!x && y) {
                css(elemt, `top: ${(elemt.offsetTop - pos2)}px !important;`);
            } else if (x && y || !x && !y) {
                css(elemt, `top: ${(elemt.offsetTop - pos2)}px !important;`);
                css(elemt, `left: ${(elemt.offsetLeft - pos1)}px !important;`);
            }

            if (!hasClass(elemt, 'selected')) addClass(elemt, 'selected');
            removeClass('.selected', 'selected');
            addClass(elemt, 'selected');
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    };

    /**
     * 
     * @param {Element|String} elemt 
     * @param {Boolean} x 
     * @param {Boolean} y 
     *   
     */
    let resize = function (elemt, x, y) {
        elemt = typeof elemt == 'string' ? getElemt(elemt) : elemt;

        let ne = elemt('div', null, 'e-display-topright', null, 'width: 10px;height: 10px;cursor: ne-resize');
        let n = elemt('div', null, 'e-display-top', null, 'width: calc(100% - 20px);height: 10px;margin-left: 31px;cursor: n-resize');
        let nw = elemt('div', null, 'e-display-topleft', null, 'width: 10px;height: 10px;cursor: nw-resize');
        let se = elemt('div', null, 'e-display-bottomright', null, 'width: 10px;height: 10px;cursor: nw-resize');
        let s = elemt('div', null, 'e-display-bottom', null, 'width: calc(100% - 20px);height: 10px;margin-left: 10px;cursor: s-resize');
        let sw = elemt('div', null, 'e-display-bottomleft', null, 'width: 10px;height: 10px;cursor: ne-resize');
        let ep = elemt('div', null, 'e-display-right', null, 'height: calc(100% - 20px);width: 10px;margin-top: 10px;cursor: e-resize');
        let w = elemt('div', null, 'e-display-left', null, 'height: calc(100% - 20px);width: 10px;margin-top: 10px;cursor: w-resize');

        let cont = elemt('div', [nw, n, ne, sw, s, se, ep, w], 'e-resize-container e-overlay');
        append(elemt, cont);

        if (x) {

        } else if (y) {

        } else if (!x && !y || x && y) {

        }
    };

    /**
     * 
     * @param {Element|String} elemt 
     * @param {string} style 
     * @returns 
     */
    let getStyleValue = function (elemt, style) {
        elemt = typeof elemt == 'string' ? getElemt(elemt) : elemt;
        if (window.getComputedStyle) {
            return window.getComputedStyle(elemt, null).getPropertyValue(style);
        } else {
            return elemt.currentStyle[style];
        }
    };

    let toCssPx = function (pixels) {
        if (!window.isFinite(pixels)) {
            log.error(`Pixel value is not a number: ${pixels}`);
        }
        return `${Math.round(pixels)}px`;
    };

    let magnify = function (img, zoom) {
        remove('.e-img-magnifier-glass');
        img = typeof img == 'string' ? getElemt(img) : img;
        let glass = elemt('div', null, 'e-img-magnifier-glass dragable');
        img.parentNode.insertBefore(glass, img);
        css(glass, `background-image: url('${img.src}')`);
        css(glass, 'background-repeat: no-repeat');
        css(glass, `background-size: ${toCssPx(img.width * zoom)} ${toCssPx(img.height * zoom)}`);
        let bw = 3, w = glass.offsetWidth / 2, h = glass.offsetHeight / 2;

        on(glass, 'mousemove', moveMagnifier);
        on(img, 'mousemove', moveMagnifier);

        on(glass, 'touchmove', moveMagnifier);
        on(img, 'touchmove', moveMagnifier);

        function moveMagnifier(event) {
            event.preventDefault();
            let pos = getCursorPos(event);
            let x = pos.x;
            let y = pos.y;

            if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
            if (x < w / zoom) { x = w / zoom; }
            if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
            if (y < h / zoom) { y = h / zoom; }

            css(glass, `left: ${toCssPx(x - w)}`);
            css(glass, `top: ${toCssPx(y - h)}`);

            css(glass, `background-position: -${((x * zoom) - w + bw)}px -${toCSSPx((y * zoom) - h + bw)}`);
        }

        function getCursorPos(event) {
            let x = 0, y = 0;
            event = event || window.event;
            let a = img.getBoundingClientRect();

            x = event.pageX - a.left;
            y = event.pageY - a.top;

            x = x - window.pageXOffset;
            y = y - window.pageYOffset;
            return { x: x, y: y };
        }
    };

    let spinner = function (parent) {
        if (!(this instanceof spinner)) return new spinner(parent);
        parent = typeof parent == 'string' ? parent = getElemt(parent) : parent = parent;

        this.rightCircle = elemt('div', null, 'e-spinner-circle');
        this.leftCircle = elemt('div', null, 'e-spinner-circle');
        this.spinnerRight = elemt('div', [this.rightCircle], 'e-spinner-right');
        this.spinnerLeft = elemt('div', [this.leftCircle], 'e-spinner-left');
        this.rotator = elemt('div', [this.spinnerLeft, this.spinnerRight], 'e-spinner-rotator');
        this.container = elemt('div', [this.rotator], 'e-spinner-container')
        this.spinner = elemt('div', [this.container], 'e-spinner e-center');

        append(parent, this.spinner);
    };

    let pickRandom = function (items) {
        let min = 0;
        let max = items.length;
        return items[Math.floor(Math.random() * (max - min)) + min];
    };

    let newComment = function (txt, type) {
        let c = this;
        if (!type) { type = 'error' }
        if (txt) {
            c.closeBtn = elemt('strong', 'x', 'alert-closeBtn');
            c.alertSpan = elemt('span', txt);
            c.comment = elemt('div', [c.alertSpan, c.closeBtn], `e-alert e-display-bottom e-shadow e-display-fixed e-alert-${type}`);
            append(document.body, c.comment);
        }
        c.closeBtn.onclick = function () {
            let div = this.parentElement;
            div.style.opacity = '0';
            setTimeout(function () { remove(div); }, 600);
        }
    };

    let throwIfWhitespace = function (str) {
        if (str.indexOf(' ') >= 0) {
            log.err('class has illegal whitespace characters');
        }
    };

    let elemt = function (tag, content, className, attributes, style, self = q) {
        let elt = document.createElement(tag);

        if (self) elt = self(elt);
        
        if (className) elt.addClass(className);

        if (style) elt.css(style);

        if (content) elt.append(content);
        if (attributes) elt.attr(attributes);
        return elt;
    };

    let remove = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        elt.remove();
    };

    let hide = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        css(elt, 'display: none');
    };

    let show = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        css(elt, 'display: block');
    };

    let toggleShow = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (elt.style.display == 'none') {
            show(elt);
        } else {
            hide(elt);
        }
    };

    let classRegExp = function (className) {
        return new RegExp(`(^|\\s)${className}($|\\s)`);
    }

    let hasClass = function (elt, classToCheck) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        throwIfWhitespace(classToCheck);

        if (elt.classList) {
            return elt.classList.contains(classToCheck);
        }

        return classRegExp(classToCheck).test(elt.className);
    };

    let addClass = function (elt, classN) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (classN.indexOf(' ') !== -1) {
            let classList = classN.split(' ');
            classList.forEach(_class => addClass(elt, _class));
        } else if (elt.classList) {
            elt.classList.add(classN);
        } else if (!hasClass(elt, classN)) {
            elt.className = (`${elt.className} ${classN}`).trim();
        }
        return elt;
    };

    let removeClass = function (elt, classN) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (elt.classList) {
            elt.classList.remove(classN);
        } else {
            throwIfWhitespace(classN);
            elt.className = elt.className.split(/\s+/).filter(function (c) {
                return c !== classN;
            }).join(' ');
        }

        return elt;
    };

    let toggleClass = function (elt, classToToggle, predicate) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        let has = hasClass(elt, classToToggle);

        if (typeof predicate === 'function') {
            predicate = predicate(elt, classToToggle);
        }

        if (typeof predicate !== 'boolean') {
            predicate = !has;
        }


        if (predicate === has) {
            return;
        }

        if (predicate) {
            addClass(elt, classToToggle);
        } else {
            removeClass(elt, classToToggle);
        }

        return elt;
    };

    let attr = function (elt, attr, value) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (typeof attr == 'object') {
            setAttributes(elt, attr);
        } else if (typeof attr == 'string' && value) {
            let obj = {};
            obj[attr] = value;
            setAttributes(elt, obj);
        } else {
            return getAttributes(elt)[attr];
        }
    }

    let setAttributes = function (elt, attributes) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        Object.getOwnPropertyNames(attributes).forEach(function (attrName) {
            let attrValue = attributes[attrName];

            if (attrValue === null || typeof attrValue === 'undefined' || attrValue === false) {
                elt.removeAttribute(attrName);
            } else {
                elt.setAttribute(attrName, attrValue === true ? '' : attrValue);
            }
        });
    };

    let getAttributes = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        let obj = {};
        if (elt && elt.attributes && elt.attributes.length > 0) {
            let attrs = elt.attributes;

            for (let i = attrs.length - 1; i >= 0; i--) {
                let attrName = attrs[i].name;
                let attrVal = attrs[i].value;

                if (typeof elt[attrName] === 'boolean') {
                    attrVal = attrVal !== null ? true : false;
                }

                obj[attrName] = attrVal;
            }
        }

        return obj;
    };

    let getElemt = function (elt) {
        if (typeof elt == 'string') { return q.find(elt)[0] }
        else { return elt }
    };

    let getElements = function (elt) {
        if (typeof elt == 'object') { return [elt] }
        else {
            return q.find(elt)
        }
    };

    let removeAttr = function (elt, attribute) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        elt.removeAttribute(attribute);
    };

    let css = function (elt, style, val) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (style) { elt.style.cssText += style; }
        else if (style && val) { elt.style.setProperty(style, val) }
        else { return elt.style.cssText }
    };

    let removeChild = function (parent, child) {
        if (typeof parent == 'string') {
            for (let i = 0; i < getElements(parent).length; i++) {
                let elt = getElements(parent)[i];
                for (let i = 0; i < child.length; i++) { elt.removeChild(child[i]); }
            }
        } else {
            for (let i = 0; i < child.length; i++) {
                if (parent.elt) parent.elt.removeChild(child[i]);
                else parent.removeChild(child[i]);
            }
        }
    };

    let removeChildren = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        for (let count = elt.childNodes.length; count > 0; --count) { elt.removeChild(elt.firstChild); }
        return elt;
    };

    let getBoundingClientRect = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (elt && elt.getBoundingClientRect && elt.parentNode) {
            let rect = elt.getBoundingClientRect();
            let result = {};
            ['bottom', 'height', 'left', 'right', 'top', 'width'].forEach(function (k) {
                if (rect[k] !== undefined) {
                    result[k] = rect[k];
                }
            });

            if (!result.height) {
                result.height = parseFloat(computedStyle(elt, 'height'));
            }

            if (!result.width) {
                result.width = parseFloat(computedStyle(elt, 'width'));
            }

            return result;
        }
    };

    let findPosition = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (!elt || elt && !elt.offsetParent) {
            return {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };
        }

        let width = elt.offsetWidth;
        let height = elt.offsetHeight;
        let left = 0;
        let top = 0;

        do {
            left += elt.offsetLeft;
            top += elt.offsetTop;
            elt = elt.offsetParent;
        } while (elt);

        return {
            left: left,
            top: top,
            width: width,
            height: height
        };
    };

    let getPointerPosition = function (elt, event) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        let position = {};
        let boxTarget = findPosition(event.target);
        let box = findPosition(elt);
        let boxW = box.width;
        let boxH = box.height;
        let offsetY = event.offsetY - (box.top - boxTarget.top);
        let offsetX = event.offsetX - (box.left - boxTarget.left);

        if (event.changedTouches) {
            offsetX = event.changedTouches[0].pageX - box.left;
            offsetY = event.changedTouches[0].pageY + box.top;
        }

        position.y = 1 - Math.max(0, Math.min(1, offsetY / boxH));
        position.x = Math.max(0, Math.min(1, offsetX / boxW));
        return position;
    };

    let isTextNode = function (value) {
        return isObject(value) && value.nodeType === 3;
    };

    let clearElemt = function (elt) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        while (elt.firstChild) {
            elt.removeChild(elt.firstChild);
        }

        return elt;
    };

    let normalizeContent = function (content) {
        if (typeof content === 'function') {
            content = content();
        }


        return (Array.isArray(content) ? content : [content]).map(function (value) {
            if (typeof value === 'function') {
                value = value();
            }

            if (isEl(value) || isTextNode(value)) {
                return value;
            }

            if (typeof value === 'string' && /\S/.test(value)) {
                return document.createTextNode(value);
            }
        }).filter(function (value) {
            return value;
        });
    };

    let appendContent = function (elt, content) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        normalizeContent(content).forEach(function (node) {
            return elt.appendChild(node);
        });
        return elt;
    };

    let insertContent = function (elt, content) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        return appendContent(emptyEl(elt), content);
    };

    let isSingleLeftClick = function (event) {
        if (event.button === undefined && event.buttons === undefined) {
            return true;
        }

        if (event.button === 0 && event.buttons === undefined) {
            return true;
        }


        if (event.type === 'mouseup' && event.button === 0 && event.buttons === 0) {
            return true;
        }

        if (event.button !== 0 || event.buttons !== 1) {
            return false;
        }

        return true;
    };

    let copyObj = function (obj, target, overwrite) {
        if (!target) { target = {}; }
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)) && Number(prop) !== 0) { target[prop] = obj[prop]; }
        }
        return target;
    };

    let createObj = function (base, props) {
        let inst;
        if (Object.create) {
            inst = Object.create(base);
        } else {
            nothing.prototype = base;
            inst = new nothing();
        }
        if (props) { copyObj(props, inst); }
        return inst
    };

    let select = function (place, data) {
        if (!(this instanceof select)) return new select(place, data);
        place = typeof place == 'string' ? getElemt(place) : place;
        data = data ? copyObj(data) : {}

        if (data.select) {
            this.select = elemt('select');
            for (let i = 0; i < data.select.length; i++) {
                this.option = elemt('option', data.select[i], null, { 'value': i });
                append(this.select, this.option);
            }
        }
        else { this.select = null }
        this.panel = elemt('div', [this.select], 'e-select', null, 'margin-bottom: 10px;padding: 5px')
        append(place, this.pane);
        editSelect(this.panel);
        return this;
    };

    let editSelect = function (place) {
        let elt = place.querySelector('select');
        let a = elemt('div', elt.options[0].innerText, 'e-selected');
        let b = elemt('div', null, 'e-select-item e-select-hidden');
        for (let i = 0; i < elt.options.length; i++) {
            let c = elemt('div', elt.options[i].innerHTML);
            append(b, c);
        }
        addClass(b.firstChild, 'e-same-as-selected');
        append(place, [a, b]);
        on(a, 'click', function (event) {
            event.stopPropagation();
            closeAllSelect(this);
            toggleClass(this.nextSibling, 'e-select-hidden');
            toggleClass(this, 'e-select-arrow-active');
            let d = place.querySelectorAll('.e-select-item div');
            for (let i = 0; i < d.length; i++) {
                d[i].addEventListener('click', function () {
                    this.parentElement.parentElement.children[1].innerHTML = this.innerHTML;
                    for (let i = 0; i < place.querySelectorAll('.e-select-item div').length; i++) {
                        removeClass(place.querySelectorAll('.e-select-item div')[i], 'e-same-as-selected');
                    }
                    addClass(this, 'e-same-as-selected');
                });
            }
        });
        on(document, 'click', closeAllSelect);
    };

    let closeAllSelect = function (elt) {
        let arrNo = [];
        let x = getElements('.e-select-item');
        let y = getElements('.e-selected');
        for (let i = 0; i < y.length; i++) {
            if (elt == y[i]) {
                arrNo.push(i)
            } else {
                removeClass(y[i], 'e-select-arrow-active');
            }
        }
        for (let i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                addClass(x[i], 'e-select-hidden');
            }
        }
    };

    let input = function (place, data) {
        place = typeof place == 'string' ? getElemt(place) : place;
        if (!(this instanceof input)) return new input(place, data);
        if (data.input) {
            this.inputWrapper = elemt('div', null, null, 'max-width: 220px;padding: 5px;');
            for (let i in data.input) {
                let type, placeholder, value;
                let input = data.input[i] ? copyObj(data.input[i]) : {}
                if (input.type) { type = input.type }
                else { type = 'text' }
                if (input.placeholder) { placeholder = input.placeholder }
                else { placeholder = '' }
                if (input.value) { value = input.value }
                else { value = '' }
                this.input = elemt('input', null, 'e-input-root e-input-base-input')
                this.input.type = type;
                this.input.placeholder = placeholder;
                this.input.value = value;
                this.inputContainer = elemt('div', [this.input], 'e-input-base-root', 'position: relative;border-radius: 4px; border: 1px solid #999;background-color: #222');
                append(this.inputWrapper, this.inputContainer)
            }
        } else {
            this.inputWrapper = null;
        }
        append(place, this.inputWrapper);
        return this.inputWrapper
    };

    let table = function (parent, data) {
        place = typeof place == 'string' ? getElemt(place) : place;
        if (!(this instanceof table)) return new table(parent, data);
        let col = 0, row = 0;
        parent = typeof parent == 'string' ? getElemt(parent) : parent || document.body;
        data = data ? copyObj(data) : {};

        this.row = elemt('tr');
        this.tbody = elemt('tbody', [this.row]);
        this.table = elemt('table', [this.tbody], 'e-table-all');
        append(parent, this.table);

        if (data.col) col = data.col;
        if (data.heading) {
            col = data.heading.length;
            for (let i = 0; i < col; i++) {
                this.heading = elemt('th', data.heading[i]);
                append(this.row, this.heading);
            }
        }

        if (data.content) {
            row = data.content.length / col;
            for (let i = 0; i < row; i++) {
                this.row2 = elemt('tr');
                let cells = data.content[row]
                console.log(cells)
                append(this.tbody, this.row2);
            }
        }
    };

    let setCookie = function (cname, cvalue, exDays, path) {
        let d = new Date();
        d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
        let expires = `expires=${d.toUTCString()}`;
        document.cookie = `${cname}=${cvalue};${expires};path=${path ? path : '/'}`;
    };

    let getCookie = function (cname) {
        let name = `${cname}=`;
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    };

    let includeHTML = function (callback) {
        let elemt, file, xHttp;
        for (let i = 0; i < getElements('*').length; i++) {
            elemt = getElements('*')[i];
            file = elemt.getAttribute('include-html');
            if (file) {
                xHttp = new XMLHttpRequest();
                xHttp.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        elemt.innerHTML = this.responseText;
                        if (this.status == 200) { elemt.innerHTML = this.responseText; }
                        if (this.status == 403) { elemt.innerHTML = 'Access Denied.'; }
                        if (this.status == 404) { elemt.innerHTML = 'Page not found.'; }
                        elemt.removeAttribute('include-html');
                        if (callback) callback();
                    }
                }
                xHttp.open('GET', file, true);
                xHttp.send();
                return;
            }
        }
    };

    let getHttp = function (url, callback, onload, onerror) {
        onload = onload || function () {};

        if (url) {
            let xHttp = new window$1.XMLHttpRequest(), response;
            on(xHttp, 'readystatechange', function () {
                if (this.readyState == 4) {
                    response = this.responseText;
                    if (callback) callback(response);
                    return response;
                }
            });
            on(xHttp, 'progress', onload);
            on(xHttp, 'error', onerror);
            xHttp.open('GET', url, true);
            xHttp.send();
        } else {
            log.warn('getHttp need a url to perform it XMLHttpRequest');
        }
    };

    let ajax = function () {
        let obj = {}, xHttp = new window$1.XMLHttpRequest(), response, load = function () {}, error = function () {};
        if (arguments.length == 2) {
            obj = arguments[1];
            obj.url = arguments[0];
        } else {
            obj = arguments[0]
        }
        load = obj.load || load;
        error = obj.error || error;


        on(xHttp, 'readystate', function () {
            regResponse(this);
            if (4 === this.readyState) obj.success(response);
            console.log(this, response)
            return response;
        });
        on(xHttp, 'progress', load);
        on(xHttp, 'error', error);

        function regResponse(x) {
            response = {
                abort: function () {},
                always: function () {},
                catch: function () {},
                done: function () {},
                fail: function () {},
                pipe: function () {},
                progress: function () {},
                promise: function () {},
                readyState: x.readyState,
                responseText: x.responseText,
                state: x.state,
                statusCode: function () {},
                then: function () {}
            };
        }

        try {
            setTimeout(function () {
                xHttp.open(obj.type, obj.url, obj.async, obj.username, obj.password);
                xHttp.send();
            });
        } catch (e) {
            log.error(e);
        }
    }

    let slideShow = function (elt, ms, func) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        let ss, x = elt;
        ss = {};
        ss.current = 1;
        ss.x = x;
        ss.onDisplayChange = func;
        if (!isNaN(ms) || ms == 0) {
            ss.milliseconds = ms;
        } else {
            ss.milliseconds = 1000;
        }
        ss.start = function () {
            ss.display(ss.current)
            if (ss.onDisplayChange) { ss.onDisplayChange(); }
            if (ss.milliseconds > 0) {
                window.clearTimeout(ss.timeout);
                ss.timeout = window.setTimeout(ss.next, ss.milliseconds);
            }
        };
        ss.next = function () {
            ss.current += 1;
            if (ss.current > ss.x.length) { ss.current = 1; }
            ss.start();
        };
        ss.previous = function () {
            ss.current -= 1;
            if (ss.current < 1) { ss.current = ss.x.length; }
            ss.start();
        };
        ss.display = function (n) {
            for (let i = 0; i < ss.x.length; i++) { css(ss.x[i], 'display: none'); }
            css(ss.x[n - 1], 'display: block');
        }
        ss.start();
        return ss;
    };

    let slideImage = function (elt, ms, func) {
        let ss, x = elt;
        ss = {};
        ss.current = 1;
        ss.x = x;
        ss.ondisplaychange = func;
        if (!isNaN(ms) || ms == 0) {
            ss.milliseconds = ms;
        } else {
            ss.milliseconds = 1000;
        }
        ss.start = function () {
            ss.display(ss.current)
            if (ss.ondisplaychange) { ss.ondisplaychange(); }
            if (ss.milliseconds > 0) {
                window.clearTimeout(ss.timeout);
                ss.timeout = window.setTimeout(ss.next, ss.milliseconds);
            }
        };
        ss.next = function () {
            ss.current += 1;
            if (ss.current > ss.x.length) { ss.current = 1; }
            ss.start();
        };
        ss.previous = function () {
            ss.current -= 1;
            if (ss.current < 1) { ss.current = ss.x.length; }
            ss.start();
        };
        ss.display = function (n) {
            for (let i = 0; i < ss.x.length; i++) { css(ss.x[i], 'display: none'); }
            styleElemt(ss.x[n - 1], 'display: block');
        }
        ss.start();
        return ss;
    };

    let filterHTML = function (elemt, sel, val) {
        elemt = typeof elemt == 'string' ? getElemt(elemt) : elemt;
        let hit;
        elemt = typeof elemt == 'string' ? getElements(elemt) : elemt;
        for (let i = 0; i < elemt.length; i++) {
            sel = typeof sel == 'string' ? getElements(sel) : sel;
            for (let a = 0; a < sel.length; a++) {
                hit = 0;
                if (sel[a].innerText.toLowerCase().indexOf(val.toLowerCase) > -1) {
                    hit = 1;
                }
                let elt = getElemt(`${sel} *`);
                for (let b = 0; b < elt.length; b++) {
                    if (elt[b].innerText.toLowerCase().indexOf(val.toLowerCase) > -1) {
                        hit = 1;
                    }
                }
                if (hit == 1) {
                    hide(sel[a]);
                } else {
                    show(sel[a]);
                }
            }
        }
    };

    let sortHTML = function (elemt, sel, val) {
        elemt = typeof elemt == 'string' ? getElemt(elemt) : elemt;
        let cc, y, by, val1, val2;
        elemt = typeof elemt == 'string' ? getElements(elemt) : elemt;
        for (let i = 0; i < elemt.length; i++) {
            for (let a = 0; a < 2; a++) {
                cc = 0;
                y = 1;
                while (y == 1) {
                    y = 0;
                    sel = typeof sel == 'string' ? elemt[i].querySelectorAll(sel) : sel;
                    for (let b = 0; b < sel.length; i++) {
                        by = 0;
                        if (val) {
                            val1 = sel[b].querySelector(val).innerText.toLowerCase();
                            val2 = sel[b + 1].querySelector(val).innerText.toLowerCase();
                        } else {
                            val1 = sel[b].innerText.toLowerCase();
                            val2 = sel[b + 1].innerText.toLowerCase();
                        }
                        if ((j == 0 && (v1 > v2)) || (j == 1 && (v1 < v2))) {
                            by = 1;
                            break;
                        }
                    }
                    if (by == 1) {
                        sel[b].parentNode.insertBefore(sel[b + 1], sel[b]);
                        y = 1;
                        cc++;
                    }
                }
                if (cc > 0) break;
            }
        }
    };

    let val = function (elt, val) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (!val) return elt.value;
        else elt.value = val;
    };

    let text = function (elt, _text) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (!_text) return elt.innerText;
        else elt.innerText = _text;
    };

    let html = function (elt, html) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (!html) return elt.innerHTML;
        else elt.innerHTML = html;
    };

    let append = function (elt, content) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (window.chowE) console.log(elt, content);
        if (typeof content == 'string') elt.appendChild(document.createTextNode(content));
        else if (content) {
            if (content.nodeType) elt.appendChild(content);
            else for (let i = 0; i < content.length; i++) append(elt, content[i]);
        }
    };

    let prepend = function (elt, content) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (typeof content == 'string') elt.insertBefore(document.createTextNode(content), elt.childNodes[0]);
        else if (content) {
            if (content.nodeType) elt.insertBefore(content, elt.childNodes[0]);
            else for (let i = 0; i < content.length; i++) prepend(elt, content[i]);
        }
    };

    let before = function (elt, content) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (typeof content == 'string') elt.parentNode.insertBefore(document.createTextNode(content), elt);
        else if (content) {
            if (content.nodeType) elt.parentNode.insertBefore(content, elt);
            else for (let i = 0; i < content.length; i++) before(elt, content[i]);
        }
    };

    let after = function (elt, content) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (typeof content == 'string') {
            if (elt.nextSibling) elt.parentNode.insertBefore(document.createTextNode(content), elt.nextSibling);
            else elt.parentNode.appendChild(document.createTextNode(content));
        } else if (content) {
            if (content.nodeType) {
                if (elt.nextSibling) elt.parentNode.insertBefore(content, elt.nextSibling);
                else elt.parentNode.appendChild(content);
            } else {
                for (let i = 0; i < content.length; i++) after(elt, content[i]);
            }
        }
    };

    let height = function (elt, val) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (typeof val == 'string') css(elt, `height: ${val}`);
        else if (val) css(elt, `height: ${toCssPx(val)}`);
        else return Number(getStyleValue(elt, 'height').replaceAll('px', ''));
    };

    let width = function (elt, val) {
        elt = typeof elt == 'string' ? getElemt(elt) : elt;
        if (typeof val == 'string') css(elt, `width: ${val}`);
        else if (val) css(elt, `width: ${toCssPx(val)}`);
        else return getStyleValue(elt, 'width');
    };

    class SVG {
        constructor() {
            if (!(this instanceof SVG)) { return new SVG(); }
            let _this = this, _svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), _svgHeight, _svgWidth, _minX, _minY, _width, _height;
            _this.domElement = _svg;

            _this.setSize = function (width, height) {
                _svgWidth = width; _svgHeight = height;

                attr(_svg, 'height', _svgHeight);
                attr(_svg, 'width', _svgWidth);
            };

            _this.setViewBox = function (minX, minY, width, height) {
                _minX = minX;
                _minY = minY;
                _width = width;
                _height = height;

                attr(_svg, 'viewBox', `${_minX} ${_minY} ${_width} ${_height}`);
            };

            _this.getSize = function () {
                return {
                    width: _svgWidth,
                    height: _svgHeight
                };
            };

            _this.clear = function () {
                while (_svg.childNodes.length > 0) {
                    _svg.removeChild(_svg.childNodes[0]);
                }
            };

            _this.zoom = function (val1, val2) {
                _width += val1;
                _height += val2;
                attr(_svg, 'viewBox', `${_minX} ${_minY} ${_width} ${_height}`);
            };

            _this.path = function (path, fill = '#000', attr) {
                let _path = _this.svgElement('path');
                _path.attr({ 'd': path, fill: fill });
                _path.attr(attr);
                _this.append(_path);
            };

            _this.rect = function (x, y, w, h, fill = '#000', attr) {
                let _rect = _this.svgElement('rect');
                _rect.attr({ x: x, y: y, width: w, height: h, fill: fill });
                _rect.attr(attr);
                _this.append(_rect);
            };

            _this.circle = function (cx, cy, r, fill = '#000', attr) {
                let _circle = _this.svgElement('circle');
                _circle.attr({ cx: cx, cy: cy, r: r, fill: fill });
                _circle.attr(attr);
                _this.append(_circle);
            };

            _this.append = function (child) {
                append(_svg, child);
            };

            _this.hide = function () {
                hide(_svg);
            };

            _this.show = function () {
                show(_svg);
            };

            _this.toggleShow = function () {
                toggleShow(_svg);
            };

            _this.attr = function (attribute, value) {
                attr(_svg, attribute, value);
            };

            _this.addClass = function (className) {
                addClass(_svg, className);
            };

            _this.removeAttr = function (attribute) {
                removeAttr(_svg, attribute);
            };

            _this.css = function (style) {
                css(_svg, style);
            };

            _this.svgElement = function (tag) {
                let _svgElt = document.createElementNS('http://www.w3.org/2000/svg', tag);
                _svgElt.hide = function () {
                    hide(_svgElt);
                };

                _svgElt.show = function () {
                    show(_svgElt);
                };

                _svgElt.toggleShow = function () {
                    toggleShow(_svgElt);
                };

                _svgElt.attr = function (attribute, value) {
                    attr(_svgElt, attribute, value);
                };

                _svgElt.addClass = function (className) {
                    addClass(_svgElt, className);
                };

                _svgElt.removeAttr = function (attribute) {
                    removeAttr(_svgElt, attribute);
                };

                _svgElt.css = function (style) {
                    css(_svgElt, style);
                };
                _svgElt.append = function (child) {
                    append(_svgElt, child);
                };
                return _svgElt;
            };

            return this;
        }
    }

    class Canvas {
        constructor() {
            if (!(this instanceof Canvas)) { return new Canvas(); }
            let _canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas'), _canvasHeight, _canvasWidth, _pixelRatio = 1, _this = this;
            this.ctx = _canvas.getContext('2d');
            this.domElement = _canvas;
            css(_canvas, 'display: block');

            this.setSize = function (width, height, updateStyle) {
                _canvasWidth = Math.floor(width * _pixelRatio);
                _canvasHeight = Math.floor(height * _pixelRatio);

                _canvas.height = _canvasHeight;
                _canvas.width = _canvasWidth;

                if (updateStyle != false) {
                    css(_canvas, `height: ${toCssPx(_canvasHeight)}`);
                    css(_canvas, `width: ${toCssPx(_canvasWidth)}`);
                }
            };

            this.resize = function (updateStyle) {
                on(window, 'resize', function () {
                    _canvas.height = _canvasHeight;
                    _canvas.width = _canvasWidth;

                    if (updateStyle != false) {
                        css(_canvas, `height: ${toCssPx(_canvasHeight)}`);
                        css(_canvas, `width: ${toCssPx(_canvasWidth)}`);
                    }
                });
            };

            this.setPixelRatio = function (val) {
                if (val === undefined) return;
                _pixelRatio = val;
                this.setSize(_canvasWidth, _canvasHeight, false);
            };

            this.getSize = function () {
                return {
                    width: _canvasWidth,
                    height: _canvasHeight
                };
            };

            this.getPixelRation = function () {
                return _pixelRatio;
            };

            this.getContext = function () {
                return this.ctx;
            };

            this.drawImage = function (source, x, y, w, h) {
                this.ctx.drawImage(source, x, y, w, h);
            };

            this.dataUrl = function (type, quality) {
                return _canvas.toDataURL(type, quality);
            };

            this.drawCircle = function (x1, y1, r, color = 'black', stroke = 'black', width = 1) {
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, r, 0, Math.PI * 2);
                this.ctx.strokeStyle = stroke;
                this.ctx.fillStyle = color;
                this.ctx.lineWidth = width;
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.drawLine = function (x1, y1, x2, y2, stroke = 'black', width = 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.strokeStyle = stroke;
                this.ctx.lineWidth = width;
                this.ctx.stroke();
            };

            this.drawBox = function (x, y, width, height, color = 'black', stroke = 'black', strokeWidth = 1) {
                this.ctx.beginPath();
                this.ctx.rect(x, y, width, height);
                if (color) this.ctx.fillStyle = color; this.ctx.fillRect(x, y, width, height);
                if (stroke) this.ctx.lineColor = strokeWidth; this.ctx.strokeStyle = stroke; this.ctx.strokeRect((x - width / 2), (y - height / 2), width, height);
            };

            this.fillBox = function (x, y, width, height, color = 'black') {
                this.ctx.beginPath();
                this.ctx.rect(x, y, width, height);
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, width, height);
            };

            this.path = function () {
                this.ctx.beginPath();

            };

            this.clear = function () {
                this.ctx.clearRect(0, 0, _canvasWidth, _canvasHeight);
            };

            this.kill = function () {
                remove(_canvas);
            };
            _this.hide = function () {
                hide(_canvas);
            };

            this.show = function () {
                show(_canvas);
            };

            this.toggleShow = function () {
                toggleShow(_canvas);
            };

            this.attr = function (attribute, value) {
                attr(_canvas, attribute, value);
            };

            this.addClass = function (className) {
                addClass(_canvas, className);
            };

            this.removeAttr = function (attribute) {
                removeAttr(_canvas, attribute);
            };

            this.css = function (style) {
                css(_canvas, style);
            };

            return this;
        }
    }
    
    class Polynomial {
        constructor() {
            this.degree = 0;

        }
    }

    let Storage = function Storage(name) {
        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        if (indexedDB === undefined) {
            console.warn('Storage: IndexedDB not available.');
            return {
                init: function() {},
                get: function() {},
                set: function() {},
                clear: function() {}
            };
        }
        let version = 1;
        let database;
        return {
            init: function(callback) {
                let request = indexedDB.open(name, version);
                request.onupgradeneeded = function(event) {
                    let db = event.target.result;
                    if (db.objectStoreNames.contains('states') === false) {
                        db.createObjectStore('states');
                    }
                };
                request.onsuccess = function(event) {
                    database = event.target.result;
                    callback();
                };
                request.onerror = function(event) {
                    console.error('IndexedDB', event);
                };
            },

            get: function(callback) {
                let transaction = database.transaction(['states'], 'readwrite');
                let objectStore = transaction.objectStore('states');
                let request = objectStore.get(0);
                request.onsuccess = function(event) {
                    callback(event.target.result);
                };
            },

            set: function(data) {
                let start = performance.now();
                let transaction = database.transaction(['states'], 'readwrite');
                let objectStore = transaction.objectStore('states');
                let request = objectStore.put(data, 0);
                request.onsuccess = function() {
                    log(`Saved state to IndexedDB. ${(performance.now() - start).toFixed(2)}ms`);
                };
            },

            clear: function() {
                if (database === undefined)
                    return;
                let transaction = database.transaction(['states'], 'readwrite');
                let objectStore = transaction.objectStore('states');
                let request = objectStore.clear();
                request.onsuccess = function() {
                    log('Cleared IndexedDB.');
                }
            }
        };
    };

    let isArrayLike = function (obj) {
        let b = !!obj && 'length' in obj && obj.length,
            c = q.type(obj);
        return c !== 'function' && !(obj != null && obj === obj.window) && (c === 'array' || b === 0 || (typeof b === 'number' && b > 0 && (b - 1) in obj));
    };

    q.add = q.fn.add = function () {
        let options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== 'object' && !q.isFunction(target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    if (deep && copy && (q.isPlainObject(copy) || (copyIsArray = q.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && q.isArray(src) ? src : [];
                        } else {
                            clone = src && q.isPlainObject(src) ? src : {};
                        }

                        target[name] = q.add(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    q.add({
        isFunction: function (obj) {
            return typeof obj === 'function';
        },
        isArray: Array.isArray,
        isPlainObject: function (obj) {
            return toString.call(obj) === '[object Object]';
        },
        each: function (obj, callback) {
            let length, i = 0;

            if (isArrayLike(obj)) {
                length = obj.length;
                for (; i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },
        map: function (elemt, callback) {
            let value, ret = [];

            if (isArrayLike(elemt)) {
                for (let i = 0; i < elemt.length; i++) {
                    value = callback(elemt[i], i);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {
                for (i in elemt) {
                    value = callback(elemt[i], i);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            }

            return ret;
        },
        type: function (obj) {
            if (obj == null) {
                return `${obj}`;
            }
            return typeof obj === 'object' || typeof obj === 'function' ?
                toString.call(obj) || 'object' :
                typeof obj;
        },
        merge: function (first, second) {
            let i = first.length;

            for (let j = 0;j < +second.length;j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;
        }
    });

    q.fn.add({
        find: function (selector) {
            let i, c, _this = this;
            if (typeof selector != 'string') {
                return this.pushStack(q(selector).filter(function () {
                    for (i = 0; i < _this.length; i++) {
                        if (q.contains(_this[i], this)) return !0
                    }
                }));
            }
            for (c = this.pushStack([]), i = 0; i < _this.length; i++) Selector(selector, _this[i], c);
            return _this.length > 1 ? q.uniqueSort(c) : c
        }
    });

    let init = q.fn.init = function (selector, context) {
        context = context || document.documentElement;
        if (!selector) {
            return this;
        }

        if (typeof selector === 'string') {
            let match = q(context).find(selector);
            Array.prototype.push.apply(this, match);
            return this;
        }

        if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
        }

        if (q.isFunction(selector)) {
            return document.readyState !== 'loading' ? selector(q) : on(document, 'DOMContentLoaded', selector.bind(q));
        }

        return q.makeArray(selector, this);
    };

    init.prototype = q.fn;

    q.fn.ready = function (fn) {
        on(document, 'DOMContentLoaded', fn);
        return this;
    };

    q.makeArray = function (arr, results) {
        let ret = results || [];

        if (arr != null) {if (window.chowE) console.log(isArrayLike(Object(arr)))
            if (isArrayLike(Object(arr))) {
                q.merge(ret, typeof arr === 'string' ? [arr] : arr);
            } else {
                push.call(ret, arr);
            }
        }

        return ret;
    };

    q.Callbacks = function (options) {
        options = typeof options === 'string' ? (function (opt) { let arr = {};return q.each(opt.match(/[^\x20\t\r\n\f]+/g) || [], function () { arr[arguments[1]] != 0 }), arr })(options)  : q.add({}, options);

        let list = [], queue = [], firing, memory, fired, locked;
        let fire = function () {
            locked = options.once;
            fired = firing = true;
            for (; queue.length; memory = queue.shift()) {
                while (++firingIndex < list.length) {
                    if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                        firingIndex = list.length;
                        memory = false;
                    }
                }
            }
            if (!options.memory) {
                memory = false;
            }
            firing = false;
            if (locked) {
                list = memory ? [] : '';
            }
        };
        let self = {
            add: function () {
                if (list) {
                    if (memory && !firing) {
                        firingIndex = list.length - 1;
                        queue.push(memory);
                    }

                    (function add(args) {
                        q.each(args, function (_, arg) {
                            if (q.isFunction(arg)) {
                                if (!options.unique || !self.has(arg)) {
                                    list.push(arg);
                                }
                            } else if (arg && arg.length && typeof arg !== 'string') {
                                add(arg);
                            }
                        });
                    })(arguments);

                    if (memory && !firing) {
                        fire();
                    }
                }
                return this;
            },
            remove: function () {
                q.each(arguments, function (_, arg) {
                    let index;
                    while ((index = q.inArray(arg, list, index)) > -1) {
                        list.splice(index, 1);
                        if (index <= firingIndex) {
                            firingIndex--;
                        }
                    }
                });
                return this;
            },
            has: function (fn) {
                return fn ? q.inArray(fn, list) > -1 : list.length > 0;
            },
            empty: function () {
                if (list) {
                    list = [];
                }
                return this;
            },
            disable: function () {
                locked = queue = [];
                list = memory = '';
                return this;
            },
            disabled: function () {
                return !list;
            },
            lock: function () {
                locked = queue = [];
                if (!memory && !firing) {
                    list = memory = '';
                }
                return this;
            },
            locked: function () {
                return !!locked;
            },
            fireWith: function (context, args) {
                if (!locked) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    queue.push(args);
                    if (!firing) {
                        fire();
                    }
                }
                return this;
            },
            fire: function () {
                self.fireWith(this, arguments);
                return this;
            },
            fired: function () {
                return !!fired;
            }
        };

        return self;
    };

    q.fn.add({
        forEach: function (func, args) {
            args = args || [];
            for (let i = 0;i < this.length;i++) {
                if (this[i].nodeType) {
                    for (var _len = args.length, _arg = new Array(_len), _key = 0; _key < _len; _key++) {
                        _arg[_key] = args[_key];
                    }
                    func(...[this[i], ..._arg]);
                }
            }
            return this;
        },
        drawBox: function () { return this.forEach(drawBox, arguments) },
        newLine: function () { return this.forEach(newLine, arguments) },
        clearBox: function () { return this.forEach(clearBox, arguments) },
        dragElement: function () { return this.forEach(dragElement, arguments) },
        resize: function () { return this.forEach(resize, arguments) },
        getStyleValue: function (style) { for (let i = 0; i < this.length; i++) return getStyleValue(this[i], style); },
        magnify: function () { return this.forEach(magnify, arguments) },
        remove: function () { return this.forEach(remove, arguments) },
        hide: function () { return this.forEach(hide, arguments) },
        show: function () { return this.forEach(show, arguments) },
        toggleShow: function () { return this.forEach(toggleShow, arguments) },
        hasClass: function (classToCheck) { for (let i = 0; i < this.length; i++) return hasClass(this[i], classToCheck); },
        addClass: function () { return this.forEach(addClass, arguments) },
        removeClass: function () { return this.forEach(removeClass, arguments) },
        toggleClass: function () { return this.forEach(toggleClass, arguments) },
        attr: function () { return this.forEach(attr, arguments) },
        getAttr: function (attribute) { for (let i = 0; i < this.length; i++) return attr(this[i], attribute) },
        removeAttr: function () { return this.forEach(removeAttr, arguments) },
        css: function () { return this.forEach(css, arguments) },
        rmChild: function () { return this.forEach(removeChild, arguments) },
        removeChildren: function () { return this.forEach(removeChildren, arguments) },
        getBoundingClientRect: function () { for (let i = 0; i < this.length; i++) return getBoundingClientRect(this[i]) },
        findPosition: function () { for (let i = 0; i < this.length; i++) return findPosition(this[i]) },
        getPointerPosition: function (event) { for (let i = 0; i < this.length; i++) return getPointerPosition(this[i], event) },
        clearElemt: function () { return this.forEach(clearElemt, arguments) },
        appendContent: function () { return this.forEach(appendContent, arguments) },
        insertContent: function () { return this.forEach(insertContent, arguments) },
        select: function () { return this.forEach(select, arguments) },
        input: function () { return this.forEach(input, arguments) },
        table: function () { return this.forEach(table, arguments) },
        spinner: function () { return this.forEach(spinner, arguments) }
    });

    q.add({
        pickRandom: function (items) { return pickRandom(items) },
        copyObj: function (obj, target, overwrite) { return copyObj(obj, target, overwrite) },
        createObj: function (base, props) { return createObj(base, props) },
        setCookie: function (cname, cvalue, exDays, path) { setCookie(cname, cvalue, exDays, path) },
        getCookie: function (cname) { getCookie(cname) },
        isSingleLeftClick: function () { return isSingleLeftClick() },
        includeHTML: function (cb) { includeHTML(cb) },
        getHttp: function (url, cb) { return getHttp(url, cb) },
        newComment: function (txt, type) { newComment(txt, type) },
        elemt: function (tag, content, className, attributes, style) { return elemt(tag, content, className, attributes, style, this) },
        createLogger: createLogger,
        ajax: ajax
    });

    q.fn.add({
        slideShow: function () { return this.forEach(slideShow, arguments) },
        slideImage: function () { return this.forEach(slideImage, arguments) },
        filterHTML: function () { return this.forEach(filterHTML, arguments) },
        sortHTML: function () { return this.forEach(sortHTML, arguments) }
    });

    q.fn.add({
        on: function () { return this.forEach(on, arguments) },
        off: function () { return this.forEach(off, arguments) },
        click: function () { return this.forEach(on, ['click', ...arguments]) },
        dblclick: function () { return this.forEach(on, ['dblclick', ...arguments]) },
        hover: function () { return this.forEach(on, ['hover', ...arguments]) },
        blur: function () { return this.forEach(on, ['blur', ...arguments]) },
        change: function () { return this.forEach(on, ['change', ...arguments]) },
        canplay: function () { return this.forEach(on, ['canplay', ...arguments]) },
        copy: function () { return this.forEach(on, ['copy', ...arguments]) },
        cut: function () { return this.forEach(on, ['cut', ...arguments]) },
        drag: function () { return this.forEach(on, ['drag', ...arguments]) },
        dragend: function () { return this.forEach(on, ['dragend', ...arguments]) },
        dragenter: function () { return this.forEach(on, ['dragenter', ...arguments]) },
        dragleave: function () { return this.forEach(on, ['dragleave', ...arguments]) },
        dragover: function () { return this.forEach(on, ['dragover', ...arguments]) },
        dragstart: function () { return this.forEach(on, ['dragstart', ...arguments]) },
        drop: function () { return this.forEach(on, ['drop', ...arguments]) },
        emptied: function () { return this.forEach(on, ['emptied', ...arguments]) },
        error: function () { return this.forEach(on, ['error', ...arguments]) },
        focus: function () { return this.forEach(on, ['focus', ...arguments]) },
        keypress: function () { return this.forEach(on, ['keypress', ...arguments]) },
        keydown: function () { return this.forEach(on, ['keydown', ...arguments]) },
        keyup: function () { return this.forEach(on, ['keyup', ...arguments]) },
        load: function () { return this.forEach(on, ['load', ...arguments]) },
        mousedown: function () { return this.forEach(on, ['mousedown', ...arguments]) },
        mouseenter: function () { return this.forEach(on, ['mouseenter', ...arguments]) },
        mouseleave: function () { return this.forEach(on, ['mouseleave', ...arguments]) },
        mousemove: function () { return this.forEach(on, ['mousemove', ...arguments]) },
        mousewheel: function () { return this.forEach(on, ['mousewheel', ...arguments]) },
        paste: function () { return this.forEach(on, ['paste', ...arguments]) },
        reset: function () { return this.forEach(on, ['reset', ...arguments]) },
        resize: function () { return this.forEach(on, ['resize', ...arguments]) },
        scroll: function () { return this.forEach(on, ['scroll', ...arguments]) },
        search: function () { return this.forEach(on, ['search', ...arguments]) }
    });

    q.fn.add({
        val: function (content) { for (let i = 0; i < this.length; i++) return val(this[i], content) },
        text: function (content) { for (let i = 0; i < this.length; i++) return text(this[i], content) },
        html: function (content) { for (let i = 0; i < this.length; i++) return html(this[i], content) },
        append: function () { return this.forEach(append, arguments) },
        prepend: function () { return this.forEach(prepend, arguments) },
        before: function () { return this.forEach(before, arguments) },
        after: function () { return this.forEach(after, arguments) },
        height: function (value) { for (let i = 0; i < this.length; i++) return height(this[i], value) },
        width: function (value) { for (let i = 0; i < this.length; i++) return width(this[i], value) }
    });

    q.add({
        svg: SVG,
        canvas: Canvas,
        poly: Polynomial,
        Storage: Storage
    });

    q.add({
        Deferred: function (b) {
            let c = [
                ['notify', 'progress', q.Callbacks('memory'), q.Callbacks('memory'), 2],
                ['resolve', 'done', q.Callbacks('once memory'), q.Callbacks('once memory'), 0, 'resolved'],
                ['reject', 'fail', q.Callbacks('once memory'), q.Callbacks('once memory'), 1, 'rejected']
            ],
            d = 'pending',
            e = {
                state: function () { return },
                always: function () { return f.done(arguments).fail(arguments), this },
                catch: function (a) { return e.then(null, a) },
                pipe: function () {
                    let a = arguments;
                    return q.Deferred(function (b) {
                        q.each(c, function (c, d) {
                            let e = q.isFunction(a[d[4]]) && a[d[4]];
                            f[d[1]](function () {
                                let a = e && e.apply(this, arguments);
                                a && q.isFunction(a.promise) ? a.promise().progress(b.notify).done(b.resolve).fail(b.reject) : b[`${d[0]}With`](this, e ? [a] : arguments)
                            })
                        }),
                        a = null
                    }).promise()
                },
                then: function (b, d, e) {
                    let f = 0;
                    function g(b, c, d, e) {
                        return function () {
                            let h = this, i = arguments
                            let j = function () {
                                let a, j;
                                if (!(b < f)) {
                                    if (a = d.apply(h, i), a === c.promise()) throw new TypeError('Thenable self-resolution');
                                    j = a && (typeof a == 'object' || typeof a == 'function') && a.then, q.isFunction(j) ? e ? j.call(a, g(f, c, M, e), g(f, c, N, e)) : (f++, j.call(a, g(f, c, M, e), g(f, c, N, e), g(f, c, M, c.notifyWith))) : (d !== M && (h = void 0, i = [a]), (e || c.resolveWith)(h, i))
                                }
                            }
                            let k = e ? j : function () {
                                try { j() }
                                catch (a) {
                                    q.Deferred.exceptionHook && q.Deferred.exceptionHook(a, k.stackTrace), b + 1 >= f && (d !== N && (h = void 0, i = [a]), c.rejectWith(h, i))
                                }
                            };
                            b ? k() : (q.Deferred.getStackHook && (k.stackTrace = q.Deferred.getStackHook()), a.setTimeout(k))
                        }
                    }
                    return q.Deferred(function (a) {
                        c[0][3].add(g(0, a, q.isFunction(e) ? e : M, a.notifyWith)), c[1][3].add(g(0, a, q.isFunction(b) ? b : M)), c[2][3].add(g(0, a, q.isFunction(d) ? d : N))
                    }).promise()
                },
                promise: function (a) {
                    return null != a ? q.add(a, e) : e
                }
            },
            f = {};
            return q.each(c, function (a, b) {
                let g = b[2] , h = b[5];
                e[b[1]] = g.add,
                    h && g.add(function () {
                        d = h
                    }, c[3 - a][2].disable, c[0][2].lock),
                    g.add(b[3].fire),
                    f[b[0]] = function () {
                        return f[`${b[0]}With`](this === f ? void 0 : this, arguments),
                            this
                    }
                    ,
                    f[`${b[0]}With`] = g.fireWith
            }), e.promise(f), b && b.call(f, f), f
        },
        when: function (a) {
            let b = arguments.length, c = b, d = Array(c), e = f.call(arguments), g = q.Deferred();
            let h = function (a) {
                return function (c) {
                    d[a] = this, e[a] = arguments.length > 1 ? f.call(arguments) : c, --b || g.resolveWith(d, e)
                }
            };
            if (b <= 1 && (O(a, g.done(h(c)).resolve, g.reject), 'pending' === g.state() || q.isFunction(e[c] && e[c].then))) return g.then();
            while (c--) O(e[c], h(c), g.reject);
            return g.promise()
        }
    });

    let P = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
    q.Deferred.exceptionHook = function (b, c) {
        b && P.test(b.name) && log.warn(`EQuery.Deferred exception: ${b.message}`, b.stack, c)
    },
    q.readyException = function (b) {
        window.setTimeout(function () {
            throw b;
        });
    };

    let Selector = function (a) {
        var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date, v = a.document, w = 0, x = 0, y = ha(), z = ha(), A = ha(), B = function (a, b) {
            return a === b && (l = !0),
                0
        }, C = {}.hasOwnProperty, D = [], E = D.pop, F = D.push, G = D.push, H = D.slice, I = function (a, b) {
            for (var c = 0, d = a.length; c < d; c++)
                if (a[c] === b)
                    return c;
            return -1
        }, J = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", K = "[\\x20\\t\\r\\n\\f]", L = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+", M = "\\[" + K + "*(" + L + ")(?:" + K + "*([*^$|!~]?=)" + K + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + L + "))|)" + K + "*\\]", N = ":(" + L + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + M + ")*)|.*)\\)|)", O = new RegExp(K + "+", "g"), P = new RegExp("^" + K + "+|((?:^|[^\\\\])(?:\\\\.)*)" + K + "+$", "g"), Q = new RegExp("^" + K + "*," + K + "*"), R = new RegExp("^" + K + "*([>+~]|" + K + ")" + K + "*"), S = new RegExp("=" + K + "*([^\\]'\"]*?)" + K + "*\\]", "g"), T = new RegExp(N), U = new RegExp("^" + L + "$"), V = {
            ID: new RegExp("^#(" + L + ")"),
            CLASS: new RegExp("^\\.(" + L + ")"),
            TAG: new RegExp("^(" + L + "|[*])"),
            ATTR: new RegExp("^" + M),
            PSEUDO: new RegExp("^" + N),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + K + "*(even|odd|(([+-]|)(\\d*)n|)" + K + "*(?:([+-]|)" + K + "*(\\d+)|))" + K + "*\\)|)", "i"),
            bool: new RegExp("^(?:" + J + ")$", "i"),
            needsContext: new RegExp("^" + K + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + K + "*((?:-\\d)?\\d*)" + K + "*\\)|)(?=[^-]|$)", "i")
        }, W = /^(?:input|select|textarea|button)$/i, X = /^h\d$/i, Y = /^[^{]+\{\s*\[native \w/, Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, $ = /[+~]/, _ = new RegExp("\\\\([\\da-f]{1,6}" + K + "?|(" + K + ")|.)", "ig"), aa = function (a, b, c) {
            var d = "0x" + b - 65536;
            return d !== d || c ? b : d < 0 ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320)
        }, ba = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, ca = function (a, b) {
            return b ? "\0" === a ? "\ufffd" : a.slice(0, -1) + "\\" + a.charCodeAt(a.length - 1).toString(16) + " " : "\\" + a
        }, da = function () {
            m()
        }, ea = ta(function (a) {
            return a.disabled === !0 && ("form" in a || "label" in a)
        }, {
            dir: "parentNode",
            next: "legend"
        });
        try {
            G.apply(D = H.call(v.childNodes), v.childNodes),
                D[v.childNodes.length].nodeType
        } catch (fa) {
            G = {
                apply: D.length ? function (a, b) {
                    F.apply(a, H.call(b))
                }
                    : function (a, b) {
                        var c = a.length
                            , d = 0;
                        while (a[c++] = b[d++])
                            ;
                        a.length = c - 1
                    }
            }
        }
        function ga(a, b, d, e) {
            var f, h, j, k, l, o, r, s = b && b.ownerDocument, w = b ? b.nodeType : 9;
            if (d = d || [],
                "string" != typeof a || !a || 1 !== w && 9 !== w && 11 !== w)
                return d;
            if (!e && ((b ? b.ownerDocument || b : v) !== n && m(b),
                b = b || n,
                p)) {
                if (11 !== w && (l = Z.exec(a)))
                    if (f = l[1]) {
                        if (9 === w) {
                            if (!(j = b.getElementById(f)))
                                return d;
                            if (j.id === f)
                                return d.push(j),
                                    d
                        } else if (s && (j = s.getElementById(f)) && t(b, j) && j.id === f)
                            return d.push(j),
                                d
                    } else {
                        if (l[2])
                            return G.apply(d, b.getElementsByTagName(a)),
                                d;
                        if ((f = l[3]) && c.getElementsByClassName && b.getElementsByClassName)
                            return G.apply(d, b.getElementsByClassName(f)),
                                d
                    }
                if (c.qsa && !A[a + " "] && (!q || !q.test(a))) {
                    if (1 !== w)
                        s = b,
                            r = a;
                    else if ("object" !== b.nodeName.toLowerCase()) {
                        (k = b.getAttribute("id")) ? k = k.replace(ba, ca) : b.setAttribute("id", k = u),
                            o = g(a),
                            h = o.length;
                        while (h--)
                            o[h] = "#" + k + " " + sa(o[h]);
                        r = o.join(","),
                            s = $.test(a) && qa(b.parentNode) || b
                    }
                    if (r)
                        try {
                            return G.apply(d, s.querySelectorAll(r)),
                                d
                        } catch (x) { } finally {
                            k === u && b.removeAttribute("id")
                        }
                }
            }
            return i(a.replace(P, "$1"), b, d, e)
        }
        function ha() {
            var a = [];
            function b(c, e) {
                return a.push(c + " ") > d.cacheLength && delete b[a.shift()],
                    b[c + " "] = e
            }
            return b
        }
        function ia(a) {
            return a[u] = !0,
                a
        }
        function ja(a) {
            var b = n.createElement("fieldset");
            try {
                return !!a(b)
            } catch (c) {
                return !1
            } finally {
                b.parentNode && b.parentNode.removeChild(b),
                    b = null
            }
        }
        function ka(a, b) {
            var c = a.split("|")
                , e = c.length;
            while (e--)
                d.attrHandle[c[e]] = b
        }
        function la(a, b) {
            var c = b && a
                , d = c && 1 === a.nodeType && 1 === b.nodeType && a.sourceIndex - b.sourceIndex;
            if (d)
                return d;
            if (c)
                while (c = c.nextSibling)
                    if (c === b)
                        return -1;
            return a ? 1 : -1
        }
        function ma(a) {
            return function (b) {
                var c = b.nodeName.toLowerCase();
                return "input" === c && b.type === a
            }
        }
        function na(a) {
            return function (b) {
                var c = b.nodeName.toLowerCase();
                return ("input" === c || "button" === c) && b.type === a
            }
        }
        function oa(a) {
            return function (b) {
                return "form" in b ? b.parentNode && b.disabled === !1 ? "label" in b ? "label" in b.parentNode ? b.parentNode.disabled === a : b.disabled === a : b.isDisabled === a || b.isDisabled !== !a && ea(b) === a : b.disabled === a : "label" in b && b.disabled === a
            }
        }
        function pa(a) {
            return ia(function (b) {
                return b = +b,
                    ia(function (c, d) {
                        var e, f = a([], c.length, b), g = f.length;
                        while (g--)
                            c[e = f[g]] && (c[e] = !(d[e] = c[e]))
                    })
            })
        }
        function qa(a) {
            return a && "undefined" != typeof a.getElementsByTagName && a
        }
        c = ga.support = {},
            f = ga.isXML = function (a) {
                var b = a && (a.ownerDocument || a).documentElement;
                return !!b && "HTML" !== b.nodeName
            }
            ,
            m = ga.setDocument = function (a) {
                var b, e, g = a ? a.ownerDocument || a : v;
                return g !== n && 9 === g.nodeType && g.documentElement ? (n = g,
                    o = n.documentElement,
                    p = !f(n),
                    v !== n && (e = n.defaultView) && e.top !== e && (e.addEventListener ? e.addEventListener("unload", da, !1) : e.attachEvent && e.attachEvent("onunload", da)),
                    c.attributes = ja(function (a) {
                        return a.className = "i",
                            !a.getAttribute("className")
                    }),
                    c.getElementsByTagName = ja(function (a) {
                        return a.appendChild(n.createComment("")),
                            !a.getElementsByTagName("*").length
                    }),
                    c.getElementsByClassName = Y.test(n.getElementsByClassName),
                    c.getById = ja(function (a) {
                        return o.appendChild(a).id = u,
                            !n.getElementsByName || !n.getElementsByName(u).length
                    }),
                    c.getById ? (d.filter.ID = function (a) {
                        var b = a.replace(_, aa);
                        return function (a) {
                            return a.getAttribute("id") === b
                        }
                    }
                        ,
                        d.find.ID = function (a, b) {
                            if ("undefined" != typeof b.getElementById && p) {
                                var c = b.getElementById(a);
                                return c ? [c] : []
                            }
                        }
                    ) : (d.filter.ID = function (a) {
                        var b = a.replace(_, aa);
                        return function (a) {
                            var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id");
                            return c && c.value === b
                        }
                    }
                        ,
                        d.find.ID = function (a, b) {
                            if ("undefined" != typeof b.getElementById && p) {
                                var c, d, e, f = b.getElementById(a);
                                if (f) {
                                    if (c = f.getAttributeNode("id"),
                                        c && c.value === a)
                                        return [f];
                                    e = b.getElementsByName(a),
                                        d = 0;
                                    while (f = e[d++])
                                        if (c = f.getAttributeNode("id"),
                                            c && c.value === a)
                                            return [f]
                                }
                                return []
                            }
                        }
                    ),
                    d.find.TAG = c.getElementsByTagName ? function (a, b) {
                        return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0
                    }
                        : function (a, b) {
                            var c, d = [], e = 0, f = b.getElementsByTagName(a);
                            if ("*" === a) {
                                while (c = f[e++])
                                    1 === c.nodeType && d.push(c);
                                return d
                            }
                            return f
                        }
                    ,
                    d.find.CLASS = c.getElementsByClassName && function (a, b) {
                        if ("undefined" != typeof b.getElementsByClassName && p)
                            return b.getElementsByClassName(a)
                    }
                    ,
                    r = [],
                    q = [],
                    (c.qsa = Y.test(n.querySelectorAll)) && (ja(function (a) {
                        o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\r\\' msallowcapture=''><option selected=''></option></select>",
                            a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + K + "*(?:''|\"\")"),
                            a.querySelectorAll("[selected]").length || q.push("\\[" + K + "*(?:value|" + J + ")"),
                            a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="),
                            a.querySelectorAll(":checked").length || q.push(":checked"),
                            a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]")
                    }),
                        ja(function (a) {
                            a.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                            var b = n.createElement("input");
                            b.setAttribute("type", "hidden"),
                                a.appendChild(b).setAttribute("name", "D"),
                                a.querySelectorAll("[name=d]").length && q.push("name" + K + "*[*^$|!~]?="),
                                2 !== a.querySelectorAll(":enabled").length && q.push(":enabled", ":disabled"),
                                o.appendChild(a).disabled = !0,
                                2 !== a.querySelectorAll(":disabled").length && q.push(":enabled", ":disabled"),
                                a.querySelectorAll("*,:x"),
                                q.push(",.*:")
                        })),
                    (c.matchesSelector = Y.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ja(function (a) {
                        c.disconnectedMatch = s.call(a, "*"),
                            s.call(a, "[s!='']:x"),
                            r.push("!=", N)
                    }),
                    q = q.length && new RegExp(q.join("|")),
                    r = r.length && new RegExp(r.join("|")),
                    b = Y.test(o.compareDocumentPosition),
                    t = b || Y.test(o.contains) ? function (a, b) {
                        var c = 9 === a.nodeType ? a.documentElement : a
                            , d = b && b.parentNode;
                        return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
                    }
                        : function (a, b) {
                            if (b)
                                while (b = b.parentNode)
                                    if (b === a)
                                        return !0;
                            return !1
                        }
                    ,
                    B = b ? function (a, b) {
                        if (a === b)
                            return l = !0,
                                0;
                        var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
                        return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1,
                            1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === n || a.ownerDocument === v && t(v, a) ? -1 : b === n || b.ownerDocument === v && t(v, b) ? 1 : k ? I(k, a) - I(k, b) : 0 : 4 & d ? -1 : 1)
                    }
                        : function (a, b) {
                            if (a === b)
                                return l = !0,
                                    0;
                            var c, d = 0, e = a.parentNode, f = b.parentNode, g = [a], h = [b];
                            if (!e || !f)
                                return a === n ? -1 : b === n ? 1 : e ? -1 : f ? 1 : k ? I(k, a) - I(k, b) : 0;
                            if (e === f)
                                return la(a, b);
                            c = a;
                            while (c = c.parentNode)
                                g.unshift(c);
                            c = b;
                            while (c = c.parentNode)
                                h.unshift(c);
                            while (g[d] === h[d])
                                d++;
                            return d ? la(g[d], h[d]) : g[d] === v ? -1 : h[d] === v ? 1 : 0
                        }
                    ,
                    n) : n
            }
            ,
            ga.matches = function (a, b) {
                return ga(a, null, null, b)
            }
            ,
            ga.matchesSelector = function (a, b) {
                if ((a.ownerDocument || a) !== n && m(a),
                    b = b.replace(S, "='$1']"),
                    c.matchesSelector && p && !A[b + " "] && (!r || !r.test(b)) && (!q || !q.test(b)))
                    try {
                        var d = s.call(a, b);
                        if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType)
                            return d
                    } catch (e) { }
                return ga(b, n, null, [a]).length > 0
            }
            ,
            ga.contains = function (a, b) {
                return (a.ownerDocument || a) !== n && m(a),
                    t(a, b)
            }
            ,
            ga.attr = function (a, b) {
                (a.ownerDocument || a) !== n && m(a);
                var e = d.attrHandle[b.toLowerCase()]
                    , f = e && C.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
                return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null
            }
            ,
            ga.escape = function (a) {
                return (a + "").replace(ba, ca)
            }
            ,
            ga.error = function (a) {
                throw new Error("Syntax error, unrecognized expression: " + a)
            }
            ,
            ga.uniqueSort = function (a) {
                var b, d = [], e = 0, f = 0;
                if (l = !c.detectDuplicates,
                    k = !c.sortStable && a.slice(0),
                    a.sort(B),
                    l) {
                    while (b = a[f++])
                        b === a[f] && (e = d.push(f));
                    while (e--)
                        a.splice(d[e], 1)
                }
                return k = null,
                    a
            }
            ,
            e = ga.getText = function (a) {
                var b, c = "", d = 0, f = a.nodeType;
                if (f) {
                    if (1 === f || 9 === f || 11 === f) {
                        if ("string" == typeof a.textContent)
                            return a.textContent;
                        for (a = a.firstChild; a; a = a.nextSibling)
                            c += e(a)
                    } else if (3 === f || 4 === f)
                        return a.nodeValue
                } else
                    while (b = a[d++])
                        c += e(b);
                return c
            }
            ,
            d = ga.selectors = {
                cacheLength: 50,
                createPseudo: ia,
                match: V,
                attrHandle: {},
                find: {},
                relative: {
                    ">": {
                        dir: "parentNode",
                        first: !0
                    },
                    " ": {
                        dir: "parentNode"
                    },
                    "+": {
                        dir: "previousSibling",
                        first: !0
                    },
                    "~": {
                        dir: "previousSibling"
                    }
                },
                preFilter: {
                    ATTR: function (a) {
                        return a[1] = a[1].replace(_, aa),
                            a[3] = (a[3] || a[4] || a[5] || "").replace(_, aa),
                            "~=" === a[2] && (a[3] = " " + a[3] + " "),
                            a.slice(0, 4)
                    },
                    CHILD: function (a) {
                        return a[1] = a[1].toLowerCase(),
                            "nth" === a[1].slice(0, 3) ? (a[3] || ga.error(a[0]),
                                a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])),
                                a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && ga.error(a[0]),
                            a
                    },
                    PSEUDO: function (a) {
                        var b, c = !a[6] && a[2];
                        return V.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && T.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b),
                            a[2] = c.slice(0, b)),
                            a.slice(0, 3))
                    }
                },
                filter: {
                    TAG: function (a) {
                        var b = a.replace(_, aa).toLowerCase();
                        return "*" === a ? function () {
                            return !0
                        }
                            : function (a) {
                                return a.nodeName && a.nodeName.toLowerCase() === b
                            }
                    },
                    CLASS: function (a) {
                        var b = y[a + " "];
                        return b || (b = new RegExp("(^|" + K + ")" + a + "(" + K + "|$)")) && y(a, function (a) {
                            return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "")
                        })
                    },
                    ATTR: function (a, b, c) {
                        return function (d) {
                            var e = ga.attr(d, a);
                            return null == e ? "!=" === b : !b || (e += "",
                                "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(O, " ") + " ").indexOf(c) > -1 : "|=" === b && (e === c || e.slice(0, c.length + 1) === c + "-"))
                        }
                    },
                    CHILD: function (a, b, c, d, e) {
                        var f = "nth" !== a.slice(0, 3)
                            , g = "last" !== a.slice(-4)
                            , h = "of-type" === b;
                        return 1 === d && 0 === e ? function (a) {
                            return !!a.parentNode
                        }
                            : function (b, c, i) {
                                var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h, t = !1;
                                if (q) {
                                    if (f) {
                                        while (p) {
                                            m = b;
                                            while (m = m[p])
                                                if (h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType)
                                                    return !1;
                                            o = p = "only" === a && !o && "nextSibling"
                                        }
                                        return !0
                                    }
                                    if (o = [g ? q.firstChild : q.lastChild],
                                        g && s) {
                                        m = q,
                                            l = m[u] || (m[u] = {}),
                                            k = l[m.uniqueID] || (l[m.uniqueID] = {}),
                                            j = k[a] || [],
                                            n = j[0] === w && j[1],
                                            t = n && j[2],
                                            m = n && q.childNodes[n];
                                        while (m = ++n && m && m[p] || (t = n = 0) || o.pop())
                                            if (1 === m.nodeType && ++t && m === b) {
                                                k[a] = [w, n, t];
                                                break
                                            }
                                    } else if (s && (m = b,
                                        l = m[u] || (m[u] = {}),
                                        k = l[m.uniqueID] || (l[m.uniqueID] = {}),
                                        j = k[a] || [],
                                        n = j[0] === w && j[1],
                                        t = n),
                                        t === !1)
                                        while (m = ++n && m && m[p] || (t = n = 0) || o.pop())
                                            if ((h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) && ++t && (s && (l = m[u] || (m[u] = {}),
                                                k = l[m.uniqueID] || (l[m.uniqueID] = {}),
                                                k[a] = [w, t]),
                                                m === b))
                                                break;
                                    return t -= e,
                                        t === d || t % d === 0 && t / d >= 0
                                }
                            }
                    },
                    PSEUDO: function (a, b) {
                        var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || ga.error("unsupported pseudo: " + a);
                        return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b],
                            d.setFilters.hasOwnProperty(a.toLowerCase()) ? ia(function (a, c) {
                                var d, f = e(a, b), g = f.length;
                                while (g--)
                                    d = I(a, f[g]),
                                        a[d] = !(c[d] = f[g])
                            }) : function (a) {
                                return e(a, 0, c)
                            }
                        ) : e
                    }
                },
                pseudos: {
                    not: ia(function (a) {
                        var b = []
                            , c = []
                            , d = h(a.replace(P, "$1"));
                        return d[u] ? ia(function (a, b, c, e) {
                            var f, g = d(a, null, e, []), h = a.length;
                            while (h--)
                                (f = g[h]) && (a[h] = !(b[h] = f))
                        }) : function (a, e, f) {
                            return b[0] = a,
                                d(b, null, f, c),
                                b[0] = null,
                                !c.pop()
                        }
                    }),
                    has: ia(function (a) {
                        return function (b) {
                            return ga(a, b).length > 0
                        }
                    }),
                    contains: ia(function (a) {
                        return a = a.replace(_, aa),
                            function (b) {
                                return (b.textContent || b.innerText || e(b)).indexOf(a) > -1
                            }
                    }),
                    lang: ia(function (a) {
                        return U.test(a || "") || ga.error("unsupported lang: " + a),
                            a = a.replace(_, aa).toLowerCase(),
                            function (b) {
                                var c;
                                do
                                    if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang"))
                                        return c = c.toLowerCase(),
                                            c === a || 0 === c.indexOf(a + "-");
                                while ((b = b.parentNode) && 1 === b.nodeType);
                                return !1
                            }
                    }),
                    target: function (b) {
                        var c = a.location && a.location.hash;
                        return c && c.slice(1) === b.id
                    },
                    root: function (a) {
                        return a === o
                    },
                    focus: function (a) {
                        return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
                    },
                    enabled: oa(!1),
                    disabled: oa(!0),
                    checked: function (a) {
                        var b = a.nodeName.toLowerCase();
                        return "input" === b && !!a.checked || "option" === b && !!a.selected
                    },
                    selected: function (a) {
                        return a.parentNode && a.parentNode.selectedIndex,
                            a.selected === !0
                    },
                    empty: function (a) {
                        for (a = a.firstChild; a; a = a.nextSibling)
                            if (a.nodeType < 6)
                                return !1;
                        return !0
                    },
                    parent: function (a) {
                        return !d.pseudos.empty(a)
                    },
                    header: function (a) {
                        return X.test(a.nodeName)
                    },
                    input: function (a) {
                        return W.test(a.nodeName)
                    },
                    button: function (a) {
                        var b = a.nodeName.toLowerCase();
                        return "input" === b && "button" === a.type || "button" === b
                    },
                    text: function (a) {
                        var b;
                        return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase())
                    },
                    first: pa(function () {
                        return [0]
                    }),
                    last: pa(function (a, b) {
                        return [b - 1]
                    }),
                    eq: pa(function (a, b, c) {
                        return [c < 0 ? c + b : c]
                    }),
                    even: pa(function (a, b) {
                        for (var c = 0; c < b; c += 2)
                            a.push(c);
                        return a
                    }),
                    odd: pa(function (a, b) {
                        for (var c = 1; c < b; c += 2)
                            a.push(c);
                        return a
                    }),
                    lt: pa(function (a, b, c) {
                        for (var d = c < 0 ? c + b : c; --d >= 0;)
                            a.push(d);
                        return a
                    }),
                    gt: pa(function (a, b, c) {
                        for (var d = c < 0 ? c + b : c; ++d < b;)
                            a.push(d);
                        return a
                    })
                }
            },
            d.pseudos.nth = d.pseudos.eq;
        for (b in {
            radio: !0,
            checkbox: !0,
            file: !0,
            password: !0,
            image: !0
        })
            d.pseudos[b] = ma(b);
        for (b in {
            submit: !0,
            reset: !0
        })
            d.pseudos[b] = na(b);
        function ra() { }
        ra.prototype = d.filters = d.pseudos,
            d.setFilters = new ra,
            g = ga.tokenize = function (a, b) {
                var c, e, f, g, h, i, j, k = z[a + " "];
                if (k)
                    return b ? 0 : k.slice(0);
                h = a,
                    i = [],
                    j = d.preFilter;
                while (h) {
                    c && !(e = Q.exec(h)) || (e && (h = h.slice(e[0].length) || h),
                        i.push(f = [])),
                        c = !1,
                        (e = R.exec(h)) && (c = e.shift(),
                            f.push({
                                value: c,
                                type: e[0].replace(P, " ")
                            }),
                            h = h.slice(c.length));
                    for (g in d.filter)
                        !(e = V[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(),
                            f.push({
                                value: c,
                                type: g,
                                matches: e
                            }),
                            h = h.slice(c.length));
                    if (!c)
                        break
                }
                return b ? h.length : h ? ga.error(a) : z(a, i).slice(0)
            }
            ;
        function sa(a) {
            for (var b = 0, c = a.length, d = ""; b < c; b++)
                d += a[b].value;
            return d
        }
        function ta(a, b, c) {
            var d = b.dir
                , e = b.next
                , f = e || d
                , g = c && "parentNode" === f
                , h = x++;
            return b.first ? function (b, c, e) {
                while (b = b[d])
                    if (1 === b.nodeType || g)
                        return a(b, c, e);
                return !1
            }
                : function (b, c, i) {
                    var j, k, l, m = [w, h];
                    if (i) {
                        while (b = b[d])
                            if ((1 === b.nodeType || g) && a(b, c, i))
                                return !0
                    } else
                        while (b = b[d])
                            if (1 === b.nodeType || g)
                                if (l = b[u] || (b[u] = {}),
                                    k = l[b.uniqueID] || (l[b.uniqueID] = {}),
                                    e && e === b.nodeName.toLowerCase())
                                    b = b[d] || b;
                                else {
                                    if ((j = k[f]) && j[0] === w && j[1] === h)
                                        return m[2] = j[2];
                                    if (k[f] = m,
                                        m[2] = a(b, c, i))
                                        return !0
                                }
                    return !1
                }
        }
        function ua(a) {
            return a.length > 1 ? function (b, c, d) {
                var e = a.length;
                while (e--)
                    if (!a[e](b, c, d))
                        return !1;
                return !0
            }
                : a[0]
        }
        function va(a, b, c) {
            for (var d = 0, e = b.length; d < e; d++)
                ga(a, b[d], c);
            return c
        }
        function wa(a, b, c, d, e) {
            for (var f, g = [], h = 0, i = a.length, j = null != b; h < i; h++)
                (f = a[h]) && (c && !c(f, d, e) || (g.push(f),
                    j && b.push(h)));
            return g
        }
        function xa(a, b, c, d, e, f) {
            return d && !d[u] && (d = xa(d)),
                e && !e[u] && (e = xa(e, f)),
                ia(function (f, g, h, i) {
                    var j, k, l, m = [], n = [], o = g.length, p = f || va(b || "*", h.nodeType ? [h] : h, []), q = !a || !f && b ? p : wa(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q;
                    if (c && c(q, r, h, i),
                        d) {
                        j = wa(r, n),
                            d(j, [], h, i),
                            k = j.length;
                        while (k--)
                            (l = j[k]) && (r[n[k]] = !(q[n[k]] = l))
                    }
                    if (f) {
                        if (e || a) {
                            if (e) {
                                j = [],
                                    k = r.length;
                                while (k--)
                                    (l = r[k]) && j.push(q[k] = l);
                                e(null, r = [], j, i)
                            }
                            k = r.length;
                            while (k--)
                                (l = r[k]) && (j = e ? I(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l))
                        }
                    } else
                        r = wa(r === g ? r.splice(o, r.length) : r),
                            e ? e(null, g, r, i) : G.apply(g, r)
                })
        }
        function ya(a) {
            for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = ta(function (a) {
                return a === b
            }, h, !0), l = ta(function (a) {
                return I(b, a) > -1
            }, h, !0), m = [function (a, c, d) {
                var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
                return b = null,
                    e
            }
            ]; i < f; i++)
                if (c = d.relative[a[i].type])
                    m = [ta(ua(m), c)];
                else {
                    if (c = d.filter[a[i].type].apply(null, a[i].matches),
                        c[u]) {
                        for (e = ++i; e < f; e++)
                            if (d.relative[a[e].type])
                                break;
                        return xa(i > 1 && ua(m), i > 1 && sa(a.slice(0, i - 1).concat({
                            value: " " === a[i - 2].type ? "*" : ""
                        })).replace(P, "$1"), c, i < e && ya(a.slice(i, e)), e < f && ya(a = a.slice(e)), e < f && sa(a))
                    }
                    m.push(c)
                }
            return ua(m)
        }
        function za(a, b) {
            var c = b.length > 0
                , e = a.length > 0
                , f = function (f, g, h, i, k) {
                    var l, o, q, r = 0, s = "0", t = f && [], u = [], v = j, x = f || e && d.find.TAG("*", k), y = w += null == v ? 1 : Math.random() || .1, z = x.length;
                    for (k && (j = g === n || g || k); s !== z && null != (l = x[s]); s++) {
                        if (e && l) {
                            o = 0,
                                g || l.ownerDocument === n || (m(l),
                                    h = !p);
                            while (q = a[o++])
                                if (q(l, g || n, h)) {
                                    i.push(l);
                                    break
                                }
                            k && (w = y)
                        }
                        c && ((l = !q && l) && r--,
                            f && t.push(l))
                    }
                    if (r += s,
                        c && s !== r) {
                        o = 0;
                        while (q = b[o++])
                            q(t, u, g, h);
                        if (f) {
                            if (r > 0)
                                while (s--)
                                    t[s] || u[s] || (u[s] = E.call(i));
                            u = wa(u)
                        }
                        G.apply(i, u),
                            k && !f && u.length > 0 && r + b.length > 1 && ga.uniqueSort(i)
                    }
                    return k && (w = y,
                        j = v),
                        t
                };
            return c ? ia(f) : f
        }
        return h = ga.compile = function (a, b) {
            var c, d = [], e = [], f = A[a + " "];
            if (!f) {
                b || (b = g(a)),
                    c = b.length;
                while (c--)
                    f = ya(b[c]),
                        f[u] ? d.push(f) : e.push(f);
                f = A(a, za(e, d)),
                    f.selector = a
            }
            return f
        }
            ,
            i = ga.select = function (a, b, c, e) {
                var f, i, j, k, l, m = "function" == typeof a && a, n = !e && g(a = m.selector || a);
                if (c = c || [],
                    1 === n.length) {
                    if (i = n[0] = n[0].slice(0),
                        i.length > 2 && "ID" === (j = i[0]).type && 9 === b.nodeType && p && d.relative[i[1].type]) {
                        if (b = (d.find.ID(j.matches[0].replace(_, aa), b) || [])[0],
                            !b)
                            return c;
                        m && (b = b.parentNode),
                            a = a.slice(i.shift().value.length)
                    }
                    f = V.needsContext.test(a) ? 0 : i.length;
                    while (f--) {
                        if (j = i[f],
                            d.relative[k = j.type])
                            break;
                        if ((l = d.find[k]) && (e = l(j.matches[0].replace(_, aa), $.test(i[0].type) && qa(b.parentNode) || b))) {
                            if (i.splice(f, 1),
                                a = e.length && sa(i),
                                !a)
                                return G.apply(c, e),
                                    c;
                            break
                        }
                    }
                }
                return (m || h(a, n))(e, b, !p, c, !b || $.test(a) && qa(b.parentNode) || b),
                    c
            }
            ,
            c.sortStable = u.split("").sort(B).join("") === u,
            c.detectDuplicates = !!l,
            m(),
            c.sortDetached = ja(function (a) {
                return 1 & a.compareDocumentPosition(n.createElement("fieldset"))
            }),
            ja(function (a) {
                return a.innerHTML = "<a href='#'></a>",
                    "#" === a.firstChild.getAttribute("href")
            }) || ka("type|href|height|width", function (a, b, c) {
                if (!c)
                    return a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2)
            }),
            c.attributes && ja(function (a) {
                return a.innerHTML = "<input/>",
                    a.firstChild.setAttribute("value", ""),
                    "" === a.firstChild.getAttribute("value")
            }) || ka("value", function (a, b, c) {
                if (!c && "input" === a.nodeName.toLowerCase())
                    return a.defaultValue
            }),
            ja(function (a) {
                return null == a.getAttribute("disabled")
            }) || ka(J, function (a, b, c) {
                var d;
                if (!c)
                    return a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null
            }),
            ga
    }(window);

    q.find = Selector,
    q.expr = Selector.selectors,
    q.expr[':'] = q.expr.pseudos,
    q.uniqueSort = q.unique = Selector.uniqueSort,
    q.isXMLDoc = Selector.isXML,
    q.contains = Selector.contains,
    q.escapeSelector = Selector.escape;

    return (window$1.EQuery = q), q;

})));