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
  package: 'foam.util.swift',
  name: 'SwiftSource',

  methods: [
    function prepModel(model) {
      // Swift doesn't support traits, so we'll copy traits into the model directly.
      model = model.deepClone();

      var properties = model.properties;
      for ( var i = 0; i < model.traits.length; i++ ) {
        var trait = this.X.lookup(model.traits[i]);

        for ( var j = 0; j < trait.properties.length; j++ ) {
          var traitProp = trait.properties[j];
          
          for ( var k = 0; k < properties.length; k++ ) {
            var prop = properties[k];
            if ( prop.name === traitProp.name ) {
              properties[k] = traitProp.deepClone().copyFrom(prop);
              break;
            }
          }
          if ( k === properties.length ) {
            properties.push(traitProp);
          }
        }
      }
      model.properties = properties;

      return model;
    },
      function generate(model) {
        return this.swiftSource.call(this.prepModel(model));
      },
      function genDetailView(model) {
        return this.detailView.call(this.prepModel(model));
      },
  ],

  templates: [
    function swiftSource(_, util) {/*
class <%= this.swiftClassName %>: <% if ( this.extendsModel ) { %><%= this.extendsModel %><%
} else { %>FObject<% }
if ( this.implements.length > 0 ) {
  %>, <% for ( var i = 0; i < this.implements.length - 1; i++ ) { %><%= this.implements[i] %>, <% } %><%= this.implements[i] %>
<% } %> {<%
  for ( var i = 0 ; i < this.properties.length ; i++ ) {
    var prop = this.properties[i];
    var name = prop.name;
    var constant = constantize(name);
    var type = prop.swiftType; %>
    var <%= name %>_: <%= type %>
    let <%= constant %> = Property(name: "<%= name %>")
    var <%= name %>Value_: PropertyValue?
    var <%= name %>$: PropertyValue {
        get {
            if self.<%= name %>Value_ == nil {
                self.<%= name %>Value_ = PropertyValue(obj: self, prop: "<%= name %>")
            }
            return self.<%= name %>Value_ as! PropertyValue!
        }
    }
    var <%= name %> : <%= type %> {
        get {
          return <%= name %>_
        }
        set(value) {
          var oldValue = <%= name %>_
          <%= name %>_ = value
          self.firePropertyChangeEvent("<%= name %>", oldValue: oldValue, newValue: <%= name %>_)
       }
    }
<% } %>

    override func get(key: String) -> Any? {
        switch key {
<% for ( var i = 0 ; i < this.properties.length; i++ ) {
  var prop = this.properties[i];
%>
        case "<%= prop.name %>":
          return self.<%= prop.name %>
<% } %>
        default:
          return nil
        }
    }

    override func set(key: String, value: Any) {
        switch key {
<% for ( var i = 0 ; i < this.properties.length ; i++ ) {
  var prop = this.properties[i];
%>
        case "<%= prop.name %>":
            if let v = value as? <%= prop.swiftType %> {
                self.<%= prop.name %> = v
            }
<% } %>
        default:
            return
        }
    }

    init(<%
  for ( var i = 0 ; i < this.properties.length ; i++ ) {
    var prop = this.properties[i];
    %><%= prop.name %>: <%= prop.swiftType %> = <%= prop.defaultSwiftValue %><%
    if ( i != this.properties.length - 1 ) { %>, <% }
  } %>) {
    <%
  for ( var i = 0 ; i < this.properties.length ; i++ ) {
    var prop = this.properties[i]; %>
        self.<%= prop.name %>_ = <%= prop.name %><%
  } %>
    }

<% if ( false ) { for ( var i = 0 ; i < this.methods.length ; i++ ) {
console.log(this.methods[i]);
  util.methodSource.call(this.methods[i], out, util);
}
}%>
}
*/},
    function methodSource(_, util) {/*
    func <%= this.name %> (<%
  for ( var i = 0; i < this.args.length; i++ ) {
    util.argSource.call(this.args[i], out, util)
    if ( i != this.args.length - 1 ) { %>, <% }
  }
%>)<% if ( this.swiftReturnType ) { %> -> <%= this.swiftReturnType %><% } %> {}
*/},
    function argSource() {/*var <%= this.name %>: <%= this.swiftType %>*/},
    function detailView() {/*
class Abstract<%= this.name %>DetailView: UIViewController {
    var data: <%= this.name %>!
    var contentView: UIScrollView = UIScrollView()

<% for ( var i = 0 ; i < this.properties.length ; i++ ) {
  var prop = this.properties[i]; %>
    var <%= prop.name %>View: <%= prop.swiftView %>!<%
} %>

    init(data: <%= this.name %>) {
        self.data = data
        super.init(nibName: nil, bundle: nil)
    }

    required init(coder asdf: NSCoder) {
        fatalError("Storyboards not supported")
    }

    override func loadView() {
        super.loadView()

        self.view.addSubview(self.contentView)

<% for ( var i = 0 ; i < this.properties.length ; i++ ) {
  var prop = this.properties[i]; %>
        self.<%= prop.name %>View = <%= prop.swiftView %>(data: self.data.<%= prop.name %>$, label: "<%= prop.label %>")
        self.contentView.addSubview(self.<%= prop.name %>View.view)
<%
} %>

        doLayout()
    }

    func doLayout() {
        self.contentView.frame = self.view.frame
    }
}
*/}
  ]
})

/* 

old constraints based layout
        // Override this to perform your own layout<%
  if ( this.properties.length > 0 ) { %>
        self.<%= this.properties[0].name %>View.view.setTranslatesAutoresizingMaskIntoConstraints(false)
        self.contentView.addConstraint(
            NSLayoutConstraint(
                item: <%= this.properties[0].name %>View.view,
                attribute: NSLayoutAttribute.Top,
                relatedBy: NSLayoutRelation.Equal,
                toItem: self.contentView,
                attribute: NSLayoutAttribute.Top,
                multiplier: 1,
                constant: 100))<% } %>
<% for ( var i = 1 ; i < this.properties.length ; i++ ) {
  var name = this.properties[i].name;
  var prev = this.properties[i-1].name; %>
        self.<%= name %>View.view.setTranslatesAutoresizingMaskIntoConstraints(false)
        self.contentView.addConstraint(
            NSLayoutConstraint(
                item: <%= name %>View.view,
                attribute: NSLayoutAttribute.Top,
                relatedBy: NSLayoutRelation.Equal,
                toItem: <%= prev %>View.view,
                attribute: NSLayoutAttribute.Bottom,
                multiplier: 1,
                constant: 32))
        self.contentView.addConstraint(
            NSLayoutConstraint(
                item: <%= name %>View.view,
                attribute: NSLayoutAttribute.Width,
                relatedBy: NSLayoutRelation.Equal,
                toItem: self.contentView,
                attribute: NSLayoutAttribute.Width,
                multiplier: 1,
                constant: -12))<%
} %>
*/
