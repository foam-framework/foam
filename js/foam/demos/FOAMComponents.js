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

  exports: ['masterModelList', '_DEV_ModelDAO'],

  requires: [
    'System',
    'foam.ui.HelpView',
    'foam.ui.DetailView',
//    'foam.ui.md.DetailView as MDDetailView',
    'foam.ui.TableView',
    'SimpleValue',
    'foam.ui.SummaryView',
    'foam.ui.StackView',
    'foam.documentation.diagram.DocDiagramView',
    'MDAO',
    'foam.dao.FindFallbackDAO',
    'foam.documentation.DocViewPicker',
  ],

  properties: [
    {
      name: 'features',
      lazyFactory: function() {
        return [
          { name: 'Help',
            f: function(model, obj, arr, value) { this.setDisplay(this.HelpView.create({model: model}).toHTML()); }
          },
          { name: 'Detail',
            f: function(model, obj, arr, value) { var dv = this.DetailView.create({model: model, data: obj}); this.setDisplay(dv.toHTML()); dv.initHTML(); }
          },
// Also uncomment requires
//           { name: 'MD Detail',
//             f: function(model, obj, arr, value) { var dv = this.MDDetailView.create({model: model, data: obj}); this.setDisplay(dv.toHTML()); dv.initHTML(); }
//           },
          { name: 'Table',
            f: function(model, obj, arr, value) { this.setDisplay(this.TableView.create({model: model, value: SimpleValue.create(arr)}).toHTML());  }
          },
          { name: 'Summary',
            f: function(model, obj, arr, value) { this.setDisplay(this.SummaryView.create({model: model, value: value}).toHTML());  }
          },
          { name: 'XML',
            f: function(model, obj, arr, value) { this.setDisplay("<textarea rows=100 cols=80>" + obj.toXML() + "</textarea>"); }
          },
          { name: 'JSON',
            f: function(model, obj, arr, value) { this.setDisplay('<pre>' + model.toJSON() + '</pre>'); }
          },
//           { name: 'JS Proto',
//             f: function(model, obj, arr, value) { this.setDisplay("<pre>" + this.protoToString(model.getPrototype()) + '</pre>'); }
//           },
          { name: 'Java Src.',
            f: function(model, obj, arr, value) { this.setDisplay('<pre>' + 'Coming soon!' + '</pre>'); }
          },
          { name: 'Dart Src.',
            f: function(model, obj, arr, value) { this.setDisplay('<pre>' + 'Coming soon!' + '</pre>');  }
          },
          { name: 'Actions',
            f: function(model, obj, arr, value) { this.setDisplay('<textarea rows=100 cols=80>' + JSONUtil.stringify(model.actions) + '</textarea>'); }
          },
//           { name: 'Local DAO',
//             f: function(model, obj, arr, value) {
//               var dao = GLOBAL[model.plural] || GLOBAL[model.name + 'DAO'];
//               if ( dao ) dao.select()(function(a) {
//                 this.setDisplay('<pre>' + JSONUtil.stringify(a) + '</pre>');
//               });
//             }
//           },
//           { name: 'Trans. DAO',
//             f: function(model, obj, arr, value) {  }
//           },
          { name: 'UML',
            f: function(model, obj, arr, value) {
              var dv = this.DocDiagramView.create({ data: model });
              this.setDisplay(dv.toHTML());
              dv.initHTML();
            }
          },
          { name: 'Controller',
            f: function(model, obj, arr, value) {
              GLOBAL.stack = this.StackView.create();
              this.setDisplay(stack.toHTML());
              stack.initHTML();
              FOAM.browse(model);
            }
          },
          { name: 'Documentation',
            f: function(model, obj, arr, value) {
              //var dv = this.DetailView.create({model: Model, value: SimpleValue.create(model)}); this.setDisplay(dv.toHTML() ); dv.initHTML();
              var dv = this.DocViewPicker.create({ data: model });
              this.setDisplay(dv.toHTML());
              dv.initHTML();
            }
          },
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
        ];
      }
    },
    {
      name: 'featureLabels',
      lazyFactory: function() {
        var list = [];
        this.features.forEach(function(f) {
          list.push(f.name);
        }.bind(this));
        return list;
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
          features: this.featureLabels,
          entities: this.entityNames,
        });
      }
    },
    {
      name: 'entities',
      lazyFactory: function() {
       var ents = [
          { name: 'models', model: 'Model', instance: null },
          { name: 'Properties', model: 'Property', instance: null },
          { name: 'Actions', model: 'Action', instance: null },
          { name: 'Methods', model: 'Method', instance: null },
          { name: 'Listeners', model: 'Method', instance: null },
          { name: 'Templates', model: 'Template', instance: null },
          { name: 'Unit Tests', model: 'UnitTest', instance: null },
          { name: 'Issues', model: 'Issue', instance: null },
          { name: 'Timer', model: 'Timer', instance: null },
          { name: 'Mouse', model: 'foam.input.Mouse', instance: null },
          { name: 'EyeCView', model: 'foam.demos.graphics.EyeCView', instance: null },
          { name: 'EyesCView', model: 'foam.demos.graphics.EyesCView', instance: null },
          { name: 'ClockView', model: 'foam.demos.ClockView', instance: null },
          { name: 'Graph', model: 'Graph', instance: null },
          { name: 'System', model: 'System', instance: null },
          { name: 'Developer', model:  'Developer', instance: null },
          { name: 'Canvas', model: 'foam.graphics.CView', instance: null },
          { name: 'Circle', model: 'foam.graphics.Circle', instance: null },
          { name: 'Rect', model:  'foam.graphics.Rectangle', instance: null },
          { name: 'Box', model: 'foam.graphics.Box', instance: null },
          { name: 'Label', model: 'foam.graphics.Label', instance: null },
          { name: 'DAOController', model: 'foam.ui.DAOController', instance: null },
          { name: 'StackView', model: 'foam.ui.StackView', instance: null },
        ];
        ents.forEach(function(ent) {
          arequire(ent.model)(function(m) {
            if ( m ) ent.instance = m;
          });
        });
        return ents;
      }
    },
    {
      name: 'entityNames',
      lazyFactory: function() {
       var list = [];
        this.entities.forEach(function(f) {
          list.push(f.name);
        }.bind(this));
        return list;
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
        var list = this.MDAO.create({model:Model, autoIndex:true});
        [ USED_MODELS, UNUSED_MODELS, NONMODEL_INSTANCES ].forEach(function (collection) {
          for ( var key in collection ) {
            list.put(this.X.lookup(key));
          };
        }.bind(this));
        return list;
      }
    },
    {
      name: '_DEV_ModelDAO',
      lazyFactory: function() {
        return this.FindFallbackDAO.create({delegate: this.masterModelList, fallback: this.X.ModelDAO});
      }
    }
  ],

  methods: {
    init: function() {
      timer.start();

      this.Y.documentViewRequestNavigation = function(newRef) {
        window.location = 'http://localhost:8000/apps/docs/docbrowser.html#'+newRef.resolvedRef;
      }.bind(this);
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
        if ( this.sys.selectedY < 1 || this.sys.selectedX < 1 ) return;

        var model = this.entities[this.sys.selectedY-1].instance;
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

        this.features[this.sys.selectedX-1].f.call(this, model, obj, arr, value);
      }
    }

  ]
  //////////////////////////////////////////////////
});
