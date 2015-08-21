/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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
  package: 'foam.documentation',
  name: 'DocBrowserController',

  requires: [
    'MDAO',
    'foam.documentation.DocBrowserView',
    'foam.documentation.ControllerView',
    'foam.documentation.ModelListController',
    'foam.documentation.DocViewPicker',
    'foam.documentation.ModelCompletenessRecord',
    'foam.input.touch.TouchManager',
    'foam.input.touch.GestureManager',
    'foam.dao.FindFallbackDAO',
    'foam.documentation.DocumentationBook'
//    'foam.core.bootstrap.ModelFileDAO'
  ],

  documentation: function() {  /*
    <p>Some documentation for the $$DOC{ref:'.'} model.</p>
    <p>This should be expaneded to explain some of the interesting properties found here, such as $$DOC{ref:'.modelList'}.</p>
    <p>We can also mention how invalid references are caught $$DOC{ref:'modelList'}.</p>
    <p>And here's a normal property view in the same template: $$data{ mode: 'read-only' }</p>
    <p>Though you'd often want to link to related models, like $$DOC{ref:'DocModelBodyView'}, or even specific features on them, like $$DOC{ref:'DocModelView.data', text:'DocModelView&apos;s data property'}.</p>
    <p>Reference to a method argument: $$DOC{ref:'DocBrowserController.testMethod.args.testy'}</p>
    <p>This won't work since 'properties' here will resolve to the DocBrowserController.PROPERTIES feature: $$DOC{ref:'DocBrowserController.properties.modelListView'}. Only use direct access for layers below Model.feature.</p>
    <p>Linking to a $$DOC{ref:'Model'} property value of a $$DOC{ref:'Model'} (rather than a feature): $$DOC{ref:'DocBrowserController'} </p>
  */},

  models: [
    {
      model_: 'Model',
      name: 'NamedInnerModel',
      documentation: function() { /* Docs for named inner model. $$DOC{ref:"."} */ },
      models: [
        {
          model_: 'Model',
          name: 'InnyInner',
          documentation: function() { /* Inny Inner! $$DOC{ref:"."} */ },
        }
      ]

    },
//    {
//      model_: 'Model',

//    }
  ],

  methods: {
    contextSetup: function() {
      // factories below will trigger this before init()
      /* This is a method documentation comment: spawn and populate sub contexts. */

      if (this.SearchContext) return; // don't run twice

      // begin loading all models
      this.createModelList();

      // search context uses a selection value to indicate the chosen Model to display
      this.SearchContext = this.Y.sub({}, 'searchX');
      this.SearchContext.selection$ = this.SearchContext.SimpleValue.create(); // holds a Model definition

      // detail context needs a documentViewRef.get().resolvedRoot to indicate what model it is rooted at
      this.DetailContext = this.Y.sub({}, 'detailX');
      this.DetailContext.documentViewRef = this.DetailContext.SimpleValue.create({},this.DetailContext);// this.DetailContext.DocRef.create();

      this.X.documentViewRequestNavigation = this.requestNavigation.bind(this);

    },

    init: function() {

      this.SUPER();
      /////////////////////////// this.init v

      // when the hash changes set the documentViewRef and this.selection
      window.addEventListener('hashchange', this.setReferenceFromHash.bind(this));

      // initialization from hash
      this.setReferenceFromHash();

      var testArg = this.X.Arg.create({name: 'testy'}, this.X);
      testArg.documentation = this.X.Documentation.create({
        body: function() { /*
          Argument $$DOC{ref:'.'} documentation.
          */ }
      }, this.X);
      this.model_.methods[1].args.push(testArg);
    },

    testMethod: function(a1, b2) {
      return a1 + b2;
    },

    setReferenceFromHash: function() {
      if (location.hash === '#' || location.hash === '#undefined' || location.hash.length === 0) {
        location.hash = 'developerDocs.Welcome';
        return;
      }
      // don't respond if we are already at the location desired
      if (location.hash.substring(1) === this.DetailContext.documentViewRef.get().ref) return;

      var newRef = this.DetailContext.foam.documentation.DocRef.create({ref:location.hash.substring(1)}, this.DetailContext);
      var setRef = function(ignoreListener) {
        if ( ! ignoreListener) newRef.removeListener(setRef);
        this.DetailContext.documentViewRef.set(newRef);
        if (newRef.resolvedObject !== this.selection) this.selection = newRef.resolvedRoot;
        this.SearchContext.selection$.set(newRef.resolvedRoot); // selection wants a Model object
      }.bind(this);
      if (newRef.valid) {// need to listen for when this becomes valid
        setRef(true);
      } else {
        newRef.addListener(setRef);
//         // attempt to immediately load the referenced model name
//         this.DetailContext.ModelDAO.find(location.hash.substring(1), {
//           put: function(m) {
//             //this.DetailContext._DEV_ModelDAO.put(m);
//             var newRef = this.DetailContext.foam.documentation.DocRef.create({ref:m.id}, this.DetailContext);
//             if (newRef.valid) {
//               setRef(newRef); // not fully recursive as we only want to try loading once
//             }
//           }.bind(this)
//         });
      }
    },

    requestNavigation: function(newRef) {
      var setRef = function(ignoreListener) {
        if ( ! ignoreListener) newRef.removeListener(setRef);
        this.DetailContext.documentViewRef.set(newRef);
        this.SearchContext.selection$.set(newRef.resolvedRoot); // selection wants a Model object
        if (newRef.resolvedObject !== this.selection) this.selection = newRef.resolvedRoot;
        location.hash = "#" + newRef.resolvedRef;
      }.bind(this);
      if (newRef.valid) {// need to listen for when this becomes valid
        setRef(true);
      } else {
        newRef.addListener(setRef);
        // // attempt to immediately load the referenced model name (but DocRef will do this anyway!)
        // this.DetailContext.ModelDAO.find(newRef.ref, {
        //   put: function(m) {
        //     //this.DetailContext._DEV_ModelDAO.put(m);
        //     var newRef = this.DetailContext.foam.documentation.DocRef.create({ref:m.id}, this.DetailContext);
        //     if (newRef.valid) {
        //       setRef(newRef); // not fully recursive as we only want to try loading once
        //     }
        //   }.bind(this)
        // });
      }
    },

    scrapeDirectory: function(dir, pkg, sink, dao) {
      var request = new XMLHttpRequest();
      request.open("GET", dir);
      request.addEventListener("readystatechange", function(e) {
        if (request.readyState === 4) {
          // abort on failure
          if ( request.status !== 200 ) return;

          // find javascript files
          var fre = /.*?(?:href=\")(.*?).js\".*?/gmi;
          fre.sticky = true;
          var files = [];
          var fmatch;
          do {
            if ( fmatch = fre.exec(request.response) ) files.push(fmatch[1]);
          } while ( fmatch );
          files.forEach(function(d) {
            //find(pkg ? pkg+"."+d : d, sink);
            //console.log("areqX ", this.X.NAME);
            dao.find(pkg ? pkg+"."+d : d, sink);
          }.bind(this));

          // find subdirectories
          var re = /.*?(?:href=\")(.*?)\/\".*?/gm;
          re.sticky = true;
          var dirs = [];
          var match;
          do {
            if ( match = re.exec(request.response) ) dirs.push(match[1]);
          } while ( match );
          dirs.forEach(function(d) {
            this.scrapeDirectory(dir + '/' + d, pkg ? pkg+"."+d : d, sink, dao);
          }.bind(this));
        }
      }.bind(this));
      request.send();
    },


    createModelList: function() {
      var newDAO = this.MDAO.create({model:Model, autoIndex:true});
      this.Y.set("masterModelList", newDAO);
      this.Y.set("_DEV_ModelDAO",
//         this.LazyCacheDAO.create({
//           cache: newDAO,
//           delegate: this.X.ModelDAO,
//           staleTimeout: 40000,
//           selectKey: ""
//         })
          this.FindFallbackDAO.create({delegate: newDAO, fallback: this.X.ModelDAO})
        );

      // loading all models eats CPU, so wait until we've had time to
      // render and load the references of the first model showing
      this.Y.setTimeout(function() {
          var sourcePath = window.FOAM_BOOT_DIR + '../js';
          this.scrapeDirectory(sourcePath, "", newDAO, this.Y._DEV_ModelDAO);
      }.bind(this), 5000);

      newDAO.put(Model.create({ name: 'String', documentation: "Primitive type." }));
      newDAO.put(Model.create({ name: 'Int', documentation: "Primitive type." }));
      newDAO.put(Model.create({ name: 'Boolean', documentation: "Primitive type." }));
      newDAO.put(Model.create({ name: 'Array', documentation: "Primitive type." }));

      // All models are now in USED_MODELS
      [ USED_MODELS, UNUSED_MODELS, NONMODEL_INSTANCES ].forEach(function (collection) {
        for ( var key in collection ) {
          // go async: as the requires complete, newDAO will fill in
          newDAO.put(this.X.lookup(key));
        };
      }.bind(this));

//       // Add in non-model things like Interfaces
//       for ( var key in NONMODEL_INSTANCES ) {
//         var m = FOAM.lookup(key, this.X);
//         newDAO.put(m);
//       };

      // load developer guides
      this.X.RegisterDevDocs && this.X.RegisterDevDocs(this.X);

      // load up books
       for (var key in this.X.developerDocs) {
         newDAO.put(this.X.developerDocs[key]);
       }

      //this.generateCompletnessReport(newDAO);

    },

    generateCompletnessReport: function(models) {
      var modelList = [];
      models.select(modelList);

      var reports = [];
      var totalUndoc = 0;
      var totalDoc = 0;
      var incomplete = 0;
      var complete = 0;
      var featuresTotal = 0;
      var featuresComplete = 0;

      for (var i = 0; i < modelList.length; i++) {
        var m = modelList[i];
        if (Model.isInstance(m)) {
          var report = this.ModelCompletenessRecord.create({model: m});

          if (m.documentation) {
            report.documented = true;
            totalDoc += 1;
          } else {
            //console.log("nodoc: ", m);
            totalUndoc += 1;
          }

          var features = m.getAllMyFeatures();
          if (features) features.forEach(function(feature) {
            // ignore hidden properties and methods ending in _
            if (!(
                  feature.hidden ||
                  (feature.name && feature.name.indexOf("_", feature.name.length - 1) !== -1)
               ))
            {
              if (m.documentation) featuresTotal += 1;
              if (feature.documentation) {
                report.documentedFeatureCount += 1;
                if (m.documentation) featuresComplete += 1;
              } else {
                report.undocumentedFeatureCount += 1;
                report.undocumentedFeatures.push(feature);
              }
            }
          }.bind(this));

          if (report.undocumentedFeatureCount > 0) {
            incomplete += 1;
          } else {
            complete += 1;
          }

          reports.push(report);
        }
      }

      console.log("Documentation Report ======================");
      console.log("Documented:   "+totalDoc);
      console.log("Undocumented: "+totalUndoc);
      console.log("Models with Features complete: "+complete);
      console.log("Models with Features missing:  "+incomplete);
      console.log("Features complete: "+featuresComplete);
      console.log("Features total:  "+featuresTotal);

      var criteria = [
        {
          name: 'Documented but incomplete',
          f: function(r) { return r.documented && r.undocumentedFeatureCount > 0; }
        },
        {
          name: 'Documented but less than 80% complete',
          f: function(r) {
            return r.documented &&
              r.documentedFeatureCount /
                (r.undocumentedFeatureCount+r.documentedFeatureCount) < 0.8;
          }
        },
        {
          name: 'Not Documented',
          f: function(r) { return !r.documented; }
        },
        {
          name: 'Documented and complete',
          f: function(r) { return r.documented && r.undocumentedFeatureCount <= 0; }
        },
      ];

      criteria.forEach(function(c) {
        console.log("=====================");
        console.log(c.name);
        var matchingCount = 0;
        for (var i = 0; i < reports.length; i++) {
          var r = reports[i];
          // log interesting ones
          if (c.f(r)) {
            matchingCount += 1;
            console.log("---------------------");
            console.log("Model "+r.model.id);
            console.log("Documentation " + (r.documented? "OK" : "NO"));
            if  ((r.undocumentedFeatureCount+r.documentedFeatureCount) > 0) {
              console.log("Features: " + (r.undocumentedFeatureCount > 0? "INCOMPLETE":"OK"));
              console.log("        : " + r.documentedFeatureCount / (r.undocumentedFeatureCount+r.documentedFeatureCount) * 100 + "%");
              if (r.undocumentedFeatureCount > 0) {
                r.undocumentedFeatures.forEach(function(f) {
                    console.log("      Missing feature docs: "+f.name);
                });
              }
            }
          }
        }
        console.log("---- total "+c.name+" "+matchingCount);
      }.bind(this));

    }

  },

  listeners: [
    {
      name: 'onReadyToScroll',
      code: function(evt) {

      }
    }
  ],

  properties: [
    {
      name: 'selection',
    },
    {
      name: 'modelList',
      factory: function() {
        this.contextSetup();
        return this.ModelListController.create({}, this.SearchContext);
      }
    },
    {
      name: 'modelListView',
      factory: function() {
        this.contextSetup();
        return this.ControllerView.create({ model: this.ModelListController,
                                                          data$: this.modelList$ }, this.SearchContext);
      }
    },
    {
      name: 'selectionView',
      factory: function() {
        this.contextSetup();
        return this.DocViewPicker.create({ data$: this.selection$ }, this.DetailContext);
      }
    },
  ]

});

