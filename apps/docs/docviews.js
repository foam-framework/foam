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
  name: 'DocView',
  package: 'foam.documentation',
  extendsModel: 'View',
  label: 'Documentation View Base',
  help: 'Base Model for documentation views.',

  documentation: function() {/*
    <p>Underlying the other documentation views, $$DOC{ref:'.'} provides the ability
    to specify $$DOC{ref:'foam.documentation.DocRef', text:"$$DOC{ref:'MyModel.myFeature'}"} tags in your
    documentation templates, creating child $$DOC{ref:foam.documentation.DocRefView'} views and $$DOC{ref:'foam.documentation.DocRef'}
    references.</p>
    <p>In addition, the $$DOC{ref:'.', text:"$$THISDATA{}"} tag allows your template to
    pass on its data directly, rather than a property of that data.</p>
    <p>Views that wish to use DOC reference tags should extend this model. To display the
    $$DOC{ref:'Model.documentation'} of a model, use a $$DOC{ref:'DocModelView'} or
    $$DOC{ref:'DocBodyView'}.</p>
    <p>Documentation views require that a this.X.documentViewRef $$DOC{ref:'SimpleValue'}
    be present on the context. The supplied model is used as the base for resolving documentation
    references. If you are viewing the documentation for a Model, it will be a
    reference to that Model.</p>
    <p>See $$DOC{ref:'DocumentationBook'} for information on creating documentaion
    that is not directly associated with a $$DOC{ref:'Model'}.</p>
  */},

  methods: {
    init: function() { /* <p>Warns if this.X.documentViewRef is missing.</p>
      */
      this.SUPER();
      if (!this.X.documentViewRef) {
        console.warn("*** Warning: DocView ",this," can't find documentViewRef in its context "+this.X.NAME);
      }
    },

    createReferenceView: function(opt_args) { /*
      <p>Creates $$DOC{ref:'foam.documentation.DocRefView'} reference views from $$DOC{ref:'.',text:'$$DOC'}
          tags in documentation templates.</p>
      */
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X.foam.documentation.DocRefView.create(opt_args);
      this.addChild(v);
      return v;
    },

    createExplicitView: function(opt_args) { /*
      <p>Creates subviews from the $$DOC{ref:'.',text:'$$THISDATA'} tag, using
        an explicitly defined "model_: $$DOC{ref:'Model.name'}" in opt_args.</p>
      */
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X[opt_args.model_].create( opt_args ); // we only support model_ in explicit mode
      if (!opt_args.data) { // explicit data is honored
        if (this.data) { // TODO: when refactoring $$THISDATA below, figure out what we can assume about this.data being present
          v.data = this.data;
        } else {
          v.data = this; // TODO: correct assumption? do we want data set to this?
        }
      } else {
        v.data = opt_args.data;
      }
      this.addChild(v);
      return v;
    },

    createTemplateView: function(name, opt_args) {
      /*
        Overridden to add support for the $$DOC{ref:'.',text:'$$DOC'} and
        $$DOC{ref:'.',text:'$$THISDATA'} tags.
      */
      // name has been constantized ('PROP_NAME'), but we're
      // only looking for certain doc tags anyway.
      if (name === 'DOC') {
        var v = this.createReferenceView(opt_args);
        return v;
      } else if (name === 'THISDATA') { // TODO: refactor this into view.js, as it is very similar to the normal case
        return this.createExplicitView(opt_args);
      } else {
        return this.SUPER(name, opt_args);
      }
    }
  }

});


CLASS({
  name: 'FullPageDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocView',
  label: 'Documentation View Full Page',
  help: 'Base Model for full page documentation views.',

  documentation: function() {/*
    For full-page views, typically including full lists of all features,
    subclass $$DOC{ref:'foam.documentation.FullPageDocView'}.</p>
    <p>Name your subclass with the name of the type you support:</p>
    <p><code>
    CLASS({ <br/>
    &nbsp;&nbsp;  name: 'PropertyFullPageDocView',<br/>
    &nbsp;&nbsp;  extendsModel: 'FullPageDocView'<br/>
    });<br/>
    // automatically creates PropertyFullPageDocView<br/>
    FullPageDocView.create({model:X.Property});<br/>
    </code></p>
  */}

});

CLASS({
  name: 'SummaryDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocView',
  label: 'Documentation View Summary',
  help: 'Base Model for medium length summary documentation views.',

  documentation: function() {/*
    For inline summaries, typically including properties but not full
    feature lists, subclass $$DOC{ref:'foam.documentation.SummaryDocView'}.</p>
    <p>Name your subclass with the name of the type you support:</p>
    <p><code>
    CLASS({ <br/>
    &nbsp;&nbsp;  name: 'MethodSummaryDocView',<br/>
    &nbsp;&nbsp;  extendsModel: 'SummaryDocView'<br/>
    });<br/>
    // automatically creates MethodSummaryDocView<br/>
    SummaryDocView.create({model:X.Method});<br/>
    </code></p>
  */}

});

