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
  extends: 'foam.flow.Element',

  requires: [ 'foam.ui.DAOListView' ],
  imports: [ 'parentSection' ],

  constants: { ELEMENT_NAME: 'toc' },

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'sections',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% this.sections = this.parentSection.subSections; %>
      <a name="toc"></a>
      <heading>
        Table of Contents
      </heading>
      <blockquote>
        $$sections{mode: 'read-only'}
      </blockquote>
    */},
    function CSS() {/*
      toc { display: block }

      toc a {
        text-decoration: none;
        color: #444;
      }

      @media print {

        toc {
          page-break-after: always;
        }

      }
    */}
  ]
});
