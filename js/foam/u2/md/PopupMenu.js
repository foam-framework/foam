/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.md',
  name: 'PopupMenu',

  traits: ['foam.u2.ChoiceViewTrait'],

  imports: [
    'E',
    'clearTimeout',
    'document',
    'setTimeout',
    'window'
  ],

  documentation: 'A floating menu that pops up, positioning itself over the ' +
      'element that launches it with $$DOC{ref:".open"}.',

  properties: [
    ['hMargin', 8],
    ['vMargin', 8],
    ['maxDisplayCount', 5],
    ['itemHeight', 48],
    ['itemWidth', 100],
    ['isHidden', true],
    ['removeTimeout', 0],
    ['isClosing', false]
  ],

  methods: [
    function open(index, sourceElement) {
      /* Launches the menu, with the given selected item index, animating out
         from the given sourceElement's client rect. */
      var startingClientRect = sourceElement.getBoundingClientRect();
      var vp = {
        height: this.window.innerHeight || this.document.documentElement.clientHeight,
        width: this.window.innerWidth || this.document.documentElement.clientWidth
      };
      this.itemHeight = startingClientRect.height;
      this.itemWidth = startingClientRect.width - 16;

      var pxAbove = startingClientRect.top - this.vMargin - 4;
      var pxBelow = vp.height - startingClientRect.bottom - this.vMargin - 4;

      // "Slots" represent potential screen real estate for drawing the menu.
      var slotsAbove = Math.floor((pxAbove > 0) ? pxAbove / this.itemHeight : 0);
      var slotsBelow = Math.floor((pxBelow > 0) ? pxBelow / this.itemHeight : 0);
      // "Items" are the menu items going into these slots.
      var itemsAbove = index;
      var itemsBelow = this.choices.length - index - 1;

      // Show as many choices as there is room for, capped by how many we have
      // and by the maxDisplayCount (usually 5).
      var menuCount = Math.min(this.choices.length, this.maxDisplayCount,
          slotsAbove + slotsBelow + 1);
      var halfMenuCount = Math.floor(menuCount / 2);

      // If scrolling, this becomes the scroll offset.
      var itemForFirstSlot = 0;
      // If the selecteditem can't be in the best place, we animate it from the
      // start rect by this many slots. Negative offset means move up.
      var selectedOffset = 0;

      if (menuCount < this.choices.length) { // Scrolling required.
        // Check if there are enough slots to center the selected item.
        if (itemsBelow >= halfMenuCount && itemsAbove >= halfMenuCount &&
            slotsAbove >= halfMenuCount && slotsBelow >= halfMenuCount) {
          slotsAbove = halfMenuCount;
          slotsBelow = menuCount - slotsAbove - 1;
          selectedOffset = 0;
          itemForFirstSlot = index - slotsAbove;
        } else if (itemsAbove <= slotsAbove && itemsAbove < menuCount) {
          // Not enough items above, so we truncate and scroll to the top.
          slotsAbove = Math.min(slotsAbove, Math.max(itemsAbove, menuCount - slotsBelow - 1));
          selectedOfset = itemsAbove - slotsAbove;
          itemForFirstSlot = 0; // Scroll to top.
          slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
        } else if (itemsBelow <= slotsBelow && itemsBelow < menuCount) {
          // Not enough items below, so truncate and scroll to the bottom.
          slotsBelow = Math.min(slotsBelow, Math.max(itemsBelow, menuCount - slotsAbove - 1));
          selectedOffset = -(itemsBelow - slotsBelow);
          itemForFirstSlot = this.choices.length - menuCount; // Scroll to end.
          slotsAbove = Math.min(slotsAbove, menuCount - slotsBelow - 1);
        } else {
          // Use all slots, scroll to put the selected index exactly where it
          // should be. Make sure we never try to use too many slots.
          if (slotsAbove < halfMenuCount) {
            slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
          } else if (slotsBelow < halfMenuCount) {
            slotsAbove = Math.min(slotsAbove, menuCount - slotsBelow - 1);
          } else {
            slotsAbove = Math.min(slotsAbove, halfMenuCount);
            slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
          }

          selectedOffset = 0;
          itemForFirstSlot = index - slotsAbove;
        }
      } else {
        // No scrolling. The list wants to be centered on the selected index,
        // but may have to move up or down to fit in slotsAbove/Below.
        if (itemsAbove > slotsAbove) {
          selectedOffset = itemsAbove - slotsAbove;
          slotsBelow = menuCount - slotsAbove - 1;
        } else if (itemsBelow > slotsBelow) {
          selectedOffset = -(itemsBelow - slotsBelow);
          slotsAbove = menuCount - slotsBelow - 1;
        } else {
          selectedOffset = 0;
          slotsAbove = itemsAbove;
          slotsBelow = itemsBelow;
        }
        // ASSERT: slotsAbove + slotsBelow + 1 === menuCount
        itemForFirstSlot = 0; // Slots are always clamped exactly as needed.
      }

      // At this point, slotsAbove and slotsBelow are the actual screen areas
      // we're definitely using.
      // We update menuCount to the real count we're going to use.
      menuCount = Math.min(menuCount, slotsAbove + slotsBelow + 1);

      // If we couldn't fit so that our selected item is in the right place,
      // animate it up or down into the place it will appear in the list.
      // TODO: Or add empty entries to leave open space?
      if (selectedOffset !== 0) {
        // TODO: Animate this.
      }

      var bodyRect = this.document.body.getBoundingClientRect();
      var finalRect = {
        top:    -bodyRect.top + startingClientRect.top - (slotsAbove * this.itemHeight) - 2,
        bottom: -bodyRect.top + startingClientRect.top + startingClientRect.height + (slotsBelow * this.itemHeight) + 2 + this.vMargin * 2,
        height: menuCount * this.itemHeight + 4 + this.vMargin * 2,
        left: -bodyRect.left + startingClientRect.left - 2 - this.hMargin,
        right: -bodyRect.left + startingClientRect.left + startingClientRect.width + 2,
        width: startingClientRect.width + this.hMargin * 2 + 4
      };

      if (this.delegate_) {
        this.delegate_.unload();
        this.delegate_.removeAllChildren();
      } else {
        this.delegate_ = this.MenuElement.create({
          choices: this.choices,
          data$: this.data$,
          autoSetData: this.autoSetData,
          itemHeight: this.itemHeight,
          itemWidth: this.itemWidth,
          hMargin: this.hMargin,
        }, this.Y.sub({ popup: this }));
      }

      this.document.body.insertAdjacentHTML('beforeend', this.delegate_.outerHTML);
      this.delegate_.load();

      this.initializePosition(startingClientRect, finalRect);
      this.scrollToIndex(itemForFirstSlot);
      this.animateToExpanded();
    },

    function initializePosition(startingClientRect, finalRect) {
      var vDiff = startingClientRect.top - finalRect.top +
          startingClientRect.height / 2;
      var transformOrigin = '0 ' + vDiff + 'px';

      this.delegate_.style({
        padding: '0px 0px ' + this.vMargin * 2 + 'px 0px',
        top: finalRect.top + 'px',
        left: finalRect.left + 'px',
        height: finalRect.height + 'px',
        width: finalRect.width + 'px',
        'z-index': 1010,
        'transform-origin': transformOrigin,
        '-webkit-transform-origin': transformOrigin,
      });
    },

    function animateToExpanded() {
      this.delegate_.style({
        transition: 'transform cubic-bezier(0.0, 0.0, 0.2, 1) .1s',
        transform: 'scaleY(1)',
        '-webkit-transform': 'scaleY(1)',
      });
      this.isHidden = false;
    },

    function animateToHidden() {
      this.isHidden = true;
      this.delegate_.style({
        transition: 'opacity cubic-bezier(0.4, 0.0, 1, 1) .1s',
        opacity: '0',
        'pointer-events': 'none'
      });
    },

    function close() {
      if ( this.isClosing ) return;
      this.isClosing = true;
      this.animateToHidden();
      this.removeTimeout = this.setTimeout(function() {
        this.delegate_.remove();
      }.bind(this), 500);
    },

    function unload() {
      if ( this.removeTimeout ) this.clearTimeout(this.removeTimeout);
      this.SUPER();
    },

    function scrollToIndex(index) {
      // Three cases: in view, need to scroll up, need to scroll down.
      // Determine the parent's scrolling bounds first:
      var e = this.delegate_.children[index];
      // TODO(braden): This sucks and needs fixing.
      if (!e) return;

      this.delegate_.el().scrollTop = e.el().offsetTop - this.vMargin;
    },
  ],

  models: [
    {
      name: 'MenuElement',
      extends: 'foam.u2.View',

      traits: ['foam.u2.ChoiceViewTrait'],
      imports: [
        'document',
        'dynamic',
        'popup'
      ],
      properties: [
        ['nodeName', 'ul'],
        'itemHeight', 'itemWidth', 'hMargin'
      ],
      methods: [
        function initE() {
          this.cls(this.myCls());

          for ( var i = 0 ; i < this.choices.length ; i++ ) {
            this.start('li')
                .cls(this.myCls('choice'))
                .cls(this.dynamic(function(i) {
                  return this.index === i ? 'selected' : '';
                }.bind(this, i), this.index$))
                .style({
                  height: this.itemHeight,
                  width: this.itemWidth,
                  'margin-left': this.hMargin,
                  'margin-right': this.hMargin
                })
                .on('click', this.onClick.bind(this, i))
                .add(this.choices[i][1])
                .end();
          }
        },
        function load() {
          this.SUPER();
          this.document.body.addEventListener('touchstart', this.onTouch);
          this.document.body.addEventListener('mousemove', this.onMouseMove);
        },
        function unload() {
          this.SUPER();
          this.document.body.removeEventListener('touchstart', this.onTouch);
          this.document.body.removeEventListener('mousemove', this.onMouseMove);
        },
      ],

      listeners: [
        {
          name: 'onMouseMove',
          code: function(evt) {
            // Containment is not sufficient.
            // It's too eager to close the popup, and we want to keep it open so
            // long as the mouse is nearby.
            var pos = this.el().getBoundingClientRect();
            var margin = 50;
            if (evt.clientX < pos.left - margin || pos.right + margin < evt.clientX ||
                evt.clientY < pos.top - margin || pos.bottom + margin < evt.clientY) {
              this.popup.close();
            }
          }
        },
        {
          name: 'onTouch',
          code: function(evt) {
            // Make sure the target element is a child of the popup, otherwise close
            // the popup.
            if (!this.el().contains(evt.target)) {
              this.popup.close();
            }
          }
        },
        {
          name: 'onClick',
          code: function(index) {
            this.index = index;
            this.popup.close();
          }
        },
      ],

      templates: [
        function CSS() {/*
          ^ {
            background: white;
            border: 2px solid grey;
            display: table-footer-group;
            flex-direction: column;
            list-style-type: none;
            margin: 0;
            overflow-y: auto;
            padding: 0;
            position: absolute;
          }
          ^choice {
            align-content: flex-start;
            align-items: flex-end;
            cursor: pointer;
            display: inline-flex;
            margin: 0px;
            overflow: hidden;
            padding: 8px 0px 7px 0px;
          }
          ^choice.selected {
            font-weight: bold;
          }
        */}
      ]
    }
  ]
});