CLASS({
  name: 'RowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocView',
  label: 'Documentation View Row',
  help: 'Base Model for one or two line documentation row views.',

  documentation: function() {/*
    For one or two line row views, only including essential information,
    subclass $$DOC{ref:'foam.documentation.RowDocView'}.</p>
    <p>Name your subclass with the name of the type you support:</p>
    <p><code>
    CLASS({ <br/>
    &nbsp;&nbsp;  name: 'ListenerRowDocView',<br/>
    &nbsp;&nbsp;  extendsModel: 'RowDocView'<br/>
    });<br/>
    // automatically creates ListenerRowDocView<br/>
    RowDocView.create({model:X.Listener});<br/>
    </code></p>
  */}

});


CLASS({
  name: 'DocModelInheritanceTracker',
  package: 'foam.documentation',
  help: 'Stores inheritance information for a Model',
  documentation: function() { /*
      <p>Stores inheritance information for a $$DOC{ref:'Model'}. One
      instance per extending $$DOC{ref:'Model'} is stored in the
      this.featureDAO (starting with the data of
      $$DOC{ref:'DocModelView'}, and following the .extendsModel chain.
      </p>
      <p>See $$DOC{ref:'DocModelView'}.
      </p>
  */},

  properties: [
    {
      name: 'inheritanceLevel',
      help: 'The inheritance level of model.',
      documentation: "The inheritance level of $$DOC{ref:'.model'} (0 = root, no extendsModel specified)",
      defaultValue: 0
    },
    {
      name: 'model',
      help: 'The model name.',
      documentation: "The $$DOC{ref:'Model'} name."
    },
  ]
});

CLASS({
  name: 'DocFeatureInheritanceTracker',
  package: 'foam.documentation',
  help: 'Stores inheritance information for a feature of a Model',
  documentation: function() { /*
      <p>Stores inheritance information for a feature of a $$DOC{ref:'Model'}
          in the this.featureDAO.
      </p>
      <p>See $$DOC{ref:'DocModelView'}.
      </p>
  */},

  ids: [ 'primaryKey' ],

  properties: [
    {
      name: 'name',
      help: 'The feature name.',
      documentation: "The feature name. This could be a $$DOC{ref:'Method'}, $$DOC{ref:'Property'}, or other feature. Feature names are assumed to be unique within the containing $$DOC{ref:'Model'}.",
      defaultValue: "",
      postSet: function() {
        this.primaryKey = this.model + ":::" + this.name;
      }
    },
    {
      name: 'isDeclared',
      help: 'Indicates that the feature is declared in the containing Model.',
      documentation: "Indicates that the feature is declared in the containing $$DOC{ref:'Model'}.",
      defaultValue: false
    },
    {
      name: 'type',
      help: 'The type (Model name string) of the feature, such as Property or Method.',
      documentation: "The type ($$DOC{ref:'Model.name', text:'Model name'} string) of the feature, such as $$DOC{ref:'Property'} or $$DOC{ref:'Method'}."
    },
    {
      name: 'feature',
      help: 'A reference to the actual feature.',
      documentation: "A reference to the actual feature.",
      postSet: function() {
        this.name = this.feature.name;
      }
    },
    {
      name: 'model',
      help: 'The name of the Model to which the feature belongs.',
      documentation: "The name of the $$DOC{ref:'Model'} to which the feature belongs.",
      postSet: function() {
        this.primaryKey = this.model + ":::" + this.name;
      }
    },
    {
      name: 'primaryKey',
      defaultValue: ''
    },
    {
      name: 'inheritanceLevel',
      help: 'Helper to look up the inheritance level of model.',
      documentation: "Helper to look up the inheritance level of $$DOC{ref:'.model'}",
      getter: function() {
        var modelTracker = [];
        this.modelDAO.where(EQ(DocModelInheritanceTracker.MODEL, this.model))
            .select(modelTracker);
        this.instance_.inheritanceLevel = modelTracker[0];
        return this.instance_.inheritanceLevel;
      }
    }
  ],
  methods: {
    toString: function() {
      return this.model + ": " + this.name + ", " + this.isDeclared;
    }
  }
});

