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
  extendsModel: 'foam.flow.Section',

  requires: [ 'foam.ui.DAOListView' ],
  imports: [ 'glossaryTerms' ],

  properties: [
    {
      name: 'title',
      defaultValue: 'Glossary'
    },
    {
      model_: 'BooleanProperty',
      name: 'enumerate',
      defaultValue: false
    },
    {
      model_: 'DAOProperty',
      name: 'terms',
      todo: 'Sort alphabetically',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toHTML() {/*
      <% this.terms = this.glossaryTerms; %>
        <flow-glossary>
          <a name="glossary"></a>
          <heading>
            Glossary
          </heading>
          <blockquote>
            $$terms{mode: 'read-only'}
          </blockquote>
        </flow-glossary>
    */},
    function CSS() {/*
      flow-glossary { display: block }

      @media print {

        flow-glossary {
          page-break-after: always;
        }

      }
    */}
  ]
});
