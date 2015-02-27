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
  package: 'foam.flow',
  name: 'Section',
  extendsModel: 'foam.flow.Element',

  imports: [ 'parentSection' ],
  exports: [ 'as parentSection' ],

  constants: { ELEMENT: 'section' },

  properties: [
    {
      name: 'ordinal',
      defaultValue: ''
    },
    {
      name: 'title'
    },
    {
      model_: 'DAOProperty',
      name: 'subSections',
      view: 'DAOListView',
      factory: function() { return []; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.parentSection && this.parentSection.addSubSection(this);
    },

    /** Allow inner to be optional when defined using HTML. **/
    fromElement: function(e) {
      this.SUPER(e);
      var children = e.children;
      if ( children.length !== 1 || children[0].nodeName !== 'inner' ) {
        this.inner = e.innerHTML;
      }

      return this;
    },

    addSubSection: function(section) {
      this.subSections.push(section);
      section.ordinal = this.ordinal + this.subSections.length + '.';
    }
  },

  templates: [
    function CSS() {/*
      heading {
        display: block;
        font-size: 16px;
        margin-top: 18px;
      }
      heading a {
        text-decoration: none;
       }
    */},
    function toHTML() {/*
      <flow-section>
        <heading>
          <a name="section-%%ordinal"></a><a href="#toc">%%ordinal %%title</a>
        </heading>
        <%= this.inner() %>
      </flow-section>
    */},
    function toDetailHTML() {/*
      <a href="#section-{{this.ordinal}}">{{this.ordinal}} {{this.title}}</a><br>
      <blockquote>
        $$subSections{mode: 'read-only'}
      </blockquote>
    */}
  ]
});
