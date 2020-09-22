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
      preSet: function(_, n) {
        return this.numberFormatter.i18nNumber(n);
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

      this.document.addEventListener('paste', this.onPaste);
      this.document.addEventListener('copy',  this.onCopy);
      this.document.addEventListener('keyup',  this.onKeyUp);

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
      this.document.body.setAttribute('aria-label', this.data.model_.CALC_NAME.value);
    },
    addArrowData: function(e, data) {
      e.setAttribute('data-arrow-up', data[0])
      e.setAttribute('data-arrow-down', data[1])
      e.setAttribute('data-arrow-left', data[2])
      e.setAttribute('data-arrow-right', data[3])
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
    },
    {
      name: 'onCopy',
      code: function(evt) {
        // Unless the user has done a ctrl-A to "select all", change the selection
        // to just row1.
        if ( evt.target.className !== 'history' )
	        document.getSelection().selectAllChildren(this.row1FormattedView.$);
      }
    },
    {
      name: 'onKeyUp',
      code: function(evt) {
        const curr = this.document.activeElement;
        const f1 = document.querySelector('.f1')

        // [up, down, left, right]
        this.addArrowData(document.body, [null,'.f1',null,null])
        this.addArrowData(f1, ['body','[aria-label="7"]',null,null])

        // Since history is dynamic regenerate that part of it
        // also fix the aria label of the first
        const historyNodeList = document.querySelectorAll('.history');
        const history = Array(historyNodeList.length).fill(0).map(function(_,i) {
          return historyNodeList[i];
	});

        var prev = {elem: document.body, selector: 'body'};

        history.map(function(e,i) {
          const selector = '.inner-calc-display>span>.history:nth-of-type('+(i+1)+')'
          prev.elem.setAttribute('data-arrow-down', selector);
          this.addArrowData(e, [prev.selector,'.f1',null,null]);
          f1.setAttribute('data-arrow-up', selector);
          prev = {elem: e, selector: selector}
        }.bind(this));

        if (evt.code === 'ArrowUp' && curr.dataset.arrowUp !== 'null')
          document.querySelector(curr.dataset.arrowUp).focus()
        if (evt.code === 'ArrowDown' && curr.dataset.arrowDown !== 'null')
          document.querySelector(curr.dataset.arrowDown).focus()
        if (evt.code === 'ArrowLeft' && curr.dataset.arrowLeft !== 'null')
          document.querySelector(curr.dataset.arrowLeft).focus()
        if (evt.code === 'ArrowRight' && curr.dataset.arrowRight !== 'null')
          document.querySelector(curr.dataset.arrowRight).focus()
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
      margin-left: 8px;
      margin-right: 10px;
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
      background-color: #333;
    }

    .rhs-ops {
      border-left-width: 1px;
      border-left-style: solid;
      border-left-color: rgb(68, 68, 68);
      background: #4a4a4a;
    }

    .rhs-ops .button {
      background-color: #4a4a4a;
    }

    .history {
      padding: 2px;
      padding-right: 7pt;
      width: calc(100% - 7pt - 2px);
    }

    .history:focus-within {
      padding: 0px;
      padding-right: calc(7pt - 2px);
      border: 2px solid rgba(52, 153, 128, 0.65);
      border-radius: 10px;
    }

    .button-column {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .inner-calc-display {
      position: absolute;
      right: 15pt;
      top: 100%;
      width: calc(100% - 17pt);
      margin: 1pt 0pt;
      padding: 11px 2px;
    }

    .inner-calc-display:focus {
      border: 2px solid rgba(52, 153, 128, 0.65);
      border-radius: 10px;
      padding: 9px 0px;
    }

    .calc-display {
      flex-grow: 5;
      position: relative;
    }

    .secondaryButtons {
      padding-left: 30px;
      background: #00796b;
    }

    .secondaryButtons .button {
      background: #00796b;
    }

    .tertiaryButtons {
      padding-left: 35px;
      background: #1de9b6;
    }

    .tertiaryButtons .button {
      background: #1de9b6;
    }

    .keypad {
      flex-grow: 0;
      flex-shrink: 0;
      margin-bottom: -4px;
      z-index: 5;
      padding-top: 4px;
    }

    .keypad:focus {
      border-top: 4px solid rgba(52, 153, 128, 0.45);
      padding-top: 0px;
    }

    .calculator-display {
      width: calc(100% - 4px);
      height: 2.5rem;
    }

    .calculator-display:focus {
      border-radius: 10px;
      border: 2px solid rgba(52, 153, 128, 0.65);
    }

    .alabel {
      font-size: 30px;
    }

    .alabel:focus-within {
      background: #999;
    }

    .calc hr {
      border-style: outset;
      opacity: 0.5;
    }

    .calc hr:focus {
      border-style: outset;
      opacity: 1;
    }
    .f1 {
      margin-left: calc(-13pt - 2px);
    }

    .f1:focus {
      margin-left: calc(-13pt - 4px);
    }

    .inner-calc-display:focus .f1 {
      margin-left: calc(-13pt - 4px);
    }

    #deg-label {
      position: absolute;
      z-index: 1;
    }
  */},
    {
      name: 'toHTML',
      template: function() {/*
        <%= this.CalcSpeechView.create({calc: this.data}) %>
        <!-- <%= this.ZoomView.create() %> -->
        <% X.registerModel(this.CalcButton, 'foam.ui.ActionButton'); %>
        <div id="%%id" class="CalcView">
        <div style="position: relative; z-index: 1;" tabindex="-1" aria-hidden="true">
          <div
            id="deg-label"
          >
            <span
              style="top: 15px;left: 0;position: absolute; z-index: 1;"
              id="<%=
                  this.setClass('active', function() {
                    return ! this.data.degreesMode;
                  })
                %>"
              class="rad">
              {{{this.data.model_.RAD.label}}}
            </span>
            <span
              style="top: 15px;position: absolute; z-index: 1;"
              id="<%=
                this.setClass('active', function() {
                  return   this.data.degreesMode;
                }) %>"
              class="deg">
                {{{this.data.model_.DEG.label}}}
            </span>
          </div>
        </div>

        <div class="edge"></div>
        <div class="calc">
          <div class="calc-display">
            <div class="inner-calc-display" role="list" aria-label="{{this.data.model_.CALC_HISTORY.value}}" tabindex="1">
              $$history{ rowView: 'foam.apps.calc.HistoryCitationView' }
              <div class="calculator-display" aria-label="{{this.data.model_.CALC_DISPLAY.value}}" tabindex="3">
                $$row1Formatted{mode: 'read-only', escapeHTML: false}
              </div>
            </div>
          </div>
          <div class="keypad" aria-label="{{this.data.model_.CALC_KEYPAD.value}}" tabindex="3">
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
