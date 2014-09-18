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
  name: 'DocPropertyView',
  extendsModel: 'DetailView',
  help: 'Displays the documentation of the given Properties.',

  properties: [
    {
      name:  'data',
      postSet: function(_, data) {
        if ( ! this.model && data && data.model_ ) this.model = data.model_;
        this.dataDAO = data;
        this.onValueChange();
      }
    },
    {
      name:  'dataDAO',
      preSet: function(_, data) {
        if (Array.isArray(data)) {
          var newDAO = this.X.ProxyDAO.create({delegate: data, model: Property})
                        .where(EQ(Property.HIDDEN, FALSE)); // only keep non-hidden
          // maintain count of items
          newDAO.select(COUNT())(function(c) {
            this.count = c.count;
          }.bind(this));
          return newDAO;
        } else {
          return data;
        }
      },
    },
    {
      name: 'count',
      postSet: function(_, nu) {
        this.onValueChange();
      }
    }
  ],

  templates: [
    function toHTML()    {/*
      <div id="%%id" class="%%cssClassAttr">
        <%=this.toInnerHTML()%>
      </div>
    */},
    function toInnerHTML()    {/*
    <%    if (this.count > 0)
          {  %>
            <h2>Properties:</h2>
            <div><%= this.X.DAOListView.create({ rowView: 'DocPropertyRowView', data$: this.dataDAO$ }) %></div>
    <%    } else { %>
            <h2>No Properties.</h2>
    <%    } %>
    */}
  ]
});

MODEL({
  name: 'DocPropertyRowView',
  extendsModel: 'DetailView',

  templates: [
    function toHTML() {/*
      <div id="%%id" class="propertyRowView">
        <h3><%=this.data.name%></h3>
        <p><%=this.data.help%></p>
      </div>
    */}
  ]
});


MODEL({
  name: 'DocModelView',
  extendsModel: 'View',
  label: 'Documentation Model View',
  help: 'Shows documentation for a Model.',

  properties: [
    {
      name: 'data',
      help: 'The Model from which to extract documentation.',
      postSet: function() {
        // grab the documentation and compile a template to use in this view
        if (this.data && Documentation.isInstance(this.data.documentation))
        {
          // bind docSource
          this.docSource$ = this.data.documentation$;
        }
      }
    },
    {
      name: 'docSource',
      type: 'Documentation',
      help: 'The documentation object to render.',
      postSet: function() {
        if (this.docSource && this.docSource.body)
        {
          this.renderDocSourceHTML = TemplateUtil.lazyCompile(this.docSource.body);
        }
      }
    },
    {
      name: 'renderDocSourceHTML',
      help: 'Automatically created to render the docSource.body template.',
      postSet: function() {
        this.updateHTML();
      }
    },

  ],

  templates: [
    function toInnerHTML()    {/*
      <%    if (this.data) {  %>
              <h1><%=this.data.name%></h1>
              <%=this.renderDocSourceHTML()%>
      <%    } %>
    */}
  ],

  methods: {

    /** Create the special reference lookup sub-view from property info. **/
    createReferenceView: function(opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X; // TODO: opt_args should have ref and text auto-set on the view?
      var v = X.DocRefView.create({ parentModel:this.data, ref:opt_args.ref, text: opt_args.text, args: opt_args});
      this.addChild(v);
      return v;
    },

    createTemplateView: function(name, opt_args) {
      // name has been constantized ('PROP_NAME'), but we're
      // only looking for certain doc tags anyway.
      if (name === 'DOC') {
        var v = this.createReferenceView(opt_args) ;
        return v;
      } else {
        return this.SUPER(name, opt_args);
      }
    }
  }
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

      if (args.length > 1 && args[1].length > 0)
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
