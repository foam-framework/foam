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
  name: 'FOAMBook',
  package: 'foam.flow',
  extendsModel: 'View',

  requires: [
    'foam.flow.Author',
    'foam.flow.ToC',
    'foam.flow.Section'
  ],
  imports: [ 'registerElement' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'FOAM'
    },
    {
      model_: 'StringProperty',
      name: 'subTitle',
      defaultValue: 'The Good Parts'
    },
    {
      model_: 'ArrayProperty',
      name: 'authors',
      singular: 'author',
      type: 'Array[foam.flow.Author]',
      factory: function() {
        return [
          this.Author.create({
            firstName: 'John',
            middleNames: ['Jonny', 'Smitty'],
            lastName: 'Smith',
            email: 'john@smith.com'
          })
        ];
      }
    }
  ],

  templates: [
    { name: 'toHTML' },
    // TODO: Move CSS out of here
    function CSS() {/*
book-container {
    position: relative;
    min-height:100%;
    display: flex;
    justify-content: center;
    align-items: stretch;
    background: #eee;
}

book {
    background: #fff;
    padding: 100px 4% 4% 4%;
    box-shadow: 0px 0px 20px #888;
}

book p {
    margin-bottom: 10px;
}

title-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

@media (max-width: 800px) {

    book {
        width: 100%;
    }

    book p {
        width: 100%;
    }

}

@media (min-width: 800px) {

    book {
        width: 80%;
    }

    book p {
        width: 70%;
    }

}

title-page > * {
    display: block;
}

@media not print {

    title-page > doc-title {
        font-weight: bold;
        font-size: 80px;
        margin-top: 20px;
    }

    title-page > sub-title {
        margin: 10px;
        font-size: 40px;
    }

    title-page > author {
        margin-top: 3px;
    }

    <% for ( var i = 0; i < 5; ++i ) { %>
      <% for ( var j = 0; j < i; ++j ) { %>flow-section <% } %>heading {
        font-size: <%= 20 + ((5 - i) * 5) %>px;
        margin-bottom: <%= 5 + (5 - i) %>px;
      }
    <% } %>

}

@media print {

    @page :first {
        margin: 2in 2in 2in 2in;
    }

    title-page {
        page-break-after: always;
    }

    title-page > doc-title {
        font-weight: bold;
        font-size: 32pt;
        margin-top: 1in;
    }

    title-page > sub-title {
        margin-top: 0.5in;
        font-size: 24pt;
    }

    title-page > author {
        margin-top: 0.05in;
    }

    @page :left {
        margin: 1in 1.5in 1in 1in;
    }

    @page :right {
        margin: 1in 1in 1in 1.5in;
    }

    <% for ( var i = 0; i < 5; ++i ) { %>
      <% for ( var j = 0; j < i; ++j ) { %>flow-section <% } %>header {
        font-size: <%= 12 + ((5 - i) * 2) %>pt;
        margin-bottom: <%= (5 - i) * 2 %>px;
      }
    <% } %>

}
*/}
  ]
});
