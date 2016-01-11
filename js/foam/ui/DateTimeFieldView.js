/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name:  'DateTimeFieldView',
  label: 'Date-Time Field',

  extends: 'foam.ui.SimpleView',

  properties: [
    {
      type: 'String',
      name: 'name'
    },
    {
      type: 'String',
      name: 'mode',
      defaultValue: 'read-write'
    },
    {
      name: 'domValue',
      postSet: function(oldValue) {
        if ( oldValue && this.value ) {
          Events.unlink(oldValue, this.value);
        }
      }
    },
    {
      name: 'data',
    },
    {
      model_:  'BooleanProperty',
      name: 'localeAware',
      help: 'allow editing of date time in local timezone',
      defaultValue: true
    },
  ],

  methods: {
    valueToDom: function(value) {
      return value ? this.localeAware ? value.getTime() - value.getTimezoneOffset() * 60000 : value.getTime() : 0;
    },
    domToValue: function(dom) {
      var d = new Date(dom);
      return this.localeAware ? new Date(d.getTime() + d.getTimezoneOffset() * 60000) : d;
    },

    toHTML: function() {
      // TODO: Switch type to just datetime when supported.
      return ( this.mode === 'read-write' ) ?
        '<input id="' + this.id + '" type="datetime-local" name="' + this.name + '"/>' :
        '<span id="' + this.id + '" name="' + this.name + '" ' + this.cssClassAttr() + '></span>' ;
    },

    initHTML: function() {
      this.SUPER();

      this.domValue = DomValue.create(
        this.$,
        this.mode === 'read-write' ? 'input' : undefined,
        this.mode === 'read-write' ? 'valueAsNumber' : 'textContent' );

      Events.relate(
        this.data$,
        this.domValue,
        this.valueToDom.bind(this),
        this.domToValue.bind(this));
    }
  }
});
