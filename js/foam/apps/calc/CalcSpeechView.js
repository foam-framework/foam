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
  package: 'foam.apps.calc',
  name: 'CalcSpeechView',
  extendsModel: 'foam.ui.View',
  properties: [
    'calc',
    'lastSaid'
  ],
  listeners: [
    {
      name: 'onAction',
      whenIdle: true,
      code: function(calc, topic, action) {
        var last  = this.calc.history[this.calc.history.length-1];
        var unary = last && last.op.unary;
        this.say(
          action.name === 'equals' ?
            action.speechLabel + ' ' + this.calc.a2 :
          unary ?
            action.speechLabel + ' ' + Calc.EQUALS.speechLabel + ' ' + this.calc.a2 :
            action.speechLabel);
      }
    }
  ],
  actions: [
    {
      name: 'repeat',
      keyboardShortcuts: [ 'r' ],
      code: function() { this.say(this.lastSaid); }
    },
    {
      name: 'sayState',
      keyboardShortcuts: [ 's' ],
      code: function() {
        var last  = this.calc.history[this.calc.history.length-1];
        if ( ! last ) {
          this.say(this.calc.a2);
        } else {
          var unary = last && last.op.unary;
          if ( this.calc.op !== DEFAULT_OP ) {
            this.say(
              unary ?
                this.calc.a2 + ' ' + last.op.speechLabel :
                last.a2 + ' ' + this.calc.op.speechLabel + ' ' + this.calc.a2 );
          } else {
            this.say(
              unary ?
                last.a2 + ' ' + last.op.speechLabel + ' ' + Calc.EQUALS.speechLabel + ' ' + this.calc.a2 :
                last.op !== DEFAULT_OP ?
                  this.calc.history[this.calc.history.length-2].a2 + ' ' + last.op.speechLabel  + ' ' + last.a2 + ' ' + Calc.EQUALS.speechLabel + ' ' + this.calc.a2 :
                  this.calc.a2);
          }
        }
      }
    },
    {
      name: 'sayModeState',
      keyboardShortcuts: [ 't' ],
      code: function() { this.say(this.calc.degreesMode ? 'degrees' : 'radians'); }
    }
  ],
  methods: {
    say: function(msg) {
      // console.log('say: ', msg);
      this.lastSaid = msg;
      var e = document.createTextNode(' ' + msg + ' ');
      e.id = this.nextID();
      this.$.appendChild(e);
      setTimeout(Movement.whenIdle(function() { e.remove(); }), 15000);
    },
    toHTML: function() {
      return '<output id="' + this.id + '" style="position:absolute;left:-1000000;" aria-live="polite"></output>'
    },
    initHTML: function() {
      this.SUPER();
      this.calc.subscribe(['action'], this.onAction);
    }
  }
});