CLASS({
  name: 'ModelDocView',
  package: 'foam.documentation',
  extendsModel: 'DocView',
  help: 'Displays the documentation of the given Model.',

  requires: ['foam.documentation.DocFeatureInheritanceTracker',
             'foam.documentation.DocModelInheritanceTracker',
             'Model',
             'MDAO'],

  exports: ['featureDAO', 'modelDAO'],

  documentation: function() {/*
    Displays the documentation for a given $$DOC{ref:'Model'}. The viewer will
    destroy and re-generate sub-views when the $$DOC{ref:'.data'} changes.
  */},

  properties: [
    {
      name: 'data',
      help: 'The model for which to display documentation.',
      documentation: "The $$DOC{ref:'Model'} for which to display $$DOC{ref:'Documentation'}.",
      postSet: function() {
        if (this.data.model_.id !== 'Model') {
          console.warn("ModelDocView created with non-model instance: ", this.data.model.id, this.data);
        }
      }
    },
    {
      name: 'featureDAO',
      model_: 'DAOProperty',
      factory: function() {
        this.MDAO.create({model:this.DocFeatureInheritanceTracker, autoIndex:true});
      }
    },
    {
      name: 'modelDAO',
      model_: 'DAOProperty',
      factory: function() {
        this.MDAO.create({model:this.DocModelInheritanceTracker, autoIndex:true});
      }
    }

  ],


  methods: {

    processModelChange: function() {
      this.generateFeatureDAO();
      this.updateHTML();
    },

    initInnerHTML: function() {
      /* If a feature is present in the this.X.documentViewRef $$DOC{ref:'foam.documentation.DocRef'},
        scroll to that location on the page. Otherwise scroll to the top. */
      this.SUPER();
      
      this.scrollToFeature();
    },

    scrollToFeature: function() {
      var self = this;
      if (self.data && self.data.valid) {
        if (! // if we don't find an element to scroll to:
          self.data.resolvedModelChain.slice(1).reverse().some(function(feature) {
            if (feature && feature.name) {
              element = $("scrollTarget_"+feature.name);
              if (element) {
                element.scrollIntoView(true);
                return true;
              }
              else return false;
            }
          })
        ) {
          // if we didn't find an element to scroll, use main view
          if (self.$) self.$.scrollIntoView(true);
        }
      }
    },


    generateFeatureDAO: function() {
      /* Builds a feature DAO to sort out inheritance and overriding of
        $$DOC{ref:'Property',usePlural:true}, $$DOC{ref:'Method',usePlural:true},
        and other features. */
      this.featureDAO.removeAll();
      this.dataDAO.removeAll();

      // Run through the features in the Model definition in this.data,
      // and load them into the feature DAO. Passing [] assumes we don't
      // care about other models that extend this one. Finding such would
      // be a global search problem.
      this.loadFeaturesOfModel(this.data, []);

//      this.debugLogFeatureDAO();
    },
    loadFeaturesOfModel: function(model, previousExtenderTrackers) {
      /* <p>Recursively load features of this $$DOC{ref:'Model'} and
        $$DOC{ref:'Model',usePlural:true} it extends.</p>
        <p>Returns the inheritance level of model (0 = $$DOC{ref:'Model'}).
        </p>
        */
      var modelDef = model.definition_?  model.definition_: model;
      var self = this;
      var newModelTr = this.DocModelInheritanceTracker.create();
      newModelTr.model = model.id;

      this.Model.properties.forEach(function(modProp) {
        var modPropVal = modelDef[modProp.name];
        if (Array.isArray(modPropVal)) { // we only care to check inheritance on the array properties
          modPropVal.forEach(function(feature) {
            if (feature.name) { // only look at actual objects
              // all features we hit are declared (or overridden) in this model
              var featTr = self.DocFeatureInheritanceTracker.create({
                    isDeclared:true,
                    feature: feature,
                    model: newModelTr.model,
                    type: modProp.name });
              self.featureDAO.put(featTr);

              // for the models that extend this model, make sure they have
              // the feature too, if they didn't already have it declared (overridden).
              previousExtenderTrackers.forEach(function(extModelTr) {
                self.featureDAO
                      .where(EQ(self.DocFeatureInheritanceTracker.PRIMARY_KEY,
                                extModelTr.model+":::"+feature.name))
                      .select(COUNT())(function(c) {
                          if (c.count <= 0) {
                            var featTrExt = self.DocFeatureInheritanceTracker.create({
                                isDeclared: false,
                                feature: feature,
                                model: extModelTr.model,
                                type: modProp.name });
                            self.featureDAO.put(featTrExt);
                          }
                      });
              });
            }
          });
        }
      });
      // Check if we extend something. Use model instead of modelDef, in case we
      // have traits that injected themselves into our inheritance heirarchy.
      if (!model.extendsModel) {
        newModelTr.inheritanceLevel = 0;
      } else {
        // add the tracker we're building to the list, for updates from our base models
        previousExtenderTrackers.push(newModelTr);
        // inheritance level will bubble back up the stack once we know where the bottom is
        newModelTr.inheritanceLevel = 1 + this.loadFeaturesOfModel(
                          FOAM.lookup(model.extendsModel, X), previousExtenderTrackers);
      }

      // the tracker is now complete
      this.dataDAO.put(newModelTr);
      return newModelTr.inheritanceLevel;
    },

    debugLogFeatureDAO: function() {
      /* For debugging purposes, prints out the state of the FeatureDAO. */

      var features = [];
      console.log("Features DAO: ", this.featureDAO);
      this.featureDAO.select(features);
      console.log(features);

      var modelss = [];
      console.log("Model    DAO: ", this.dataDAO);
      this.dataDAO.select(modelss);
      console.log(modelss);
    }

  },
});

