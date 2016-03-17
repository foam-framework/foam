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
  name: 'Replicator',
  extends: 'foam.u2.View',
  requires: [
    'foam.persistence.ManualObjectReplicator',
    'foam.core.dao.DelayedPutDAO',
    'foam.persistence.CompositeObjectReplicator',
    'foam.dao.EasyDAO',
    'MDAO',
    'foam.u2.tag.Checkbox',
  ],
  properties: [
    {
      name: 'obja',
    },
    {
      name: 'objb'
    },
    {
      name: 'replicator',
      factory: function() {
        var daoa = this.DelayedPutDAO.create({
          rowDelay: 5000,
          delegate: this.EasyDAO.create({
            daoType: this.MDAO,
            model: this.ModelA
          })
        });
        var daob = this.EasyDAO.create({
          daoType: this.MDAO,
          model: this.ModelB
        });

        daoa.put(this.ModelA.create({ id: 1, name: 'Foo', toggle: false }));
        daob.put(this.ModelB.create({ id: 12, count: 32, someField: 'hello there' }));

        var repa = this.ManualObjectReplicator.create();
        repa.dao = daoa;
        repa.model = this.ModelA;
        repa.id = 1;

        var repb = this.ManualObjectReplicator.create();
        repb.dao = daob;
        repb.model = this.ModelB;
        repb.id = 12;

        repa.future.get(function(o) { this.obja = o; }.bind(this));
        repb.future.get(function(o) { this.objb = o; }.bind(this));

        repa.start();
        repb.start();

        return this.CompositeObjectReplicator.create({
          children: [repa, repb]
        });
      }
    }
  ],
  models: [
    {
      name: 'ModelA',
      properties: [
        'id',
        {
          name: 'name',
          type: 'String'
        },
        {
          name: 'toggle',
          type: 'Boolean'
        }
      ]
    },
    {
      name: 'ModelB',
      properties: [
        'id',
        {
          name: 'count',
          type: 'Int',
        },
        {
          name: 'someField',
          type: 'String'
        }
      ]
    },
  ],
  methods: [
    function initE() {
      this.start('div')
        .x({ data$: this.obja$ })
        .add(this.ModelA.getRuntimeProperties().filter(function(p) { return ! p.hidden; }))
        .end()
        .start('div')
        .x({ data$: this.objb$ })
        .add(this.ModelB.getRuntimeProperties().filter(function(p) { return ! p.hidden; }))
        .end()
        .start('div')
        .x({ data: this.replicator })
        .add(this.replicator.SAVING)
        .add(this.replicator.SAVE)
        .end()
    }
  ]
});
