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
  extends: 'foam.flow.Element',

  imports: [ 'glossaryTerms' ],

  properties: [
    {
      type: 'String',
      name: 'id',
      getter: function() {
        return this.replaceAll(this.term.toLowerCase(), ' ', '-') +
            (this.sense ?
            '--' + this.replaceAll(this.sense.toLowerCase(), ' ', '-') :
            '');
      }
    },
    {
      type: 'String',
      name: 'term'
    },
    {
      type: 'String',
      name: 'sense'
    },
    {
      type: 'String',
      name: 'definition'
    },
    {
      name: 'termAnchor',
      getter: function() {
        return 'term--' + this.id;
      }
    }
  ],

  methods: {
    fromElement: function(e) {
      this.SUPER(e);
      // Prevent overwrite of existing term's definition. First definition wins.
      if ( this.definition ) {
        this.glossaryTerms.find(this.id, {
          put: function(term) {
            if ( ! term.definition ) {
              this.glossaryTerms.put(this);
            } else {
              console.warn(
                  'Duplicate glossary term definitions. Discarding latter: "' +
                      this.definition + '"');
            }
          }.bind(this),
          error: function() {
            this.glossaryTerms.put(this);
          }.bind(this)
        });
      }
    }
  },

  templates: [
    function toInnerHTML() {/* <a href="#%%termAnchor">%%term</a> */},
    function toDetailHTML() {/*
      <term-definition><a name="{{this.data.termAnchor}}"></a>
        <term>{{{this.data.term}}}</term>
        <% if ( this.data.sense ) { %><sense>({{{this.data.sense}}})</sense><% } %>
        <definition>{{{this.data.definition}}}</definition>
      </term-definition>
    */},
    function CSS() {/*
      glossary-term a {
        text-decoration: none;
      }

      term-definition definition {
        display: block;
      }

      @media not print {

        glossary-term a, term-definition term {
          color: #080;
          font-family: Consolas, "Courier New", monospace;
          font-weight: bold;
          background: #E0E0E0;
          padding: 0px 2px;
          border-radius: 2px;
        }

        term-definition definition {
          margin-top: 10px;
          margin-bottom: 13px;
        }

      }

      @media print {

        glossary-term a, term-definition term {
          text-transform: capitalize;

        }

        term-definition term {
          font-weight: bold;
        }

        term-definition definition {
          margin-top: 6pt;
          margin-bottom: 8pt;
        }

      }
    */}
  ]
});
