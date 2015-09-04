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
  name: 'TimePickerView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.ui.md.PopupChoiceView',
  ],
  properties: [
    {
      name: 'className',
      defaultValue: 'time-picker-view',
    },
    {
      name: 'hour',
      defaultValue: -1,
      view: {
        factory_: 'foam.ui.md.PopupChoiceView',
        choices: [
          [-1, "Hour"],
          [0,"12 am"],
          [1,"1 am"],
          [2,"2 am"],
          [3,"3 am"],
          [4,"4 am"],
          [5,"5 am"],
          [6,"6 am"],
          [7,"7 am"],
          [8,"8 am"],
          [9,"9 am"],
          [10,"10 am"],
          [11,"11 am"],
          [12,"12 pm"],
          [13,"1 pm"],
          [14,"2 pm"],
          [15,"3 pm"],
          [16,"4 pm"],
          [17,"5 pm"],
          [18,"6 pm"],
          [19,"7 pm"],
          [20,"8 pm"],
          [21,"9 pm"],
          [22,"10 pm"],
          [23,"11 pm"],
        ]
      },
      postSet: function(old,nu) {
        if ( (! equals(old,nu)) ) this.calcTime();
      }
    },
    {
      name: 'minute',
      defaultValue: -1,
      view: function(args, opt_X) {
        var X = opt_X || this.X;
        var v = X.lookup('foam.ui.md.PopupChoiceView').create(args, X);
        var times = [[-1,'Minute']];
        for (var x = 0; x < 60; ++x) { times.push(x); }
        v.choices = times;
        return v;
      },
      postSet: function(old,nu) {
        if ( (! equals(old,nu)) ) this.calcTime();
      }
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( (! old) || this.hour != this.data.getHours() ) this.hour = this.data.getHours();
        if ( (! old) || this.minute != this.data.getMinutes() ) this.minute = this.data.getMinutes();
      }
    }
  ],
  methods: [
    function calcTime() {
      var newData = ( ! this.data ) ? new Date() : new Date(this.data);
      if ( this.hour >= 0 ) newData.setHours(this.hour);
      if ( this.minute >= 0 ) newData.setMinutes(this.minute);
      this.data = newData;
    }
  ],
  templates: [
    function CSS() {/*
      .time-picker-view .time-picker-view-editors {
        display: flex;
        flex-direction: row;
        align-items: baseline;
      }
      .time-picker-view .time-picker-view-editors > :nth-child(n) {
        min-width: 100px;       
      }
      
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div class="md-title">
          Choose Time
        </div>
        <div class="time-picker-view-editors">
          $$hour $$minute
        </div>
      </div>
    */},
  ]
});