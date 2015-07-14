define(['exports', '../util', '../dom/contains'], function (exports, _util, _domContains) {
    /**
     * @module trigger
     */

    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var reMouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
        reKeyEvent = /^key/;

    /**
     * Trigger event at element(s)
     *
     * @param {String} type Type of the event
     * @param {Object} data Data to be sent with the event (`params.detail` will be set to this).
     * @param {Object} [params] Event parameters (optional)
     * @param {Boolean} params.bubbles=true Does the event bubble up through the DOM or not.
     * @param {Boolean} params.cancelable=true Is the event cancelable or not.
     * @param {Mixed} params.detail=undefined Additional information about the event.
     * @return {Object} The wrapped collection
     * @chainable
     * @example
     *     $('.item').trigger('anyEventType');
     */

    function trigger(type, data) {
        var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        params.bubbles = typeof params.bubbles === 'boolean' ? params.bubbles : true;
        params.cancelable = typeof params.cancelable === 'boolean' ? params.cancelable : true;
        params.preventDefault = typeof params.preventDefault === 'boolean' ? params.preventDefault : false;
        params.detail = data;

        var EventConstructor = getEventConstructor(type),
            event = new EventConstructor(type, params);

        event._preventDefault = params.preventDefault;

        (0, _util.each)(this, function (element) {
            if (!params.bubbles || isEventBubblingInDetachedTree || isAttachedToDocument(element)) {
                dispatchEvent(element, event);
            } else {
                triggerForPath(element, type, params);
            }
        });
        return this;
    }

    function getEventConstructor(type) {
        return supportsOtherEventConstructors ? reMouseEvent.test(type) ? MouseEvent : reKeyEvent.test(type) ? KeyboardEvent : CustomEvent : CustomEvent;
    }

    /**
     * Trigger event at first element in the collection. Similar to `trigger()`, except:
     *
     * - Event does not bubble
     * - Default event behavior is prevented
     * - Only triggers handler for first matching element
     *
     * @param {String} type Type of the event
     * @param {Object} data Data to be sent with the event
     * @example
     *     $('form').triggerHandler('submit');
     */

    function triggerHandler(type, data) {
        if (this[0]) {
            trigger.call(this[0], type, data, { bubbles: false, preventDefault: true });
        }
    }

    /**
     * Check whether the element is attached to (or detached from) the document
     *
     * @private
     * @param {Node} element Element to test
     * @return {Boolean}
     */

    function isAttachedToDocument(element) {
        if (element === window || element === document) {
            return true;
        }
        return (0, _domContains.contains)(element.ownerDocument.documentElement, element);
    }

    /**
     * Dispatch the event at the element and its ancestors.
     * Required to support delegated events in browsers that don't bubble events in detached DOM trees.
     *
     * @private
     * @param {Node} element First element to dispatch the event at
     * @param {String} type Type of the event
     * @param {Object} [params] Event parameters (optional)
     * @param {Boolean} params.bubbles=true Does the event bubble up through the DOM or not.
     * Will be set to false (but shouldn't matter since events don't bubble anyway).
     * @param {Boolean} params.cancelable=true Is the event cancelable or not.
     * @param {Mixed} params.detail=undefined Additional information about the event.
     */

    function triggerForPath(element, type) {
        var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        params.bubbles = false;
        var event = new CustomEvent(type, params);
        event._target = element;
        do {
            dispatchEvent(element, event);
        } while (element = element.parentNode);
    }

    /**
     * Dispatch event to element, but call direct event methods instead if available
     * (e.g. "blur()", "submit()") and if the event is non-cancelable.
     *
     * @private
     * @param {Node} element Element to dispatch the event at
     * @param {Object} event Event to dispatch
     */

    var directEventMethods = ['blur', 'focus', 'select', 'submit'];

    function dispatchEvent(element, event) {
        if (directEventMethods.indexOf(event.type) !== -1 && typeof element[event.type] === 'function' && !event._preventDefault && !event.cancelable) {
            element[event.type]();
        } else {
            element.dispatchEvent(event);
        }
    }

    /**
     * Polyfill for CustomEvent, borrowed from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill).
     * Needed to support IE (9, 10, 11) & PhantomJS
     */

    (function () {
        function CustomEvent(event) {
            var params = arguments.length <= 1 || arguments[1] === undefined ? { bubbles: false, cancelable: false, detail: undefined } : arguments[1];

            var customEvent = document.createEvent('CustomEvent');
            customEvent.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return customEvent;
        }

        CustomEvent.prototype = _util.global.CustomEvent && _util.global.CustomEvent.prototype;
        _util.global.CustomEvent = CustomEvent;
    })();

    /*
     * Are events bubbling in detached DOM trees?
     * @private
     */

    var isEventBubblingInDetachedTree = (function () {
        var isBubbling = false,
            doc = _util.global.document;
        if (doc) {
            var _parent = doc.createElement('div'),
                child = _parent.cloneNode();
            _parent.appendChild(child);
            _parent.addEventListener('e', function () {
                isBubbling = true;
            });
            child.dispatchEvent(new CustomEvent('e', { bubbles: true }));
        }
        return isBubbling;
    })();

    var supportsOtherEventConstructors = (function () {
        try {
            new window.MouseEvent('click');
        } catch (e) {
            return false;
        }
        return true;
    })();

    /*
     * Export interface
     */

    exports.trigger = trigger;
    exports.triggerHandler = triggerHandler;
});