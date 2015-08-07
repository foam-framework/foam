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

MODEL({
  package: 'foam.demos.sevenguis',
  name: 'FlightBooker',
  extendsModel: 'foam.ui.View',
  requires: [ 'foam.ui.DateFieldView' ],
  properties: [
    {
      name: 'oneWay',
      defaultValue: true,
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
          [ true,  'one-way flight' ],
          [ false, 'return flight' ]
        ]
      }
    },
    {
      model_: 'DateProperty',
      name: 'departDate'
    },
    {
      model_: 'DateProperty',
      name: 'returnDate'
    },
    'message'
  ],
  methods: [
    function initHTML() {
      this.SUPER();
      this.oneWay$.addListener(this.onOneWayChange);
      this.onOneWayChange();
    }
  ],
  templates: [
    function CSS() {/*
      body { padding: 10px !important; }
    */},
    function toHTML() {/*
      $$oneWay <br>
      $$departDate <br>
      $$returnDate <br>
      $$book <br>
      $$message{mode: 'read-only'}
    */}
  ],
  listeners: [
    {
      name: 'onOneWayChange',
      code: function(_, oneWay) {
        if ( oneWay )
          this.returnDateView.$.removeAttribute('disabled');
        else
          this.returnDateView.$.setAttribute('disabled', '');
      }
    }
  ],
  actions: [
    {
      name: 'book',
      isEnabled: function() {
        var oneWay = this.oneWay, departDate = this.departDate, returnDate = this.returnDate;
        return departDate && ( oneWay || returnDate ) ;
      },
      action: function() {
        var depart = this.departDate.toLocaleDateString();
        this.message = this.oneWay ?
          'You have booked a one-way flight on ' + depart + '.' :
          'You have booked a flight departing on ' + depart + ' and returning ' + this.returnDate.toLocaleDateString() + '.';
      }
    }
  ]
});
