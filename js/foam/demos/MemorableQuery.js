/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
  package: 'foam.demos',
  name: 'MemorableQuery',
  properties: [
    {
      name: 'queryParser',
      transient: true,
      hidden: true,
    },
    {
      name: 'query',
      hidden: true,
      memorable: true,
      postSet: function(_, q) {
        console.log("Query is now:", q.toSQL ? q.toSQL() : '');
      }
    },
    {
      name: 'memento',
      transient: true,
      hidden: true,
      memorable: false
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.addPropertyListener('query', this.updateMemento);
      this.addPropertyListener('memento', this.updateFromMemento);

      if ( this.hasOwnProperty('memento') )
        this.updateFromMemento(null, null, null, this.memento);
      else
        this.updateMemento();
    }
  },
  listeners: [
    {
      name: 'updateMemento',
      code: function() {
        var memento = {
          query: this.query.toMQL ? this.query.toMQL() : ''
        };

        if ( this.memento &&
             this.memento.query &&
             memento.query === this.memento.query ) return;

        this.memento = memento;
      }
    },
    {
      name: 'updateFromMemento',
      code: function(src, topic, old, memento) {
        this.query = this.queryParser.parseString(memento.query) || '';
      }
    }
  ]
});
