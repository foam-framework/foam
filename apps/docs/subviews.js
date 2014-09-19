/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved
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



MODEL({
  name: 'DocPropertiesView',
  extendsModel: 'View',
  help: 'Displays the documentation of the given Properties.',

  properties: [
    {
      name:  'data',
      help: 'The model whose properties to view.',
      postSet: function(_, data) {
        this.dataDAO.delegate = data.properties;
        this.updateHTML();
      }
    },
    {
      name:  'dataDAO',
      factory: function() {
        var newDAO = this.X.ProxyDAO.create({delegate: this.X.NullDAO.create(), model: Property})
                  .where(EQ(Property.HIDDEN, FALSE));

        newDAO.addListener(this.updateCount);

        return newDAO;
      },
    },
    {
      name: 'isEmpty',
      defaultValue: true,
      postSet: function(_, nu) {
        this.updateHTML();
      }
    }
  ],

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy(); console.log(this.isEmpty); %>
         <h2>Properties:</h2>
         <div>$$dataDAO{ model_: 'DAOListView', rowView: 'DocPropertyRowView', data: this.dataDAO, model: Property }</div>
    */}
  ],
  listeners: [
    {
      name: 'updateCount',
      isMerged: true,
      code: function() {
        var self = this;
        // maintain count of items
     console.log("count listener ", this.dataDAO);
        if (this.dataDAO) {
          this.dataDAO.select(COUNT())(function(c) {
     console.log("count ", c.count);
            self.isEmpty = c.count <= 0;
          });
        }
      }
    }
  ]

});

MODEL({
  name: 'DocPropertyRowView',
  extendsModel: 'View',

  properties: [
    {
      name:  'data',
      postSet: function(_, data) {
        this.updateHTML();
      }
    },
  ],

  templates: [
    function toInnerHTML() {/*
      <h3><%=this.data.name%></h3>
      <p><%=this.data.help%></p>
    */}
  ]
});


MODEL({
  name: 'DocBodyView',
  extendsModel: 'View',
  label: 'Documentation Body View Base',
  help: 'Base Model for documentation body-text views.',

  properties: [
    {
      name: 'data',
      help: 'The model or feature from which to extract documentation.',
      required: true,
      postSet: function() {
        // grab the documentation and compile a template to use in this view
        if (this.data && Documentation.isInstance(this.data.documentation)) {
          // bind docSource
          this.docSource$ = this.data.documentation$;
        }
      }
    },
    {
      name: 'parentModel',
      help: 'The Model in which the feature lives.',
      required: true,
      postSet: function() {
        this.updateHTML();
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
      if (this.docSource.body && this.parentModel.model_ && this.data.model_) {
        // The first time this method is hit, replace it with the one that will
        // compile the template, then call that. Future calls go direct to lazyCompile's
        // returned function. You could also implement this the same way lazyCompile does...
        this.renderDocSourceHTML = TemplateUtil.lazyCompile(this.docSource.body);
        return this.renderDocSourceHTML();
      } else {
        return ""; // no data yet
      }
    },

    /** Create the special reference lookup sub-view from property info. **/
    createReferenceView: function(opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X; // TODO: opt_args should have ref and text auto-set on the view?
      var v = X.DocRefView.create({ parentModel:this.parentModel, ref:opt_args.ref, text: opt_args.text, args: opt_args});
      this.addChild(v);
      return v;
    },

    createTemplateView: function(name, opt_args) {
      // name has been constantized ('PROP_NAME'), but we're
      // only looking for certain doc tags anyway.
      if (name === 'DOC') {
        var v = this.createReferenceView(opt_args);
        return v;
      } else {
        return this.SUPER(name, opt_args);
      }
    }
  }
});


MODEL({
  name: 'DocModelBodyView',
  extendsModel: 'DocBodyView',
  label: 'Documentation Model View',
  help: 'Shows the documentation body for a Model.',

  properties: [
    {
      name: 'data',
      help: 'The Model from which to extract documentation.',
      postSet: function() {
        this.X[this.model_.extendsModel].DATA.postSet.call(this); // TODO: implement this.SUPER() for these
        this.parentModel = this.data;
      }
    },

  ],

  templates: [
    function toInnerHTML()    {/*
      <%    this.destroy(); %>
      <%    if (this.data) {  %>
              <h1><%=this.data.name%></h1>
              <%=this.renderDocSourceHTML()%>
      <%    } %>
    */}
  ],

});

MODEL({
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
              <%=this.renderDocSourceHTML()%>
      <%    } %>
    */}
  ]
});





MODEL({
  name: 'DocRefView',
  extendsModel: 'View',
  label: 'Documentation Reference View',
  help: 'The view of a documentation reference link.',

  properties: [
    {
      name: 'data',
      help: 'The referenced object.',
      postSet: function() {
        this.updateHTML();
      }
    },
    {
      name: 'parentModel',
      help: 'The data of our container view. Used to resolve local links that do not include an explicit Model name.',
      postSet: function() {
        // might have to resolve again since ref may have been set first
        this.data = this.resolveReference(this.ref);
      }
    },
    {
      name: 'ref',
      help: 'The reference to link. Must be of the form "Model", "Model.feature", or ".feature"',
      postSet: function() {
        this.data = this.resolveReference(this.ref);
      }
    },
    {
      name: 'text',
      help: 'Text to display instead of the referenced object&apos;s default label or name.'
    }

  ],

  templates: [
    // kept tight to avoid HTML adding whitespace around it
    function toInnerHTML()    {/*<%
       this.destroy();
      if (this.text && this.text.length > 0) {
        %>[<%=this.text%>]<%
      } else if (this.data && this.data.label && this.data.label.length > 0) {
        %>[<%=this.data.label%>]<%
      } else if (this.data && this.data.name) {
        %>[<%=this.data.name%>]<%
      } else if (this.data.id) {
        %>[<%=this.data.id%>]<%
      } else {
        %>[INVALID_REF:<%=this.ref%>]<%
      } %>*/}
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.tagName = 'span';
    },

    resolveReference: function(reference) {
      // TODO: method arguments can be referenced too? Model.methodName.args.arg1

      // parse "Model.feature" or "Model" or ".feature" with implicit Model==this.data
      args = reference.split('.');
      var foundObject;
      var model;

      // if model not specified, use parentModel
      if (args[0].length <= 0)
        model = this.parentModel;
      else
        model = this.X[args[0]];

      if (model && args.length > 1 && args[1].length > 0)
      {
        // feature specified
        foundObject = model.getFeature(args[1]);
      } else {
        // no feature found, so assume it's a model
        foundObject = model;
      }

      // allow further specification of sub properties or lists
      if (foundObject && args.length > 2)
      {
        remainingArgs = args.slice(2);

        remainingArgs.some(function (arg) {
          var newObject;

          // null arg is an error at this point
          if (arg.length <= 0) return false;

          // check if arg is the name of a sub-object of foundObject
          var argCaller = Function('return this.'+arg);
          if (argCaller.call(foundObject)) {
            newObject = argCaller.call(foundObject);
          } else if (foundObject.mapFind) {
            // otherwise if foundObject is a list, check names of each thing inside
            foundObject.mapFind(function(f) {
              if (f.name && f.name === arg && f) {
                newObject = f;
              }
            })
          }
          foundObject = newObject; // will reset to undefined if we failed to resolve the latest part
          if (!foundObject) return false;
        });
      }
      return foundObject;
    },


  }
});



