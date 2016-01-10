/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'AlphaZoomPopupAnimation',
  package: 'foam.ui.md',

  properties: [
    {
      name: 'popup',
      required: true
    },
    {
      name: 'easing',
      defaultValue: Movement.easeOut(0.9)
    },
    {
      type: 'Float',
      name: 'openDuration',
      defaultValue: 250
    },
    {
      type: 'Float',
      name: 'closeDuration',
      defaultValue: 250
    },
    {
      name: 'openAnimation',
      lazyFactory: function() {
        return Movement.animate(
            this.openDuration,
            function() {
              var popup = this.popup;
              popup.alpha = 1;
              if ( popup.overlayView )
                popup.overlayView.alpha =
                    popup.overlayView.openAlpha;
              popup.zoom = 1;
            }.bind(this),
            this.easing,
            function() { this.popup.className = 'open'; }.bind(this));
      }
    },
    {
      name: 'closeAnimation',
      lazyFactory: function() {
        return Movement.animate(
            this.closeDuration,
            function() {
              var popup = this.popup;
              popup.alpha = 0;
              if ( popup.overlayView )
                popup.overlayView.alpha = 0;
              popup.zoom = 0.1;
            }.bind(this),
            this.easing,
            function() { this.popup.className = 'closed'; }.bind(this));
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.popup.alpha = 0;
        this.popup.zoom = 0.1;
      }
    }
  ]
});
