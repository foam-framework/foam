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
  package: 'foam.demos.sevenguisu2',
  name: 'FlightBooker',
  extends: 'foam.u2.Element',

  // TODO: these shouldn't be required
  requires: [
    'foam.u2.DateView',
    'foam.u2.tag.Select'
  ],

  imports: [ 'dynamic' ],

  properties: [
    {
      type: 'Boolean',
      name: 'oneWay',
      defaultValue: true,
      toPropertyE: function(X) {
        // TODO: Why do I need to lookup here?
        return X.lookup('foam.u2.tag.Select').create({
          choices: [
            [ true,  'one-way flight' ],
            [ false, 'return flight'  ]
          ]
        });
      }
    },
    {
      type: 'Date',
      name: 'departDate',
      factory: function() { return new Date(Date.now()+3600000*24); },
      validate: function(departDate) {
        var today = new Date();
        today.setHours(0,0,0,0);
        if ( departDate.compareTo(today) < 0 ) return 'Must not be in the past.';
      }
    },
    {
      type: 'Date',
      name: 'returnDate',
      factory: function() { return new Date(Date.now()+2*3600000*24); },
      validate: function(oneWay, returnDate, departDate) {
        if ( ! oneWay && returnDate.compareTo(departDate) < 0 ) return 'Must not be before depart date.';
      }
    },
    {
      name: 'returnDateMode',
      factory: function() { return this.dynamic(function(oneWay) { return oneWay ? 'disabled' : 'rw'; }, this.oneWay$); }
    } 
  ],
                                                
  templates: [
    function CSS() {/*
      ^ { padding: 10px; }
      ^ .error { border: 2px solid red; }
      ^title { font-size: 18px; }
      ^title, ^ button, ^ input, ^ select {
        width: 160px; height: 24px; margin: 5px;
      }
    */},
    function initE() {/*#U2
      <div class="^" x:data={{this}}>
        <div class="^title">Book Flight</div>
        <:oneWay/> <br>
        <:departDate/> <br>
        <:returnDate mode={{this.returnDateMode}}/> <br>
        <:book/> <br>
      </div>
    */}
  ],
  actions: [
    {
      name: 'book',
      isEnabled: function() { return this.isValid(); },
      code: function() {
        var depart = this.departDate.toLocaleDateString();

        window.alert('You have booked a ' + (this.oneWay ?
          'one-way flight on ' + depart :
          'flight departing on ' + depart + ' and returning ' + this.returnDate.toLocaleDateString() ) + '.');
      }
    }
  ]
});
