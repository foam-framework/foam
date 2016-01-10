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
  name:  'HTMLView',
  label: 'HTML Field',

  extends: 'foam.ui.SimpleView',

  documentation: function() {/* A view of the static HTML provided in
    $$DOC{ref:'.data'}. In most cases use a
    $$DOC{ref:'foam.ui.View'} to display a template of your HTML instead. */},

  properties: [
    {
      name: 'name',
      type: 'String',
      defaultValue: ''
    },
    {
      type: 'String',
      name: 'tag',
      defaultValue: 'span'
    },
    {
      name: 'data'
    }
  ],

  methods: {
    toHTML: function() {
      var s = '<' + this.tag + ' id="' + this.id + '"';
      if ( this.name ) s+= ' name="' + this.name + '"';
      s += '></' + this.tag + '>';
      return s;
    },

    initHTML: function() {
      var e = this.$;

      if ( ! e ) {
        console.log('stale HTMLView');
        return;
      }
      this.domValue = DomValue.create(e, undefined, 'innerHTML');

      if ( this.mode === 'read-write' ) {
        Events.link(this.data$, this.domValue);
      } else {
        Events.follow(this.data$, this.domValue);
      }
    },

    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      Events.unlink(this.domValue, this.data$);
    }
  }
});
