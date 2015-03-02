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
  name: 'ToC',
  label: 'Table of Contents',
  extendsModel: 'foam.ui.View',

  requires: ['foam.ui.DAOListView'],

  imports: [ 'parentSection' ],

  properties: [
    {
      model_: 'DAOProperty',
      name: 'sections',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toHTML() {/*
      <% this.sections = this.parentSection.subSections; %>
        <flow-toc>
          <a name="toc"></a>
          <heading>
            Table of Contents
          </heading>
          <blockquote>
            $$sections{mode: 'read-only'}
          </blockquote>
        </flow-toc>
    */},
    function CSS() {/*
      flow-toc { display: block }

      flow-toc a {
        text-decoration: none;
        color: #444;
      }

      @media print {

        flow-toc {
          page-break-after: always;
        }

      }
    */}
  ]
});
