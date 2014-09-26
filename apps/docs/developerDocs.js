/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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


MODEL({
  name: 'DocumentationBook',
  label: 'Documentation Book',
  plural: 'DocumentationBooks',
  help: 'A documentation object that exists outside of a specific model.',

  documentation: function() {/*
    <p>To create a body of documentation for general reference (a topic not
    connected to a specific model), create a model that extends $$DOC{ref:'.'}.
    Fill in the documentation property as normal, including chapters if necessary.
    Reference it the same way you would a normal model, and the $$DOC{ref:'DocView'} will
    load a different view for book references than for standard model references.</p>
  */}

});


MODEL({
  name: 'DevDocumentation_Context',
  extendsModel: 'DocumentationBook',
  label: 'Context Documentation',
  help: 'Context Documentation',

  documentation: {
    label: "Context Doc Label",

    body: function() {/*
      <p>Contexts are useful. Implement a new DocView for straight documentation
      models, and some kind of view picker for when we link to one.</p>
    */},
    chapters: [
      {
        name: 'Intro',
        label: 'Introduction to Context',
        model_: 'Documentation',
        body: "Introductory text to contexts in FOAM. Use them!"
      },
      {
        name: 'Recursion',
        label: 'Context recursively defined',
        model_: 'Documentation',
        body: "Something complicated about context."
      },
    ]
  },

});
