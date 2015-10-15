/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.questionnaire',
  name: 'QuestionnaireDetailView',

  extends: 'foam.ui.md.DetailView',

  methods: [
    function rowToHTML(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
      var str = "";

      if ( prop.help ) str += '<p class="md-style-trait-standard">' + prop.help + '</p>'
      str += view.toHTML();
      str += '<br>';

      return str;
    }
  ],

});