CLASS({
  name: 'ModelFullPageDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.FullPageDocView',
  help: 'A full-page documentation view for Model instances.',

  documentation: "A full-page documentation view for $$DOC{ref:'Model'} instances.",

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <div class="introduction">
          <h1><%=this.data.name%></h1>
          <div class="model-info-block">
<%        if (this.data.model_ && this.data.model_.id && this.data.model_.id != "Model") { %>
            <p class="important">Implements $$DOC{ref: this.data.model_.id }</p>
<%        } else { %>
            <p class="important">$$DOC{ref:'Model'} definition</p>
<%        } %>
<%        if (this.data.sourcePath) { %>
            <p class="note">Loaded from <a href='<%=this.data.sourcePath%>'><%=this.data.sourcePath%></a></p>
<%        } else { %>
            <p class="note">No source path available.</p>
<%        } %>
<%        if (this.data.package) { %>
            <p class="important">Package <%=this.data.package%></p>
<%        } %>
<%        if (this.data.extendsModel) { %>
            <p class="important">Extends $$DOC{ref: this.data.extendsModel }</p>
<%        } %>
          </div>
          $$data{ model_: 'DocModelBodyView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocInnerModelsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocPropertiesView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocMethodsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocActionsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocListenersView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocTemplatesView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocRelationshipsView' }
        </div>
        <div class="members">
          $$data{ model_: 'DocIssuesView' }
        </div>
<%    } %>
    */}
  ]

});
CLASS({
  name: 'ModelSummaryDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.SummaryDocView',
  help: 'A summary documentation view for Model instances.',

  documentation: "A summary documentation view for $$DOC{ref:'Model'} instances.",

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <div class="introduction">
          <h1><%=this.data.name%></h1>
          <div class="model-info-block">
<%        if (this.data.model_ && this.data.model_.id && this.data.model_.id != "Model") { %>
            <p class="important">Implements $$DOC{ref: this.data.model_.id }</p>
<%        } else { %>
            <p class="important">$$DOC{ref:'Model'} definition</p>
<%        } %>
<%        if (this.data.sourcePath) { %>
            <p class="note">Loaded from <a href='<%=this.data.sourcePath%>'><%=this.data.sourcePath%></a></p>
<%        } else { %>
            <p class="note">No source path available.</p>
<%        } %>
<%        if (this.data.package) { %>
            <p class="important">Package <%=this.data.package%></p>
<%        } %>
<%        if (this.data.extendsModel) { %>
            <p class="important">Extends $$DOC{ref: this.data.extendsModel }</p>
<%        } %>
          </div>
          $$model{ model_: 'DocModelBodyView' }
        </div>
<%    } %>
    */}
  ]

});

CLASS({
  name: 'ModelRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.RowDocView',
  help: 'A row documentation view for Model instances.',

  documentation: "A row documentation view for $$DOC{ref:'Model'} instances.",

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <p class="important"><%=this.data.id%></p>
<%    } %>
    */}
  ]

});

CLASS({
  name: 'DocumentationBookFullPageDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.FullPageDocView',
  help: 'Displays the documentation of the given book.',

  properties: [ 
    {
      name: 'data',
      help: 'The documentation to display.',
      postSet: function() {
        this.documentation = this.data;
      }
    },
    {
      name: 'documentation',
      help: 'The documentation to display.',
      postSet: function() {
        this.updateHTML();
      }
    }
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.documentation) {  %>
        <div id="scrollTarget_<%=this.documentation.name%>" class="introduction">
          <h2><%=this.documentation.label%></h2>
          $$THISDATA{ model_: 'DocModelBodyView', data: this }
        </div>
        <div class="chapters">
          $$THISDATA{ model_: 'DocChaptersView', data: this }
        </div>
<%    } %>
    */}
  ]

});

CLASS({
  name: 'DocumentationBookSummaryDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.SummaryDocView',
  help: 'Displays the documentation of the given book.',

  properties: [
    {
      name: 'data',
      help: 'The documentation to display.',
      postSet: function() {
        this.documentation = this.data;
      }
    },
    {
      name: 'documentation',
      help: 'The documentation to display.',
      postSet: function() {
        this.updateHTML();
      }
    }
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.documentation) {  %>
        <div id="scrollTarget_<%=this.documentation.name%>" class="introduction">
          <h2><%=this.documentation.label%></h2>
          $$THISDATA{ model_: 'DocModelBodyView', data: this }
        </div>
<%    } %>
    */}
  ]

});


