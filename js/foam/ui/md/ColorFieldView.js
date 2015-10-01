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
  name: 'ColorFieldView',
  extendsModel: 'foam.ui.md.TextFieldView',

  properties: [
    [ 'type', 'color' ],
    [ 'underline', false ],
    {
      name: 'choices'
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.softValue = DomValue.create(this.$input, 'input',
          this.growable ? 'textContent' : 'value');
      this.softValue.set(this.data);
      Events.link(this.softValue, this.softData$);

      if ( this.updateMode === this.EACH_KEYSTROKE ) {
        Events.link(this.data$, this.softData$);
      } else {
        Events.follow(this.data$, this.softData$);
      }

      this.setupAutocomplete();
    }
  },
  listeners: [
    {
      name: 'onKeyPress',
      documentation: 'Prevent shortcut keys from firing on <input> element',
      code: function(e) { e.stopPropagation(); }
    }
  ],
  templates: [
    function CSS() {/*
      .md-text-field-input[type="color"] {
        max-width: 250px;
        height: 32px;
      }
    */},
    function toHTML() {/*
      <%
        var input = this.inputId = this.nextID();
        var label = this.labelId = this.nextID();

        if ( this.floatingLabel ) {
          this.setClass('md-text-field-label-offset',
            function() {
              var focused = self.focused;
              var data    = self.data;
              return focused || ('' + data).length > 0;
            }, label
          );
        } else {
          this.setClass('md-text-field-no-label', function() { return true; }, this.id);
        }
        this.setClass('disabled',
          function() {
            return self.mode == 'read-only';
          }, this.id
        );
        this.on('keypress', this.onKeyPress, input);

        this.setMDClasses();
      %>
      <div <%= this.cssClassAttr() %> id="%%id">
        <% if (this.floatingLabel) { %>
          <label id="{{{label}}}" class="md-text-field-label">%%label</label>
        <% } %>
        <input
          id="{{{input}}}"
          type="%%type"
          class="md-text-field-input md-text-field-borderless"
          <% if ( this.choices ) { %> list="{{{input}}}list" <% } %>
        /> $$data{model_: 'foam.ui.TextFieldView', mode: 'read-only', floatingLabel: false}
        <% if ( this.choices ) { %>
          <datalist id="{{{input}}}list">
          <% for ( var i = 0 ; i < this.choices.length ; i++ ) { %>
            <option>{{{this.choices[i]}}}</option>
          <% } %>
          </datalist>
        <% } %>
      </div>
    */}
  ]
});
