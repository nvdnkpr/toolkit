/**
 * @copyright   2010-2013, The Titon Project
 * @license     http://opensource.org/licenses/bsd-license.php
 * @link        http://titon.io
 */

(function(window) {
    'use strict';

window.Toolkit = {

    /** Current version */
    version: '%version%',

    /** Build date hash */
    build: '%build%',

    /** Options */
    options: {
        vendor: '',
        isPrefix: 'is-',
        hasPrefix: 'has-'
    },

    /** Localization messages */
    messages: {
        loading: 'Loading...',
        error: 'An error has occurred!'
    },

    /** Does the browser support transitions? */
    hasTransition: (function() {
        var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition'.split(' '),
            style = document.createElement('div').style;

        for (var i = 0; i < prefixes.length; i++) {
            if (prefixes[i] in style) {
                return prefixes[i];
            }
        }

        return false;
    })(),

    /** Detect touch devices */
    isTouch: !!('ontouchstart' in window),

    /**
     * Creates a jQuery plugin by extending the jQuery prototype and defines a method
     * that initializes a component. The component is only initialized if one has not been already.
     * Components are either defined per element, or on a collection of elements.
     *
     * @param {String} component
     * @param {Function} callback
     * @param {bool} collection
     */
    createComponent: function(component, callback, collection) {
        var name = component;

        // Prefix with toolkit to avoid collisions
        if ($.fn[name]) {
            name = 'toolkit' + name.charAt(0).toUpperCase() + name.slice(1);
        }

        $.fn[name] = collection ?

            // Apply the instance to a collection of elements
            function() {
                var instance = callback.apply(this, arguments);

                return this.each(function() {
                    $(this).addData('toolkit.' + component, instance);
                });
            } :

            // Apply the instance per element
            function() {
                var args = arguments;

                return this.each(function() {
                    var self = this;

                    $(this).addData('toolkit.' + component, (function() {
                        return function() {
                            return callback.apply(self, args);
                        };
                    })());
                });
            };
    },

    /**
     * Empty class to inherit from.
     */
    Class: function() {}

};

/**
 * Very basic method for allowing functions to inherit functionality through the prototype.
 *
 * @param {Function} base
 * @param {Object} properties
 * @param {Object} options
 * @returns {Function}
 */
Toolkit.Class.extend = function(base, properties, options) {
    $.extend(base.prototype, this.prototype, properties);

    // Use function as constructor
    base.prototype.constructor = base;

    // Set default options
    base.options = options || {};

    // Inherit the extend method
    base.extend = this.extend;

    return base;
};

/**
 * Fetch the component instance from the jQuery collection.
 *
 * @param {String} component
 * @returns {Array|Function}
 */
$.fn.toolkit = function(component) {
    var key = 'toolkit.' + component,
        data,
        instances = [];

    this.each(function() {
        if (data = $(this).data(key)) {
            instances.push( data );
        }
    });

    if (this.length === 1 && instances[0]) {
        return instances[0];
    }

    return instances;
};

/**
 * Reveal the element by applying the show class.
 * Should be used to trigger transitions and animations.
 *
 * @returns {jQuery}
 */
$.fn.reveal = function() {
    return this.removeClass('hide').addClass('show');
};

/**
 * Conceal the element by applying the hide class.
 * Should be used to trigger transitions and animations.
 *
 * @returns {jQuery}
 */
$.fn.conceal = function() {
    return this.removeClass('show').addClass('hide');
};

/**
 * Return a jQuery instance for the item in the collection defined by the index.
 *
 * @param {Number} index
 * @returns {jQuery}
 */
$.fn.i = $.fn.item = function(index) {
    var item = this.get(index);

    return item ? $(item) : null;
};

/**
 * Set data if the key does not exist, else return the current value.
 * If the value is a function, it will be executed to extract a value.
 *
 * @param {String} key
 * @param {*} value
 * @returns {*}
 */
$.fn.addData = function(key, value) {
    var data = this.data(key);

    if (data) {
        return data;

    } else if (typeof value === 'function') {
        value = value.call(this);
    }

    this.data(key, value);

    return value;
};

/**
 * An event that allows the clicking of the document to trigger a callback.
 * However, will only trigger if the element clicked is not in the exclude list or a child of.
 * Useful for closing drop downs and menus.
 *
 * Based on and credited to http://benalman.com/news/2010/03/jquery-special-events/
 *
 * @returns {Object}
 */
$.event.special.clickout = (function() {
    var elements = $([]),
        doc = $(document);

    function clickOut(e) {
        var trigger = true;

        elements.each(function() {
            if (trigger) {
                var self = $(this);

                trigger = (!self.is(e.target) && self.has(e.target).length === 0);
            }
        });

        if (trigger) {
            elements.trigger('clickout', [e.target]);
        }
    }

    return {
        setup: function() {
            elements = elements.add(this);

            if (elements.length === 1) {
                doc.on('click', clickOut);
            }
        },
        teardown: function() {
            elements = elements.not(this);

            if (elements.length === 0) {
                doc.off('click', clickOut);
            }
        },
        add: function(handler) {
            var oldHandler = handler.handler;

            handler.handler = function(e, el) {
                e.target = el;
                oldHandler.apply(this, arguments);
            };
        }
    };
})();

$.fn.clickout = function(data, fn) {
    return arguments.length > 0 ?
        this.on('clickout', null, data, fn) :
        this.trigger('clickout');
};

/**
 * Position the element relative to another element in the document, or to the mouse cursor.
 * Determine the offsets through the `relativeTo` argument, which can be an event, or a jQuery element.
 * Optional account for mouse location and base offset coordinates.
 *
 * @param {String} position
 * @param {Event|jQuery} relativeTo
 * @param {Object} baseOffset
 * @param {bool} isMouse
 * @returns {jQuery}
 */
$.fn.positionTo = function(position, relativeTo, baseOffset, isMouse) {
    position = $.hyphenate(position).split('-');

    var edge = { y: position[0], x: position[1] },
        offset = baseOffset || { left: 0, top: 0 },
        relHeight = 0,
        relWidth = 0,
        eHeight = this.outerHeight(true),
        eWidth = this.outerWidth(true);

    // If an event is used, position it near the mouse
    if (relativeTo.preventDefault) {
        offset.left += relativeTo.pageX;
        offset.top += relativeTo.pageY;

    // Else position it near the element
    } else {
        var relOffset = relativeTo.offset();

        offset.left += relOffset.left;
        offset.top += relOffset.top;
        relHeight = relativeTo.outerHeight();
        relWidth = relativeTo.outerWidth();
    }

    // Shift around based on edge positioning
    if (edge.y === 'top') {
        offset.top -= eHeight;
    } else if (edge.y === 'bottom') {
        offset.top += relHeight;
    } else if (edge.y === 'center') {
        offset.top -= Math.round((eHeight / 2) - (relHeight / 2));
    }

    if (edge.x === 'left') {
        offset.left -= eWidth;
    } else if (edge.x === 'right') {
        offset.left += relWidth;
    } else if (edge.x === 'center') {
        offset.left -= Math.round((eWidth / 2) - (relWidth / 2));
    }

    // Increase the offset in case we are following the mouse cursor
    // We need to leave some padding for the literal cursor to not cause a flicker
    if (isMouse) {
        if (edge.y === 'center') {
            if (edge.x === 'left') {
                offset.left -= 15;
            } else if (edge.x === 'right') {
                offset.left += 15;
            }
        }

        if (edge.x === 'center') {
            if (edge.y === 'top') {
                offset.top -= 10;
            } else if (edge.y === 'bottom') {
                offset.top += 20;
            }
        }
    }

    return this.css(offset);
};

/**
 * Delays the execution of a function till the duration has completed.
 *
 * @param {Function} func
 * @param {Number} [threshold]
 * @param {bool} [immediate]
 * @returns {Function}
 */
$.debounce = function(func, threshold, immediate) {
    var timeout;

    return function() {
        var context = this, args = arguments;

        clearTimeout(timeout);

        timeout = setTimeout(function() {
            timeout = null;

            if (!immediate) {
                func.apply(context, args);
            }
        }, threshold || 150);

        if (immediate && !timeout)  {
            func.apply(context, args);
        }
    };
};

/**
 * Throttle the execution of a function so it triggers at every delay interval.
 *
 * @param {Function} func
 * @param {Number} [delay]
 * @returns {Function}
 */
$.throttle = function(func, delay) {
    var throttled = false;

    return function() {
        var context = this, args = arguments;

        if (!throttled) {
            throttled = true;

            setTimeout(function() {
                func.apply(context, args);
                throttled = false;
            }, delay || 150);
        }
    };
};

/**
 * Used for CSS animations and transitions.
 *
 * @returns {bool}
 */
$.expr[':'].shown = function(obj) {
    return ($(obj).css('visibility') !== 'hidden');
};

/**
 * Convert uppercase characters to lower case dashes.
 *
 * @param {String} string
 * @returns {String}
 */
$.hyphenate = function(string) {
    return string.replace(/[A-Z]/g, function(match) {
        return ('-' + match.charAt(0).toLowerCase());
    });
};

/**
 * Polyfill for ECMA5 Function.bind().
 * Credit to the MDN team for the implementation.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 *
 * @returns {Function}
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var self = this,
            args = [].slice.call(arguments, 1),
            Func = function() {},
            bound = function() {
                return self.apply(
                    (this instanceof Func && context) ? this : context,
                    args.concat([].slice.call(arguments))
                );
            };

        Func.prototype = this.prototype;
        bound.prototype = new Func();

        return bound;
    };
}

})(window);