CLASS({
  name: 'DocumentationBookRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.RowDocView',
  help: 'Displays the documentation of the given book.',

  properties: [
    {
      name: 'data',
      help: 'The documentation to display.',
      postSet: function() {
        this.documentation = this.data;
      }
    },
    {
      name: 'documentation',
      help: 'The documentation to display.',
      postSet: function() {
        this.updateHTML();
      }
    }
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.documentation) {  %>
        <div id="scrollTarget_<%=this.documentation.name%>" class="introduction">
          <h2><%=this.documentation.label%></h2>
        </div>
<%    } %>
    */}
  ]

});


CLASS({
  name: 'DocBodyView',
  extendsModel: 'DocView',
  label: 'Documentation Body View Base',
  help: 'Base Model for documentation body-text views.',

  properties: [
    {
      name: 'data',
      help: 'The model or feature from which to extract documentation.',
      required: true,
      preSet: function(old, nu) {
        if (old && Documentation.isInstance(old.documentation)) {
          Events.unfollow(old.documentation$, this.docSource$);
        }
        return nu;
      },
      postSet: function() {
        // grab the documentation and compile a template to use in this view
        if (this.data && Documentation.isInstance(this.data.documentation)) {
          // bind docSource
          Events.follow(this.data.documentation$, this.docSource$);
        }
      }
    },
    {
      name: 'docSource',
      type: 'Documentation',
      help: 'The documentation object to render.',
      postSet: function() {
        this.updateHTML();
      }
    },
  ],
  methods: {
    renderDocSourceHTML: function() {
      // only update if we have all required data
      if (this.docSource.body && this.X.documentViewRef
          && this.X.documentViewRef.get().resolvedRoot.valid && this.data.model_) {
        // The first time this method is hit, replace it with the one that will
        // compile the template, then call that. Future calls go direct to lazyCompile's
        // returned function. You could also implement this the same way lazyCompile does...
        this.renderDocSourceHTML = TemplateUtil.lazyCompile(this.docSource.body);
        return this.renderDocSourceHTML();
      } else {
        return ""; // no data yet
      }
    }
  }
});


CLASS({
  name: 'DocModelBodyView',
  extendsModel: 'DocBodyView',
  label: 'Documentation Model View',
  help: 'Shows the documentation body for a Model.',

  templates: [
    function toInnerHTML() {/*
      <%    this.destroy(); %>
      <%    if (this.data) {  %>
              <p><%=this.renderDocSourceHTML()%></p>
      <%    } %>
    */}
  ]
});


CLASS({
  name: 'DocFeatureBodyView',
  extendsModel: 'DocBodyView',
  label: 'Documentation Feature View',
  help: 'Shows documentation body for a feature of a Model.',

  // You must set both data and parentModel

  templates: [
    function toInnerHTML()    {/*
      <%    this.destroy(); %>
      <%    if (this.data) {  %>
              <h2><%=this.data.name%></h2>
              <p><%=this.renderDocSourceHTML()%></p>
      <%    } %>
    */}
  ]
});


CLASS({
  name: 'DocRefView',
  extendsModel: 'View',
  label: 'Documentation Reference View',
  help: 'The view of a documentation reference link.',

  documentation: function() { /*
    <p>An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    */},

  properties: [

    {
      name: 'ref',
      help: 'Shortcut to set reference by string.',
      postSet: function() {
        this.docRef = this.X.foam.documentation.DocRef.create({ ref: this.ref });
      },
      documentation: function() { /*
        The target reference in string form. Use this instead of setting
        $$DOC{ref:'.docRef'} directly if you only have a string.
        */}
    },
    {
      name: 'docRef',
      help: 'The reference object.',
      preSet: function(old,nu) { // accepts a string ref, or an DocRef object
        if (typeof nu === 'string') {
          return this.X.foam.documentation.DocRef.create({ ref: nu });
        } else {
          return nu;
        }
      },
      postSet: function() {
        this.tooltip = this.docRef.ref;
        this.updateHTML();
        this.docRef.addListener(this.onReferenceChange);
      },
      documentation: function() { /*
        The target reference.
        */}
    },
    {
      name: 'text',
      help: 'Text to display instead of the referenced object&apos;s default label or name.',
      documentation: function() { /*
          Text to display instead of the referenced object&apos;s default label or name.
        */}
    },
    {
      name: 'className',
      defaultValue: 'docLink',
      hidden: true
    },
    {
      name: 'usePlural',
      defaultValue: false,
      help: 'If true, use the Model.plural instead of Model.name in the link text.',
      documentation: function() { /*
          If true, use the $$DOC{ref:'Model.plural',text:'Model.plural'}
          instead of $$DOC{ref:'Model.name',text:'Model.name'} in the link text,
          for convenient pluralization.
        */}
    }
  ],

  templates: [
    // kept tight to avoid HTML adding whitespace around it
    function toInnerHTML()    {/*<%
      this.destroy();
      if (!this.docRef || !this.docRef.valid) {
        if (this.docRef && this.docRef.ref) {
          %>[INVALID_REF:<%=this.docRef.ref%>]<%
        } else {
          %>[INVALID_REF:*no_reference*]<%
        }
      } else {
        var mostSpecificObject = this.docRef.resolvedModelChain[this.docRef.resolvedModelChain.length-1];
        if (this.text && this.text.length > 0) {
          %><%=this.text%><%
        } else if (this.usePlural && mostSpecificObject.plural) {
          %><%=mostSpecificObject.plural%><%
        } else if (mostSpecificObject.name) {
          %><%=mostSpecificObject.name%><%
        } else if (mostSpecificObject.id) {
          %><%=mostSpecificObject.id%><%
        } else {
          %><%=this.docRef.ref%><%
        }
      }

      this.on('click', this.onClick, this.id);

      %>*/}
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.tagName = 'span';

      this.setClass('docLinkNoDocumentation', function() {
        if (this.docRef && this.docRef.valid) {
          mostSpecificObject = this.docRef.resolvedModelChain[this.docRef.resolvedModelChain.length-1];
          return !( mostSpecificObject.documentation
                   || (mostSpecificObject.model_ && X.Documentation.isSubModel(mostSpecificObject.model_)));
        }
      }.bind(this), this.id);
    }
  },

  listeners: [
    {
      name: 'onReferenceChange',
      code: function(evt) {
        this.tooltip = this.docRef.ref;
        this.updateHTML();
      }
    },
    {
      name: 'onClick',
      code: function(evt) {
        if (this.docRef && this.docRef.valid && this.X.documentViewRequestNavigation) {
          this.X.documentViewRequestNavigation(this.docRef);
        }
      }
    }
  ],
});


