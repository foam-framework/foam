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
  extendsModel: 'View',

  imports: [ 'parentSection' ],

  properties: [
    {
      model_: 'DAOProperty',
      name: 'sections',
      view: 'DAOListView',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toHTML() {/*
      <%  this.sections = this.parentSection.subSections; %>
      <hr>
        <a name="toc"></a>
        <h2>Table of Contents</h2>
        <blockquote>
          $$sections{mode: 'read-only'}
        </blockquote>
      <hr>
    */}
  ]
});
