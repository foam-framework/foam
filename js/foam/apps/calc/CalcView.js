/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.calc',
  name: 'CalcView',
  extends: 'foam.ui.View',

  requires: [
    'foam.apps.calc.CalcButton',
    'foam.apps.calc.CalcSpeechView',
    'foam.apps.calc.Fonts',
    'foam.apps.calc.HistoryCitationView',
    'foam.apps.calc.MainButtonsView',
    'foam.apps.calc.NumberFormatter',
    'foam.apps.calc.SecondaryButtonsView',
    'foam.apps.calc.TertiaryButtonsView',
    'foam.ui.SlidePanel',
    'foam.ui.animated.Label'
    // 'foam.chromeapp.ui.ZoomView'
  ],

  imports: [ 'document' ],
  exports: [ 'data' ],

  properties: [
    {
      type: 'String',
      name: 'row1Formatted',
      view: 'foam.ui.animated.Label',
      preSet: function(_,nu) {
        return this.numberFormatter.i18nNumber(nu);
      }
    },
    {
      name: 'data',
      postSet: function() {
        this.numberFormatter = this.data.numberFormatter;
        Events.follow(this.data.row1$, this.row1Formatted$);
      }
    },
    {
      name: 'installFonts_',
      hidden: true,
      factory: function() {
        return this.document.head.querySelector('link[rel=stylesheet][href*=Roboto]') ?
            '' : this.Fonts.create();
      }
    },
    {
      type: 'Int',
      name: 'animating_',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( nu || old === nu || ! this.$ ) return;
        // After animations: Set "top" property of inner calc display to prevent
        // over-scrolling.
        var outerHeight = this.$outer.clientHeight;
        var innerHeight = this.$inner.clientHeight;
        this.$inner.style.top = innerHeight < outerHeight ?
            'calc(100% - ' + innerHeight + 'px)' :
            '0px';
      }
    },
    {
      name: '$inner',
      getter: function() { return this.$.querySelector('.inner-calc-display'); }
    },
    {
      name: '$outer',
      getter: function() { return this.$.querySelector('.calc-display'); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.$parent.addEventListener('paste', this.onPaste);

      // This block causes the calc-display to scroll when updated.
      // To remove this feature replace the .inner-calc-display 'transition:' and
      // 'top:' styles with 'bottom: 0'.
      var move = EventService.framed(EventService.framed(function() {
        if ( ! this.$ ) return;
        var value = DOMValue.create({element: this.$outer, property: 'scrollTop' });
        Movement.compile([
            function() { ++this.animating_; }.bind(this),
            [200, function() { value.value = this.$inner.clientHeight; }.bind(this)],
          function() { --this.animating_; }.bind(this)
        ])();
      }.bind(this)));

      Events.dynamicFn(function() { this.data.op; this.data.history; this.data.a1; this.data.a2; }.bind(this), move);

      this.X.window.addEventListener('resize', move);

      this.$.querySelector('.keypad').addEventListener('mousedown', function(e) { e.preventDefault(); return false; });
    }
  },

  listeners: [
    {
      name: 'onPaste',
      whenIdle: true,
      code: function(evt) {
        var CMD = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '+': 'plus', '-': 'minus', '*': 'mult', '/': 'div', '%': 'percent', '=': 'equals' };

        CMD[this.data.numberFormatter.useComma ? ',' : '.'] = 'point';

        var data = evt.clipboardData.getData('text/plain');
        for ( var i = 0 ; i < data.length ; i++ ) {
          var c = data.charAt(i);
          // If history is empty and the first character is '-' then insert a 0 to subtract from
          if ( c === '-' && ! i && ! this.data.history.length && ! this.data.row1 ) this.data['0']();
          var cmd = CMD[c];
          if ( cmd ) this.data[cmd]();
        }
      }
    }
  ],

  templates: [
    function CSS() {/*
    .CalcView * {
      box-sizing: border-box;
      outline: none;
    }


    .CalcView {
      -webkit-user-select: none;
      -webkit-font-smoothing: antialiased;
      font-family: Roboto, 'Helvetica Neue', Helvetica, Arial;
      font-size: 30px;
      font-weight: 300;
      height: 100%;
      position: fixed;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .CalcView ::-webkit-scrollbar {
      display: none;
    }

    .CalcView ::-webkit-scrollbar-thumb {
      display: none;
    }

    .calc {
      background-color: #eee;
      border: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      margin: 0;
      padding: 0px;
    }

    .deg, .rad {
      background-color: #eee;
      color: #111;
      font-size: 22px;
      font-weight: 400;
      opacity: 0;
      padding-left: 8px;
      padding-right: 10px;
      transition: opacity 0.8s;
    }

    .active {
      opacity: 1;
      z-index: 2;
    }

    .calc-display, .calc-display:focus {
      border: none;
      letter-spacing: 1px;
      line-height: 36px;
      margin: 0;
      min-width: 140px;
      padding: 0 25pt 2pt 25pt;
      text-align: right;
      -webkit-user-select: text;
      overflow-y: scroll;
      overflow-x: hidden;
    }

    .edge {
      background: linear-gradient(to bottom, rgba(240,240,240,1) 0%,
                                             rgba(240,240,240,0) 100%);
      height: 20px;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 1;
    }

    .calc .buttons {
      flex: 1 1 100%;
      width: 100%;
      height: 252px;
    }

    .button-row {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex: 1 1 100%;
      justify-content: space-between;
    }

    .button {
      flex-grow: 1;
      justify-content: center;
      display: flex;
      align-items: center;
      background-color: #4b4b4b;
    }

    .rhs-ops {
      border-left-width: 1px;
      border-left-style: solid;
      border-left-color: rgb(68, 68, 68);
      background: #777;
    }

    .rhs-ops .button {
      background-color: #777;
    }

    .button-column {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .inner-calc-display {
      position: absolute;
      right: 20pt;
      top: 100%;
      width: 100%;
      padding-left: 50px;
      padding-bottom: 11px;
    }

    .calc-display {
      flex-grow: 5;
      position: relative;
    }

    .secondaryButtons {
      padding-left: 30px;
      background: rgb(52, 153, 128);
    }

    .secondaryButtons .button {
      background: rgb(52, 153, 128);
    }

    .tertiaryButtons {
      padding-left: 35px;
      background: rgb(29, 233, 182);
    }

    .tertiaryButtons .button {
      background: rgb(29, 233, 182);
    }

    .keypad {
      flex-grow: 0;
      flex-shrink: 0;
      margin-bottom: -4px;
      z-index: 5;
    }

    .alabel {
      font-size: 30px;
    }

    .calc hr {
      border-style: outset;
      opacity: 0.5;
    }
  */},
    {
      name: 'toHTML',
      template: function() {/*
        <%= this.CalcSpeechView.create({calc: this.data}) %>
        <!-- <%= this.ZoomView.create() %> -->
        <% X.registerModel(this.CalcButton, 'foam.ui.ActionButton'); %>
        <div id="%%id" class="CalcView">
        <div style="position: relative;z-index: 100;">
          <div tabindex="1" style="position: absolute;">
            <span aria-label="{{{this.data.model_.RAD.label}}}" style="top: 10;left: 0;position: absolute;" id="<%= this.setClass('active', function() { return ! this.data.degreesMode; }) %>" class="rad" title="{{{this.data.model_.RAD.label}}}"></span>
            <span aria-label="{{{this.data.model_.DEG.label}}}" style="top: 10;left: 0;position: absolute;" id="<%= this.setClass('active', function() { return   this.data.degreesMode; }) %>" class="deg" title="{{{this.data.model_.DEG.label}}}"></span>
          </div>
        </div>

        <div class="edge"></div>
        <div class="calc">
          <div class="calc-display">
            <div class="inner-calc-display">
              $$history{ rowView: 'foam.apps.calc.HistoryCitationView' }
              <div>$$row1Formatted{mode: 'read-only', tabIndex: 3, escapeHTML: false}</div>
            </div>
          </div>
          <div class="keypad">
          <div class="edge2"></div>
          <%= this.SlidePanel.create({
            data: this.data,
            side: 'right',
            minWidth: 310,
            minPanelWidth: 320,
            panelRatio: 0.55,
            mainView: 'foam.apps.calc.MainButtonsView',
            stripWidth: 30,
            panelView: {
              factory_: 'foam.ui.SlidePanel',
              side: 'right',
              stripWidth: 30,
              minWidth: 320,
              minPanelWidth: 220,
              panelRatio: 3/7,
              mainView: 'foam.apps.calc.SecondaryButtonsView',
              panelView: 'foam.apps.calc.TertiaryButtonsView'
            }
           }) %>
          </div>
        </div>
        </div>
      */}
    }
  ]
});
