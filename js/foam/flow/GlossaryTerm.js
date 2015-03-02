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
  name: 'GlossaryTerm',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  imports: [ 'glossaryTerms' ],

  constants: { ELEMENT: 'glossary-term' },

  properties: [
    {
      model_: 'StringProperty',
      name: 'term'
    },
    {
      model_: 'StringProperty',
      name: 'definition'
    },
    {
      name: 'termAnchor',
      getter: function() {
        return 'term-' + this.term.toLowerCase().replace(' ', '-');
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // TODO: Support name and sense-based disambiguation.
      this.glossaryTerms.push(this);
    }
  },

  templates: [
    function toHTML() {/*
      <flow-term><a href="#%%termAnchor">%%term</a></flow-term>
    */},
    function toDetailHTML() {/*
      <flow-glossary-term><a name="{{this.data.termAnchor}}"></a>
        <term>{{{this.data.term}}}</term>
        <definition>{{{this.data.definition}}}</definition>
      </flow-glossary-term>
    */},
    function CSS() {/*
      flow-term a {
        text-decoration: none;
        color: inherit;
      }

      flow-glossary-term definition {
        display: block;
      }
      @media not print {

        flow-term, flow-glossary-term term {
          color: #080;
          font-family: Consolas, "Courier New", monospace;
          font-weight: bold;
          background: #eee;
          padding: 5px;
        }

        flow-glossary-term definition {
          margin-top: 10px;
        }

      }

      @media print {

        flow-term, flow-glossary-term term {
          text-transform: capitalize;

        }

        flow-glossary-term term {
          font-weight: bold;
        }

        flow-glossary-term definition {
          margin-top: 6pt;
        }

      }
    */}
  ]
});
