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
  name: 'Glossary',
  extends: 'foam.flow.Section',

  requires: [ 'foam.ui.DAOListView' ],
  imports: [ 'glossaryTerms' ],

  properties: [
    {
      name: 'title',
      defaultValue: 'Glossary'
    },
    {
      type: 'Boolean',
      name: 'enumerate',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'terms',
      todo: 'Sort alphabetically',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% this.terms = this.glossaryTerms; %>
          <a name="glossary"></a>
          <heading>
            Glossary
          </heading>
          <blockquote>
            $$terms{mode: 'read-only'}
          </blockquote>
    */},
    function CSS() {/*
      book > glossary {
        display: block;
        clear: both;
      }

      @media print {

        glossary {
          page-break-after: always;
        }

      }
    */}
  ]
});
