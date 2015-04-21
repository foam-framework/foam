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

var timer =  Timer.create({interval:16});
CLASS({
  name: 'FOAMComponents',
  package: 'foam.demos',

  extendsModel: 'foam.ui.View',

  exports: ['masterModelList'],

  requires: [
    'System',
    'foam.ui.HelpView',
    'foam.ui.DetailView',
    'foam.ui.TableView',
    'SimpleValue',
    'foam.ui.SummaryView',
    'foam.ui.StackView',
    'foam.documentation.diagram.DocDiagramView'
  ],

  properties: [
    {
      name: 'models',
      lazyFactory: function() {
       return [
          'models',
          'Properties',
          'Actions',
          'Methods',
          'Listeners',
          'Templates',
          'Unit Tests',
          'Issues',
          'Timer',
          'Mouse',
          'EyeCView',
          'EyesCView',
          'ClockView',
          'Graph',
          'System',
          'Developer',
          'Canvas',
          'Circle',
          'Rect',
          'Box',
          'Label',
          'PowerInfo',
          'Backlite',
          'DAOController',
          'StackView',
//           'NeedleMeter',
//           'BatteryMeter',
//           'BatteryGraph'
        ];
      }
    },
    {
      name: 'sys',
      lazyFactory: function() {
        return System.create({
          parent: this.space,
          title: 'FOAM',
          numDev: 2,
          devColor: 'red',
          features: [
            'Help',
            'Detail',
            'Table',
            'Summary',
            'XML',
            'JSON',
            'JS Proto',
            'Java Src.',
            'Dart Src.',
            'Actions',
            'Local DAO',
            'Trans. DAO',
            'UML',
            'Controller',
            'JavaDoc'
            /*
              'Sort',
              'Search',
              'Paging',
              'Printing',
              'SQL',
              'PDF',
              'ProtoBuf',
              'C++'
            */
          ],
          entities: this.models,
        });
      }
    },
    {
      name: 'modelInstances',
      factory: function() {
        var instances = [
          Screen,
//           Power,
//           NeedleMeter,
//           BatteryMeter,
//           BatteryGraph,
        ];
        [
          'Model',
          'Property',
          'Action',
          'Method',
          'Method',
          'Template',
          'UnitTest',
          'Issue',
          'Timer',
          'foam.input.Mouse',
          'foam.demos.graphics.EyeCView',
          'foam.demos.graphics.EyesCView',
          'foam.demos.ClockView',
          'Graph',
          'System',
          'Developer',
          'Canvas',
          'foam.graphics.Circle',
          'foam.graphics.Rectangle',
          'foam.graphics.Box',
          'foam.graphics.Label',
          'foam.ui.DAOController',
          'foam.ui.StackView',
        ].forEach(function(name) {
          arequire(name)(function(m) {
            if ( m ) instances.push(m)
          });
        });
        return instances;
      }
    },
//     {
//       name: 'timer',
//       factory: function() { return Timer.create({interval:16}); }
//     },
    {
      name: 'space',
      factory: function() {
        return Canvas.create({width: 1000, height: 800, background:'#fff'});
      }
    },
    {
      name: 'masterModelList',
      lazyFactory: function() {
        var list = [];
        [ USED_MODELS, UNUSED_MODELS, NONMODEL_INSTANCES ].forEach(function (collection) {
          for ( var key in collection ) {
            list.push(this.X.lookup(key));
          };
        }.bind(this));
        return list;
      }
    },
  ],

  methods: {
    init: function() {
      timer.start();
    },

    foam: function(system, dev) {
      var r = Math.random();
      var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
      var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

      if ( dev.f === undefined ) {
        dev.f = nx;
        dev.e = ny;
      }

      randomAct(
        10, function() {
          system.moveDev(dev, nx, ny);
        },
        5, function() {
          system.moveDev(dev, dev.f, dev.e);
        },
        50, function() {
          system.moveDev(dev, 0, ny);
        },
        50, function() {
          system.moveDev(dev, nx, 0);
        });

      system.addCode(dev.f, dev.e, 1);
    },
    protoToString: function(proto) {
      var buf = [];
      for ( var key in proto) {
        try {
          buf.push(key, ':', proto[key.toUpperCase()]);
          buf.push('\n');
        } catch(x) { }
      }
      return buf.join('');
    },
    setDisplay: function(txt) {
      $('display').innerHTML = txt;
    },
    initHTML: function() {
      this.SUPER();

      this.sys.architecture = this.foam;
      Events.dynamic(
        function () {
          //timer.second;
          timer.time;
        }.bind(this),
        function () {
          this.sys.tick(timer);
          this.space.paint();
        }.bind(this)
      );

      Events.dynamic(
        function() {
          console.log(this.sys.selectedX, this.sys.selectedY);
        }.bind(this),
        this.update
      );
    }
  },

  templates: [
    function toHTML() {/*
      <table><tr><td valign=top>

      %%space


      <td><td valign=top>
      <div id="display"></div>
      </td><tr></table>
    */}
  ],

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( this.sys.selectedY < 1 || this.sys.selectedX < 0 ) return;

        var model = this.modelInstances[this.sys.selectedY-1];
        var obj = null;
        try {
          obj = model.create();
          for ( var key in model.properties ) {
            var prop = model.properties[key];
            obj.instance_[prop.name] = obj[prop.name];
          }
        } catch(x) { }
        var arr = [obj];
        var value = SimpleValue.create(obj);
        console.log("Model: ", model.name);

        switch ( this.sys.selectedX ) {
        case 0:
          this.setDisplay('<pre>' + model.toJSON() + '</pre>');
          break;
        case 1: this.setDisplay(this.HelpView.create({model: model}).toHTML()); break;
        case 2: var dv = this.DetailView.create({model: model, value: value}); this.setDisplay(dv.toHTML()); dv.initHTML(); break;
        case 3: this.setDisplay(this.TableView.create({model: model, value: SimpleValue.create(arr)}).toHTML()); break;
        case 4: this.setDisplay(this.SummaryView.create({model: model, value: value}).toHTML()); break;
        case 5: this.setDisplay("<textarea rows=100 cols=80>" + obj.toXML() + "</textarea>"); break;
        case 6: this.setDisplay("<pre>" + obj.toJSON() + "</pre>"); break;
        case 7: this.setDisplay("<textarea rows=100 cols=80>" + this.protoToString(model.getPrototype()) + '</textarea>'); break;
        case 8: this.setDisplay('<pre>' + 'Coming soon!' + '</pre>'); break;
        case 9: this.setDisplay('<pre>' +'Coming soon!' + '</pre>'); break;
        case 10: this.setDisplay(JSONUtil.stringify(model.actions)); break;
        case 11:
          var dao = GLOBAL[model.plural] || GLOBAL[model.name + 'DAO'];
          if ( dao ) dao.select()(function(a) {
            this.setDisplay('<pre>' + JSONUtil.stringify(a) + '</pre>');
          });
          break;
        case 12: this.setDisplay(); break;
        case 13:
          var dv = this.DocDiagramView.create({ data: model });
          this.setDisplay(dv.toHTML());
          dv.initHTML();
          break;
        case 14:
          GLOBAL.stack = this.StackView.create();
          this.setDisplay(stack.toHTML());
          stack.initHTML();

          FOAM.browse(model);
          //this.setDisplay();
          break;
        case 15:
          var dv = this.DetailView.create({model: Model, value: SimpleValue.create(model)}); this.setDisplay(dv.toHTML() ); dv.initHTML();
          break;
        }
      }
    }

  ]
  //////////////////////////////////////////////////
});
