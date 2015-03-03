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
  name: 'CodeSample',
  extendsModel: 'foam.flow.Element',

  properties: [
    {
      // model_: 'FunctionProperty',
      name: 'code',
      preSet: function(_, txt) { return txt.trim(); },
      postSet: function(_, txt) {
        var fn = eval('(function() {\n'    + txt + '\n})');

        this.output = fn();
      }
    },
    {
      name: 'output'
    }
  ],

  methods: {
    /** Allow inner to be optional when defined using HTML. **/
    fromElement: function(e) {
      var children = e.children;
      if ( e.childNodes.length == 0 || children.length == 1 && children[0].nodeName === 'code' ) {
        return this.SUPER(e);
      }

      this.code = e.innerHTML;
      return this;
    }
  },

  templates: [
    function CSS() {/*
      code-sample > sample-code, code-sample > sample-output {
        padding: 8px;
        margin: 18px 0;
        width: 600px;
        border: 1px solid #000;
        display: block;
      }
    */},
    function toInnerHTML() {/*
      <sample-code>
        %%code
      </sample-code>
      Output:
      <sample-output>
        %%output
      </sample-output>
    */}
  ]
});
