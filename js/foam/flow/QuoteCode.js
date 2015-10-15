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
  name: 'QuoteCode',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  documentation: 'Facade for code views that quote a brief snippet.',

  requires: [
    'foam.flow.CodeSnippet',
    'foam.flow.SourceCode'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'code'
    },
    {
      model_: 'StringProperty',
      name: 'language',
      defaultValue: 'javascript'
    },
    {
      model_: 'StringProperty',
      name: 'title'
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-only'
    },
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false
    },
    {
      type: 'foam.flow.CodeSnippet',
      name: 'codeSnippet',
      view: 'foam.flow.CodeSnippetView',
      lazyFactory: function() {
        return this.CodeSnippet.create({
          id$: this.id$,
          title$: this.title$,
          src$: this.sourceCode$
        });
      }
    },
    {
      type: 'foam.flow.SourceCode',
      name: 'sourceCode',
      view: {
        factory_: 'foam.flow.CodeView',
        minLines: 1,
        maxLines: 100
      },
      factory: function() {
        return this.SourceCode.create({
          code$: this.code$,
          language$: this.language$
        });
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* $$codeSnippet{
      mode: this.mode,
      showActions: this.showActions
    } */},
    function CSS() {/* quote-code { display: block; padding: 5px 20px; } */}
  ]
});
