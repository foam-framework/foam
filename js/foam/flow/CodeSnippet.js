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
  name: 'CodeSnippet',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  requires: [ 'foam.flow.SourceCode' ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'id',
      defaultValue: 0
    },
    {
      model_: 'StringProperty',
      name: 'title'
    },
    {
      name: 'src',
      type: 'foam.flow.SourceCode',
      factory: function() {
        this.SourceCode.create({
          data: 'console.log("Hello world!");'
        });
      }
    }
  ]
});
