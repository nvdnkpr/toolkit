/**
 * @copyright   2010-2013, The Titon Project
 * @license     http://opensource.org/licenses/bsd-license.php
 * @link        http://titon.io
 */

(function() {
    'use strict';

Titon.Blackout = new Class({
    Extends: Titon.Component,

    /** Default options */
    options: {
        template: '<div class="blackout" id="titon-blackout"></div>',
        templateFrom: '#titon-blackout'
    },

    /**
     * Add events for browser resizing.
     *
     * @param {Object} [options]
     */
    initialize: function(options) {
        this.parent(options);
        this.createElement();

        window.addEvent('resize', this.position.bind(this));

        this.fireEvent('init');
    },

    /**
     * Hide the blackout.
     *
     * @returns {Titon.Blackout}
     */
    hide: function() {
        this.element.conceal();
        this.fireEvent('hide');

        return this;
    },

    /**
     * Display and position the blackout.
     *
     * @returns {Titon.Blackout}
     */
    position: function() {
        if (this.isVisible()) {
            var size = window.getSize();

            this.element.setStyles({
                width: size.x,
                height: size.y
            });
        }

        return this;
    },

    /**
     * Show the blackout.
     *
     * @returns {Titon.Blackout}
     */
    show: function() {
        this.element.reveal();
        this.position();
        this.fireEvent('show');

        return this;
    }

});

})();