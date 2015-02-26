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
  package: 'foam.demos',
  name: 'Flow',
  extendsModel: 'foam.flow.Section',

  properties: [
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.X.registerElement('solar',       'foam.demos.SolarSystem');
      this.X.registerElement('circle',      'foam.graphics.Circle');
      this.X.registerElement('email',       'com.google.mail.MobileController');
      this.X.registerElement('toc',         'foam.flow.ToC');
      this.X.registerElement('section',     'foam.flow.Section');
      this.X.registerElement('code-sample', 'foam.flow.CodeSample');
    }
  },

  templates: [
    function toHTML() {/*
      <h1>Flow Demo</h1>

      <toc/>

      <section title="Chapter">
        This is chapter 1.

        <section title="Sub-Chapter">
          Sub-Chapter Stuff
          <section title="Sub-Sub-Chapter">
            Sub-Sub-Chapter Stuff
          </section>
          <section title="Sub-Sub-Chapter">
            Sub-Sub-Chapter Stuff
          </section>
        </section>

        <section title="Sub-Chapter">
          More Sub-Chapter Stuff
        </section>

      </section>

      <section title="Chapter">
        This is chapter 2.
      </section>

      <circle color="blue" x="100" y="20" r="20"/>

      <!-- <solar/> -->

      <section title="Chapter">
        This is chapter 3.

        Sample 1:
        <code-sample code="return 1+2;"/>

        Sample 2:
        <code-sample>
          return 42*42;
        </code-sample>

        Sample 3:
        <code-sample>
          <code>return "hello world!";</code>
        </code-sample>

      </section>

      The end.
    */}
  ]
});
