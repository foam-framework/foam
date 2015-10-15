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
  package: 'foam.ui.md',
  name: 'ChoiceMenuView',

  extends: 'foam.ui.AbstractChoiceView',

  requires: ['foam.ui.md.FlatButton'],

  documentation: function() {/* A floating menu that positions itself
    over the element that lauches it with $$DOC{ref:'.open'} */},

  properties: [
    {
      name: 'className',
      defaultValueFn: function() { return 'foamChoiceMenuView '; }
    },
    {
      name: 'tagName',
      defaultValue: 'ul'
    },
    {
      name: 'innerTagName',
      defaultValue: 'li'
    },
    {
      name: 'hMargin',
      defaultValue: 16
    },
    {
      name: 'vMargin',
      defaultValue: 8
    },
    {
      name: 'maxDisplayCount',
      defaultValue: 5
    },
    {
      name: 'itemHeight',
      defaultValue: 48
    },
    {
      name: 'itemWidth',
      defaultValue: 100
    },
    {
      name: 'isHidden',
      defaultValue: true
    }
  ],

  listeners: [
    {
      name: 'updateSelected',
      code: function() {
        if ( ! this.$ || ! this.$.children ) return;
        for ( var i = 0 ; i < this.$.children.length ; i++ ) {
          var c = this.$.children[i];
          DOM.setClass(c, 'selected', i === this.index);
        }
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // Doing this at the low level rather than with this.setClass listeners
      // to avoid creating loads of listeners when autocompleting or otherwise
      // rapidly changing this.choices.
      this.index$.addListener(this.updateSelected);
      this.choices$.addListener(this.updateSelected);
    },
    open: function(selectedIndex, sourceElement) {
      /* Launches the menu, with the given selected item index, animating out
         from the given sourceElement's client rect. */

      var startFromClientRect = sourceElement.getBoundingClientRect();
      var vp = this.viewportSize();
      this.itemHeight = startFromClientRect.height;
      this.itemWidth = startFromClientRect.width-16;
      var pixAbove = startFromClientRect.top - this.vMargin - 4;
      var pixBelow = vp.height - startFromClientRect.bottom - this.vMargin - 4;

      // slots represent potential screen real estate for drawing the menu
      var slotsAbove = Math.floor((pixAbove > 0) ? pixAbove / this.itemHeight : 0);
      var slotsBelow = Math.floor((pixBelow > 0) ? pixBelow / this.itemHeight : 0);
      // items are the menu items that will fill some/all of the slots
      var itemsAbove = selectedIndex;
      var itemsBelow = this.choices.length - selectedIndex - 1;

      var menuCount = Math.min( Math.min(this.choices.length, this.maxDisplayCount),
                                slotsAbove + slotsBelow + 1);
      var halfMenuCount = Math.floor(menuCount/2);
      var itemForFirstSlot = 0; // if scrolling, this will be the scroll offset
      var selectedOffset = 0; // if the selected item can't be in the best place, animate it from the start rect by this many slots. Negative offset means move up, positive move down.

      if ( menuCount < this.choices.length ) { // scrolling
        // enough slots to center, item can be scrolled to center
        if ( itemsBelow >= halfMenuCount && itemsAbove >= halfMenuCount
             && slotsAbove >= halfMenuCount && slotsBelow >= halfMenuCount ) {
          slotsAbove = halfMenuCount;
          slotsBelow = menuCount - slotsAbove - 1;
          selectedOffset = 0;
          itemForFirstSlot = selectedIndex - slotsAbove;
        } else if ( itemsAbove  <= slotsAbove && itemsAbove < menuCount) { // scroll to start, truncate above-slots. If itemsAbove is too large, this case would push the menu up too far
          // truncate slotsAbove, but don't reduce total count below menuCount
          slotsAbove = Math.min(slotsAbove, Math.max(itemsAbove, menuCount - slotsBelow - 1));
          selectedOffset = itemsAbove - slotsAbove;
          itemForFirstSlot = 0; // scroll top
          slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
        } else if ( itemsBelow <= slotsBelow && itemsBelow < menuCount ) { // scroll to end, truncate below-slots. if itemsBelow is too large, this case would push the menu down too far
          // truncate slotsAbove, but don't reduce total count below menuCount
          slotsBelow = Math.min(slotsBelow, Math.max(itemsBelow, menuCount - slotsAbove - 1));
          selectedOffset = -(itemsBelow - slotsBelow);
          itemForFirstSlot = this.choices.length - menuCount; // scroll to end
          slotsAbove = Math.min(slotsAbove, menuCount - slotsBelow - 1);
        } else {
          // use all slots, scroll to put the selectedIndex exactly where it should be
          // Math.min used to make sure we never increase the number of slots past
          //   what is available
          if ( slotsAbove < halfMenuCount ) { // not enough on top, adjust bottom
            slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
          } else if ( slotsBelow < halfMenuCount ) { // not enough on bottom, adjust top
            slotsAbove = Math.min(slotsAbove, menuCount - slotsBelow - 1);
          } else { // enough both ways, equalize
            slotsAbove = Math.min(slotsAbove, halfMenuCount);
            slotsBelow = Math.min(slotsBelow, menuCount - slotsAbove - 1);
          }
          selectedOffset = 0;
          itemForFirstSlot = selectedIndex - slotsAbove;
        }
      } else { // non-scrolling
        // list wants to be centered on selectedIndex, but may have to move
        // up or down to fit into slotsAbove/slotsBelow
        if ( itemsAbove > slotsAbove ) { // move list down inside slots
          selectedOffset = itemsAbove - slotsAbove;
          slotsBelow = menuCount - slotsAbove - 1; // clamp the other slot count
        } else if ( itemsBelow > slotsBelow ) { // move list up inside slots
          selectedOffset = -(itemsBelow - slotsBelow);
          slotsAbove = menuCount - slotsBelow - 1; // clamp the other slot count
        } else { // there is room for all
          selectedOffset = 0;
          slotsAbove = itemsAbove;
          slotsBelow = itemsBelow;
        }
        // ASSERT: slotsAbove + slotsBelow + 1(selectedItem) === menuCount
        itemForFirstSlot = 0; // the slots are clamped to exactly what we need
      }
      // at this point slotsAbove/slotsBelow are the actual screen areas we
      // will definitely be using.
      // Update count in case we couldn't fit everything
      menuCount = Math.min(menuCount, slotsAbove + slotsBelow + 1);

      // if we couldn't fit so that our selected item is in the right place,
      // animate it up/down into the place it will appear in the list.
      // TODO: Or add empty entries to the front/end of the list to leave open space
      if ( selectedOffset !== 0 ) {
        //TODO: animate
      }

      var bodyRect = this.X.document.body.getBoundingClientRect();

      var finalRect = { top:    -bodyRect.top + startFromClientRect.top - (slotsAbove * this.itemHeight) -2 ,//- this.vMargin,
                        bottom: -bodyRect.top + startFromClientRect.top + startFromClientRect.height + (slotsBelow * this.itemHeight) +2 + this.vMargin*2,
                        height: menuCount * this.itemHeight +4 + this.vMargin*2,
                        left: -bodyRect.left + startFromClientRect.left -2 - this.hMargin,
                        right: -bodyRect.left + startFromClientRect.left + startFromClientRect.width +2,
                        width: startFromClientRect.width + this.hMargin*2 +4 };

      // add to body html
      if ( this.$ ) this.$.outerHTML = '';  // clean up old copy, in case of rapid re-activation
      this.X.document.body.insertAdjacentHTML('beforeend', this.toHTML());

      this.initializePosition(startFromClientRect, finalRect);
      this.scrollToIndex(itemForFirstSlot);
      this.animateToExpanded();
      this.initHTML();
    },
    initializePosition: function(startFromClientRect, finalRect) {
      // since we're aligning to the bottom of each item,
      this.$.style.padding = "0px 0px "+this.vMargin*2+"px 0px";//this.vMargin+"px 0px "+this.vMargin+"px 0px";

      this.$.style.top = finalRect.top + 'px';
      this.$.style.left = finalRect.left + 'px';
      this.$.style.height = finalRect.height + 'px';
      this.$.style.width = finalRect.width + 'px';
      this.$.style.zIndex = "1010";

      var verticalDiff = startFromClientRect.top - finalRect.top + startFromClientRect.height/2;
      this.$.style.transformOrigin = this.$.style.webkitTransformOrigin =
          "0 "+(verticalDiff)+"px";
      this.$.style.transform = this.$.style.webkitTransform = "scaleY(0.2)";
    },
    animateToExpanded: function() {
      this.$.style.transition = "transform cubic-bezier(0.0, 0.0, 0.2, 1) .1s";
      this.$.style.transform = this.$.style.webkitTransform = "scaleY(1)";
      this.isHidden = false;
    },
    animateToHidden: function() {
      this.isHidden = true;
      if ( ! this.$ ) return;
      this.$.style.transition = "opacity cubic-bezier(0.4, 0.0, 1, 1) .1s"
      this.$.style.opacity = "0";
      this.$.style.pointerEvents = "none";
    },
    close: function() {
      this.animateToHidden();
      this.X.setTimeout(function() { if (this.$) this.$.outerHTML = ''; }.bind(this), 500);
    },
    choiceToHTML: function(id, choice) {
      return '<' + this.innerTagName + ' id="' + id + '" class="choice" '+
      'style="height: ' + this.itemHeight +
      '; width: ' + this.itemWidth +
      '; margin-left: ' + this.hMargin +
      '; margin-right: ' + this.hMargin +
      '">' +
          choice[1] + '</' + this.innerTagName + '>';
    },
    toInnerHTML: function() {
      var out = [];
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        this.on(
          'click',
          function(index) {
            if ( ! this.isHidden ) {
              this.choice = this.choices[index];
              this.close();
            }
          }.bind(this, i),
          id);

        out.push(this.choiceToHTML(id, choice));
      }

      return out.join('');
    },

    initInnerHTML: function() {
      this.SUPER();
      this.updateSelected();
    },

    scrollToIndex: function(index) {
      // Three cases: in view, need to scroll up, need to scroll down.
      // First we determine the parent's scrolling bounds.
      var e = this.$.children[index];
      if ( ! e ) return;
      var parent = e.parentElement;
      while ( parent ) {
        var overflow = this.X.window.getComputedStyle(parent).overflow;
        if ( overflow === 'scroll' || overflow === 'auto' ) {
          break;
        }
        parent = parent.parentElement;
      }
      parent = parent || this.X.window;

      // the padding at the top of the list is part of the scroll area too
      parent.scrollTop = e.offsetTop - this.vMargin;
    }
  },
  templates: [
    function CSS() {/*
      .foamChoiceMenuView {
        list-style-type: none;
        border: 2px solid grey;
        background: white;
        display: table-footer-group;
        overflow-y: auto;
        position: absolute;
        margin: 0;
        flex-direction: column;
      }

      .foamChoiceMenuView .selected {
        font-weight: bold;
      }

      .foamChoiceMenuView {
        margin: 0px;
        padding: 0px;
      }
      .foamChoiceMenuView .choice {
        display: block;
        margin: 0px;
        padding: 8px 0px 7px 0px;
        display: inline-flex;
        align-items: flex-end;
        align-content: flex-start;
        overflow: hidden;
        cursor: pointer;
      }
    */}
  ]
});
