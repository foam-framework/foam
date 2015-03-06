/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


CLASS({
  name: 'VerticalScrollNativeTrait',
  package: 'foam.input.touch',
  requires: [
    'foam.input.touch.GestureTarget'
  ],
  documentation: 'Makes (part of) a View scroll vertically. Expects scrollerID to be a property, giving the DOM ID of the element with overflow:scroll or similar. Any onScroll listener will be called on each scroll event, as per the verticalScrollNative gesture. NB: this.onScroll should be a listener, because this trait does not bind it.',
  properties: [
    {
      name: 'scroller$',
      documentation: 'A convenience that returns the scroller\'s DOM element.',
      getter: function() { return this.X.$(this.scrollerID); }
    },
    {
      name: 'scrollGesture',
      documentation: 'The currently installed ScrollGesture.',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        if ( ! this.scrollerID ) {
          console.warn('VerticalScrollNativeTrait attached to View without a scrollerID property set.');
          return '';
        }
        return this.GestureTarget.create({
          containerID: this.scrollerID,
          handler: this,
          gesture: 'verticalScrollNative'
        });
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      if ( this.X.gestureManager ) {
        this.X.gestureManager.install(this.scrollGesture);
      }
      /* Checks for this.onScroll. If found, will attach a scroll event listener for it. */
      if ( this.onScroll )
        this.scroller$.addEventListener('scroll', this.onScroll);
    },
    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      if ( this.X.gestureManager ) {
        this.X.gestureManager.uninstall(this.scrollGesture);
      }
      if ( this.onScroll && this.scroller$ )
        this.scroller$.removeEventListener('scroll', this.onScroll)
    }
  }
});

