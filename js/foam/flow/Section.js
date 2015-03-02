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
      model_: 'StringProperty',
      name: 'fullTitle',
      getter: function() {
        return (this.enumerate ? this.ordinal + ' ' : '') + this.title;
      }
    },
    {
      model_: 'DAOProperty',
      name: 'subSections',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    },
    {
      model_: 'BooleanProperty',
      name: 'enumerate',
      defaultValue: true
    },
    {
      model_: 'StringProperty',
      name: 'sectionAnchor',
      getter: function() {
        return 'section-' + this.fullTitle.toLowerCase().replace('.', '').replace(' ', '-');
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.parentSection && this.parentSection.addSubSection(this);
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

      flow-section {
        display: block;
      }

      @media print {

        book > flow-section {
          page-break-after: always;
        }

      }
    */},
    function toHTML() {/*
      <flow-section>
        <heading>
          <a name="%%sectionAnchor"></a><a href="#toc">%%fullTitle</a>
        </heading>
        <%= this.inner() %>
      </flow-section>
    */},
    function toDetailHTML() {/*
      <a href="#{{this.data.sectionAnchor}}">{{{this.data.fullTitle}}}</a><br />
      <blockquote>
        $$subSections{mode: 'read-only'}
      </blockquote>
    */}
  ]
});