CLASS({
  name: 'foam.documentation.DocRef',
  package: 'foam.documentation',
  label: 'Documentation Reference',
  help: 'A reference to a documented Model or feature of a Model',

  documentation: function() { /*
    <p>A link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    <p>Every reference must have documentViewRef set on the context.
      This indicates the starting point of the reference for relative name
      resolution.</p>
    */},

  properties: [
    {
      name: 'resolvedModelChain',
      defaultValue: [],
      documentation: function() { /*
        If this $$DOC{ref:'foam.documentation.DocRef'} is valid, actual instances corresponding each
        part of the reference are in this list. The last item in the list
        is the target of the reference.
      */}
    },
    {
      name: 'resolvedRef',
      defaultValue: "",
      documentation: function() { /*
          The fully qualified name of the resolved reference, in the
          same format as $$DOC{ref:'.ref'}. It may match $$DOC{ref:'.ref'},
          if it was fully qualified (began with package, or Model name if no package).
      */}
    },
    {
      name: 'resolvedRoot',
      defaultValue: "",
      documentation: function() { /*
          The a $$DOC{ref:'foam.documentation.DocRef'} based on the fully qualified package and
          outer model names of this resolved reference. Does not contain features
          and ends with this.resolvedModelChain[0].
      */}
    },
    {
      name: 'ref',
      help: 'The reference to link. Must be of the form "Model", "Model.feature", or ".feature"',
      postSet: function() {
        this.resolveReference(this.ref);
      },
      documentation: function() { /*
        The string reference to resolve.
      */}
    },
    {
      name: 'valid',
      defaultValue: false,
      documentation: function() { /*
        Indicates if the reference is valid. $$DOC{ref:'.resolveReference'} will set
        $$DOC{ref:'.valid'} to true if resolution succeeds and
        $$DOC{ref:'.resolvedModelChain'} is usable, false otherwise.
      */}
    }
  ],

  methods: {
    init: function() {
      /* Warns if documentViewRef is missing from the context. */
      if (!this.X.documentViewRef) {
        //console.log("*** Warning: DocView ",this," can't find documentViewRef in its context "+this.X.NAME);
      } else {
      // TODO: view lifecycle management. The view that created this ref doesn't know
      // when to kill it, so the addListener on the context keeps this alive forever.
      // Revisit when we can cause a removeListener at the appropriate time.
        //        this.X.documentViewRef.addListener(this.onParentModelChanged);
      }
    },

    resolveReference: function(reference) {
  /* <p>Resolving a reference has a few special cases at the start:</p>
    <ul>
      <li>Beginning with ".": relative to $$DOC{ref:'Model'} in X.documentViewRef</li>
      <li>Containing only ".": the $$DOC{ref:'Model'} in X.documentViewRef</li>
      <li>The name after the first ".": a feature of the $$DOC{ref:'Model'} accessible by "getFeature('name')"</li>
      <li>A double-dot after the $$DOC{ref:'Model'}: Skip the feature lookup and find instances directly on
            the $$DOC{ref:'Model'} definition (<code>MyModel.chapters.chapName</code>)</li>
    </ul>
    <p>Note that the first name is a Model definition (can be looked up by this.X[modelName]),
     while the second name is an instance of a feature on that Model, and subsequent
     names are sub-objects on those instances.</p>
  */
      this.valid = false;

      if (!reference) return;

      args = reference.split('.');
      var foundObject;
      var model;

      // if model not specified, use parentModel
      if (args[0].length <= 0) {
        if (!this.X.documentViewRef || !this.X.documentViewRef.get().resolvedRoot.valid) {
          return; // abort
        }

        // fill in root to make reference absolute, and try again
        return this.resolveReference(this.X.documentViewRef.get().resolvedRoot.resolvedRef + reference);

      } else {
        // resolve path and model
        model = this.X[args[0]];
      }

      this.resolvedModelChain = [];
      this.resolvedRef = "";
      var newResolvedModelChain = [];
      var newResolvedRef = "";
      var newResolvedRoot = "";

      // Strip off package or contining Model until we are left with the last
      // resolving Model name in the chain (including inner models).
      // Ex: package.subpackage.ParentModel.InnerModel.feature => InnerModel
      while (args.length > 0 && model && model[args[1]] && model[args[1]].model_) {
        newResolvedRef += args[0] + ".";
        newResolvedRoot += args[0] + ".";
        args = args.slice(1); // remove package/outerModel part
        model = model[args[0]];
      };

      //TODO: do something with the package parts, resolve package refs with no model

      if ( ! model ) return;
      
      newResolvedModelChain.push(model);
      newResolvedRef += model.name;
      newResolvedRoot += model.name;

      // Check for a feature, and check inherited features too
      // If we have a Model definition, we make the jump from definition to an
      // instance of a feature definition here
      if (Model.isInstance(model) && args.length > 1)
      {
        if (args[1].length > 0) {
          // feature specified "Model.feature" or ".feature"
          foundObject = model.getFeature(args[1]);
          if (!foundObject) {
            return;
          } else {
            newResolvedModelChain.push(foundObject);
            newResolvedRef += "." + args[1];
          }
          remainingArgs = args.slice(2);
        }
      } else {
        foundObject = model;
        remainingArgs = args.slice(1);
      }

      // allow further specification of sub properties or lists
      if ( foundObject && remainingArgs.length > 0 ) {
        if ( ! remainingArgs.every(function (arg) {
            var newObject;

            // null arg is an error at this point
            if ( arg.length <= 0 ) return false;

            // check if arg is the name of a sub-object of foundObject
            var argCaller = Function('return this.'+arg);
            if (argCaller.call(foundObject)) {
              newObject = argCaller.call(foundObject);

            // otherwise if foundObject is a list, check names of each thing inside
            } else if (foundObject.mapFind) {
              foundObject.mapFind(function(f) {
                if (f && f.name && f.name === arg) {
                  newObject = f;
                }
              })
            }
            foundObject = newObject; // will reset to undefined if we failed to resolve the latest part
            if (!foundObject) {
              return false;
            } else {
              newResolvedModelChain.push(foundObject);
              newResolvedRef += "." + arg;
              return true;
            }
          })) {
          return; // the loop failed to resolve something
        }
      }

//      console.log("resolving "+ reference);
//      newResolvedModelChain.forEach(function(m) {
//        console.log("  ",m.name,m);
//      });

      this.resolvedModelChain = newResolvedModelChain;
      this.resolvedRef = newResolvedRef;
      this.resolvedRoot = this.X.foam.documentation.DocRef.create({
          resolvedModelChain: [ this.resolvedModelChain[0] ],
          resolvedRef: newResolvedRoot,
          valid: true,
          resolvedRoot: undefined // otherwise it would be the same as 'this'
      });
      this.valid = true;
    },
  },

  // TODO: make sure these reference objects aren't being kept alive too long. See above.
//  listeners: [
//    {
//        name: 'onParentModelChanged',
//        code: function() {
//          this.resolveReference(this.ref);
//        }
//    }
//  ]

});




