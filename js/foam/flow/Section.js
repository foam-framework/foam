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
  extends: 'foam.flow.Element',

  imports: [ 'parentSection' ],
  exports: [ 'as parentSection' ],

  properties: [
    {
      name: 'ordinal',
      defaultValue: ''
    },
    {
      name: 'title'
    },
    {
      type: 'String',
      name: 'fullTitle',
      getter: function() {
        return (this.enumerate ? this.ordinal + ' ' : '') + this.title;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'subSections',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    },
    {
      type: 'Boolean',
      name: 'enumerate',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'sectionAnchor',
      getter: function() {
        return this.replaceAll('section--' + this.fullTitle.toLowerCase(), /[. ]/, '-');
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
        line-height: 1em;
      }

      heading a {
        text-decoration: none;
        color: inherit;
       }

      book > section {
        display: block;
        clear: both;
      }

      @media not print {

        @media (max-width: 800px) {

          <% for ( var i = 0; i < 5; ++i ) { %>
            <% for ( var j = 0; j < i; ++j ) { %>section <% } %> > heading {
              font-size: <%= 10 + ((5 - i) * 3) %>px;
              margin-bottom: <%= 3 + (5 - i) %>px;
            }
          <% } %>

        }

        @media (min-width: 800px) {

          heading {
            font-size: 40px;<%= 20 + ((5 - i) * 5) %>px;
            margin-bottom: 9px;
          }

          <% for ( var i = 0; i < 5; ++i ) { %>
            <% for ( var j = 0; j < i; ++j ) { %>section <% } %> > heading {
              font-size: <%= 20 + ((5 - i) * 5) %>px;
              margin-bottom: <%= 5 + (5 - i) %>px;
            }
          <% } %>

        }

      }

      @media print {

        book > section {
          page-break-after: always;
        }

        <% for ( var i = 0; i < 5; ++i ) { %>
          <% for ( var j = 0; j < i; ++j ) { %>section <% } %> > heading {
            font-size: <%= 12 + ((5 - i) * 2) %>pt;
            margin-bottom: <%= (5 - i) * 2 %>px;
          }
        <% } %>

      }
    */},
    function toInnerHTML() {/*
        <heading>
          <a name="%%sectionAnchor"></a><a href="#toc">%%fullTitle</a>
        </heading>
        <%= this.inner() %>
    */},
    function toDetailHTML() {/*
      <a href="#{{this.data.sectionAnchor}}">{{{this.data.fullTitle}}}</a><br />
      <blockquote>
        $$subSections{mode: 'read-only'}
      </blockquote>
    */}
  ]
});
