/**
 * @copyright   2010-2014, The Titon Project
 * @license     http://opensource.org/licenses/BSD-3-Clause
 * @link        http://titon.io
 */

Toolkit.Drop = new Class({
    Extends: Toolkit.Component,

    /** Default options */
    options: {
        delegate: '.js-drop',
        getTarget: 'data-drop',
        hideOpened: true
    },

    /**
     * Initialize the component by fetching elements and binding events.
     *
     * @param {Elements} elements
     * @param {Object} [options]
     */
    initialize: function(elements, options) {
        this.parent(options);
        this.nodes = elements;

        this.events = {
            'clickout document .@drop': 'onHide',
            'clickout document {selector}': 'onHide',
            '{mode} document {selector}': 'onShow'
        };

        this.enable();
        this.fireEvent('init');
    },

    /**
     * Hide the element and toggle node active state.
     *
     * @returns {Toolkit.Drop}
     */
    hide: function() {
        return this.parent(function() {
            if (this.node) {
                this.node
                    .aria({ selected: false, expanded: false })
                    .removeClass('is-active');
            }
        }.bind(this));
    },

    /**
     * Show the element and toggle node active state.
     *
     * @returns {Toolkit.Drop}
     */
    show: function(node) {
        this.parent(node);
        this.node
            .aria({ selected: true, expanded: true })
            .addClass('is-active');

        return this;
    },

    /**
     * When a node is clicked, grab the target from the attribute.
     * Validate the target element, then either display or hide.
     *
     * @private
     * @param {DOMEvent} e
     * @param {Element} node
     */
    onShow: function(e, node) {
        if (typeOf(e) === 'domevent') {
            e.preventDefault();
        }

        var target = this.readValue(node, this.options.getTarget);

        if (!target || target.substr(0, 1) !== '#') {
            return;
        }

        // Hide previous drops
        if (this.options.hideOpened && this.node && this.node !== node) {
            this.hide();
        }

        this.element = document.id(target.slice(1));
        this.node = node;

        if (!this.isVisible()) {
            this.show(node);
        } else {
            this.hide();
        }
    }

});

Toolkit.create('drop', function(options) {
    return new Toolkit.Drop(this, options);
}, true);