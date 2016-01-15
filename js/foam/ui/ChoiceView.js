/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  package: 'foam.ui',
  name:  'ChoiceView',
  extends: 'foam.ui.AbstractChoiceView',

  /*
   * <select size="">
   *    <choice value="" selected></choice>
   * </select>
   */
  properties: [
    {
      type:  'String',
      name:  'name',
      defaultValue: 'field'
    },
    {
      type:  'String',
      name:  'helpText',
      defaultValue: undefined
    },
    {
      type:  'Int',
      name:  'size',
      defaultValue: 1
    }
  ],

  templates: [
    function toHTML() {/*
<select id="%%id" name="%%name" size="%%size"><% this.toInnerHTML(out); %></select>*/},
    function toInnerHTML() {/*
<% if ( this.helpText ) { %>
<option disabled="disabled"><%= escapeHTML(this.helpText) %></option>
<% } %>
<% for ( var i = 0, choice ; choice = this.choices[i] ; i++ ) { %>
<option id="<%= this.on('click', this.onClick,
this.on('mouseover', this.onMouseOver,
this.on('mouseout', this.onMouseOut))) %>" <% if ( this.data && choice[0] === this.data ) { %>selected<% } %> value="<%= i %>"><%= escapeHTML(choice[1].toString()) %></option>
<% } %>
*/}
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.domValue = DomValue.create(this.$);
      Events.link(this.index$, this.domValue);
    },
    initInnerHTML: function() {
      this.SUPER();
      this.domValue && this.domValue.set(this.index);
    }
  },

  listeners: [
    {
      name: 'onMouseOver',
      code: function(e) {
        if ( this.timer_ ) this.X.clearTimeout(this.timer_);
        this.prev = ( this.prev === undefined ) ? this.data : this.prev;
        this.index = e.target.value;
      }
    },
    {
      name: 'onMouseOut',
      code: function(e) {
        if ( this.timer_ ) this.X.clearTimeout(this.timer_);
        this.timer_ = this.X.setTimeout(function() {
          this.data = this.prev || '';
          this.prev = undefined;
        }.bind(this), 1);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        this.data = this.prev = this.choices[e.target.value][0];
      }
    }
  ]
});
