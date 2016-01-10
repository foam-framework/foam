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
  package: 'foam.flow',
  name: 'QuoteCode',
  extends: 'foam.flow.Element',

  documentation: 'Facade for code views that quote a brief snippet.',

  requires: [
    'foam.flow.CodeSnippet',
    'foam.flow.SourceCode'
  ],

  properties: [
    {
      type: 'String',
      name: 'code'
    },
    {
      type: 'String',
      name: 'language',
      defaultValue: 'javascript'
    },
    {
      type: 'String',
      name: 'title'
    },
    {
      type: 'String',
      name: 'mode',
      defaultValue: 'read-only'
    },
    {
      type: 'Boolean',
      name: 'showActions',
      defaultValue: false
    },
    {
      // type: 'foam.flow.CodeSnippet',
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
      // type: 'foam.flow.SourceCode',
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