CLASS({
  name: 'FeatureListDocView',
  package: 'foam.documentation',
  extendsModel: 'DocView',
  help: 'Displays the documentation of the given feature list.',

  properties: [
    {
      name:  'data',
      help: 'The array property whose features to view.',
      postSet: function() {
        this.dao = this.data;
        this.updateHTML();
      }
    },
    {
      name:  'dao',
      model_: 'DAOProperty',
      defaultValue: [],
      onDAOUpdate: function() {
        this.filteredDAO = this.dao;
      }
    },
    {
      name:  'filteredDAO',
      model_: 'DAOProperty',
      onDAOUpdate: function() {
        var self = this;
        if (!this.X.documentViewRef) {
          console.warn("this.X.documentViewRef non-existent");
        } else if (!this.X.documentViewRef.get()) {
          console.warn("this.X.documentViewRef not set");
        } else if (!this.X.documentViewRef.get().valid) {
          console.warn("this.X.documentViewRef not valid");
        }

        this.filteredDAO.select(COUNT())(function(c) {
          self.hasDAOContent = c.count > 0;
        });

        this.selfFeaturesDAO = [].sink;
        this.X.docModelViewFeatureDAO
          .where(
                AND(AND(EQ(DocFeatureInheritanceTracker.MODEL, this.X.documentViewRef.get().resolvedRoot.resolvedModelChain[0].id),
                        EQ(DocFeatureInheritanceTracker.IS_DECLARED, true)),
                    CONTAINS(DocFeatureInheritanceTracker.TYPE, this.featureType()))
                )
          .select(MAP(DocFeatureInheritanceTracker.FEATURE, this.selfFeaturesDAO));

        this.inheritedFeaturesDAO = [].sink;
        this.X.docModelViewFeatureDAO
          .where(
                AND(AND(EQ(DocFeatureInheritanceTracker.MODEL, this.X.documentViewRef.get().resolvedRoot.resolvedModelChain[0].id),
                        EQ(DocFeatureInheritanceTracker.IS_DECLARED, false)),
                    CONTAINS(DocFeatureInheritanceTracker.TYPE, this.featureType()))
                )
          .select(MAP(DocFeatureInheritanceTracker.FEATURE, this.inheritedFeaturesDAO));

        this.updateHTML();
      }
    },
    {
      name:  'selfFeaturesDAO',
      model_: 'DAOProperty',
      documentation: function() { /*
          Returns the list of features (matching this feature type) that are
          declared or overridden in this $$DOC{ref:'Model'}
      */},
      onDAOUpdate: function() {
        var self = this;
        this.selfFeaturesDAO.select(COUNT())(function(c) {
          self.hasFeatures = c.count > 0;
        });
      }
    },
    {
      name:  'inheritedFeaturesDAO',
      model_: 'DAOProperty',
      documentation: function() { /*
          Returns the list of features (matching this feature type) that are
          inherited but not declared or overridden in this $$DOC{ref:'Model'}
      */},
      onDAOUpdate: function() {
        var self = this;
        this.inheritedFeaturesDAO.select(COUNT())(function(c) {
          self.hasInheritedFeatures = c.count > 0;
        });
      }
    },
    {
      name: 'hasDAOContents',
      defaultValue: false,
      postSet: function(_, nu) {
        this.updateHTML();
      },
      documentation: function() { /*
          True if the $$DOC{ref:'.filteredDAO'} is not empty.
      */}
    },
    {
      name: 'hasFeatures',
      defaultValue: false,
      postSet: function(_, nu) {
        this.updateHTML();
      },
      documentation: function() { /*
          True if the $$DOC{ref:'.selfFeaturesDAO'} is not empty.
      */}
    },
    {
      name: 'hasInheritedFeatures',
      defaultValue: false,
      postSet: function(_, nu) {
        this.updateHTML();
      },
      documentation: function() { /*
          True if the $$DOC{ref:'.inheritedFeaturesDAO'} is not empty.
      */}
    },
    {
      name: 'rowView',
      help: 'Override this to specify the view to use to display each feature.',
      factory: function() { return 'DocFeatureRowView'; }
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
  ],

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (!this.hasFeatures && !this.hasInheritedFeatures) { %>
            <p class="feature-type-heading">No <%=this.featureName()%>.</p>
    <%    } else {
            if (this.hasFeatures) { %>
              <p class="feature-type-heading"><%=this.featureName()%>:</p>
              <div class="memberList">$$selfFeaturesDAO{ model_: 'DAOListView', rowView: this.rowView, data: this.selfFeaturesDAO, model: Property }</div>
      <%    }
            if (this.hasInheritedFeatures) { %>
              <p class="feature-type-heading">Inherited <%=this.featureName()%>:</p>
      <%
              var fullView = this.X.DAOListView.create({ rowView: this.rowView, model: Property });
              var collapsedView = this.X.DocFeatureCollapsedView.create();
              %>
              <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'CollapsibleView', data: this.inheritedFeaturesDAO, collapsedView: collapsedView, fullView: fullView, showActions: true }</div>
      <%    } %>
    <%    } %>
    */}
  ],

  methods: {
    getGroupFromTarget: function(target) {
      // implement this to return your desired feature (i.e target.properties$)
      console.assert(false, 'DocFeaturesView.getGroupFromTarget: implement me!');
    },
    featureName: function() {
      // implement this to return the display name of your feature (i.e. "Properties")
      console.assert(false, 'DocFeaturesView.featureName: implement me!');
    },
    featureType: function() {
      // implement this to return Model property name (i.e. "properties", "methods", etc.)
      console.assert(false, 'DocFeaturesView.featureType: implement me!');
    }
  }

});
