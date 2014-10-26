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

// TODO: refactor the documentation viewer so we just create instances of
// DocumentationBook and not submodels.
MODEL({
  name: 'DocumentationBook',
  label: 'Documentation Book',
  plural: 'DocumentationBooks',
  help: 'A documentation object that exists outside of a specific model.',

	// package: 'developerDocs',

  documentation: function() {/*
    <p>To create a body of documentation for general reference (a topic not
    connected to a specific model), create a model that extends $$DOC{ref:'.'}.
    Fill in the documentation property as normal, including chapters if necessary.
    Reference it the same way you would a normal model, and the $$DOC{ref:'DocView'} will
    load a different view for book references than for standard model references.</p>
  */}

});



MODEL({
  name: 'DevDocumentation_Welcome',
  extendsModel: 'DocumentationBook',
  label: 'Welcome to FOAM',
  help: 'Welcome to FOAM',

	// package: 'developerDocs',

  documentation: {
    label: "Welcome to FOAM",

    body: function() {/*
      <p>Congratulations on choosing the Feature Oriented Active Modeler. This
      guide will walk you through the first steps of getting to know FOAM, and
      how concepts from traditional programming languages map into FOAM.</p>
    */},

    chapters: [
      {
        name: 'intro',
        label: 'What is FOAM, exactly?',
        model_: 'Documentation',
        body: function() {/*
          <p>FOAM is a modeling system to describe data and how it behaves, and
          from that generate entire apps. Data can be
          items from a database, $$DOC{ref:'View',usePlural:true} in a UI, or moves
          that a chess piece can make. If it's a thing that can be described with
          attributes and behaviors, it can be a $$DOC{ref:'Model'}.</p>
          <p>To share functionality between similar $$DOC{ref:'Model',usePlural:true}, you
          can inherit the features of another $$DOC{ref:'Model'} by
          $$DOC{ref:'Model.extendsModel',text:'extending'} it, or merge other
          $$DOC{ref:'Model',usePlural:true} in as $$DOC{ref:'Model.traits'}.</p>
          <p>$$DOC{ref:'Model',usePlural:true} are starting to sound a lot like
          object-oriented classes, and in fact when generating Java code FOAM will
          produce Java Classes from your Models. In Javascript you get a __proto__
          set on your instances, which is the equivalent of a class. $$DOC{ref:'Model',usePlural:true}
          are a superset of classes, however, and can do much more.</p>
          <p>The power of FOAM is how easily the pieces can be slotted together:
          <ul>
            <li>A generic two-pane controller can run an email app or a bug tracker without
            any changes: just swap out the Data Access Object ($$DOC{ref:'DAO'}) and the
            $$DOC{ref:'Model',usePlural:true} for the data items.</li>
            <li>Throw your $$DOC{ref:'DAO'} into a $$DOC{ref:'DAOListView'} and the
            user can browse the collection. Want a grid? Throw in a $$DOC{ref:'GridView'}
            instead. Not sure which? Let your $$DOC{ref:'Model'} pick the view at run
            time.</li>
            <li>Need to communicate something to or from a child object, but don't
            want to be burdened with knowing what type it is or if it exists?
            $$DOC{ref:'Model.exports',text:'Export'} your value to your
            $$DOC{ref:'DevDocumentation_Context', text:'context'},
            and a reference gets propagated to objects you create.
            $$DOC{ref:'DevDocumentation_Events..documentation.chapters.binding',text:'Bind'}
            it to a property and you'll get value changes automatically propagated.</li>
            <li>Need to cache data from your back end? Throw a $$DOC{ref:'CachingDAO'}
            on top of your $$DOC{ref:'RestDAO'}. Want to swap the whole thing out at
            run time? Hide it behind a $$DOC{ref:'ProxyDAO'}
            and your app won't know the difference.  </li>
          </ul></p>
        */}
      },
      {
        name: 'models',
        label: 'Why Model?',
        model_: 'Documentation',
        body: function() {/*
          <p>Traditional object-oriented classes are useful abstractions that provide
          structure to code, keeping data and the code to manage it in one place.
          But how does one add meta-data to a class? Javadocs uses special comments
          hacked in with a special parser, outside of the core language. Runtime-accessible
          meta-data is limited or non-existent.</p>
          <p>$$DOC{ref:'Model'}, on the other hand, describes a set of features that
          each object in the system will have. Each feature, such as $$DOC{ref:'Model.properties'},
          $$DOC{ref:'Model.methods'}, or even $$DOC{ref:'Model.documentation'} is also
          described by a $$DOC{ref:'Model'} ($$DOC{ref:'Property'},
          $$DOC{ref:'Method'}, and $$DOC{ref:'Documentation'} respectively), and
          in fact the definition of $$DOC{ref:'Model'}
          itself is an instance of $$DOC{ref:'Model'}.</p>
          <p>For instance:
          <ul>
            <li>$$DOC{ref:'Property'} has a $$DOC{ref:'Property.name'} as one would expect,
            but also $$DOC{ref:'Property.hidden'} and $$DOC{ref:'Property.view'} properties
            to indicate how it should be displayed.</li>
            <li>$$DOC{ref:'Method'} has $$DOC{ref:'Method.code'} as one might expect, but also
            the list of $$DOC{ref:'Method.args',text:'arguments'},
            with further details available for each, describing everything needed to generate
            the method in different languages.</li>
            <li>There are also $$DOC{ref:'Action',usePlural:true}, $$DOC{ref:'Relationship',usePlural:true},
            and a slew of other features that $$DOC{ref:'Model'} provides to allow you
            to describe your data and the relations between them.</li>
          </ul>
          </p>
          <p>With all that meta-information available, many avenues open up:
          code generation, database persistence, serialization, and data display
          can all be automated, to the point where modeling your new data and plugging
          it into an old app creates a new experience for the user with little effort
          from the developer.</p>
          <p>Since each part of a $$DOC{ref:'Model'} is itself a $$DOC{ref:'Model'},
          $$DOC{ref:'Model'} definitions themselves are easy to store in a $$DOC{ref:'DAO'}
          and pull in features as they need them. This enables dynamic loading (if your
					chosen language supports it, like Javascript), or
          providing features and code to the client based on run-time decisions.</p>
        */}
      },
      {
        name: 'modelsAtRuntime',
        label: 'Models in Action',
        model_: 'Documentation',
        body: function() {/*
          <p>You've defined a $$DOC{ref:'Model'} or two, but what happens then? You can pull
          a copy of your $$DOC{ref:'Model'} from the root context with <code>X['MyModelName']</code>
          or <code>X.MyModelName</code>, and create an instance of it with
          <code>X.MyModelName.create({args})</code>. But what kind of object did you pull?</p>
          <p>When you declare a $$DOC{ref:'Model'}, inheritance follows your
          $$DOC{ref:'Model.extendsModel'} property down through the chain until
          you omit $$DOC{ref:'Model.extendsModel'}.
          At each step, new $$DOC{ref:'Property',usePlural:true} or other features are
          added on, as one would expect from inheritance. When you examine the "MyBase"
          object from your context, you see all the inherited features. Calling create()
          instantiates those features on an instance object, where you can assign values
          or call methods.</p>
          <p><img src='images/Model_runtime1.png'/></p>
          <p>But what are "MyBase" and "MySub" in the above diagram? In object-oriented
          languages they are typically special class definitions that exist outside
          the heap where instances live. In pure Javascript, they would be __proto__
          objects.</p>
          <p>In FOAM, those $$DOC{ref:'Model'} definitions are actually instances of
          $$DOC{ref:'Model'}, including $$DOC{ref:'Model'} itself:</p>
          <p><img src='images/Model_runtime2.png'/></p>
          <p>So your $$DOC{ref:'Model',usePlural:true} are instances of $$DOC{ref:'Model'}.
					Features are also
          instantiated inside your $$DOC{ref:'Model',usePlural:true}. 
					The $$DOC{ref:'Property',usePlural:true}
          are shown in the diagram above. When building instances of your $$DOC{ref:'Model'}
          the lists of inherited $$DOC{ref:'Property',usePlural:true} and other features
          are merged to form the complete list of features your instance is built with.</p>

          <p>Note the red arrows on the left. $$DOC{ref:'Model'} creates itself, and the
          $$DOC{ref:'Property',usePlural:true} list is a $$DOC{ref:'Property'}.
          How do they create themselves before they are defined? The answer is to cheat
          during the bootstrap process. Temporary placeholders are filled in to build up
          $$DOC{ref:'Model'} and its components, and replaced with the final versions
          at the end of the process.</p>
        */}
      }

    ]
  }
});



MODEL({
  name: 'DevDocumentation_Context',
  extendsModel: 'DocumentationBook',
  label: 'Context Documentation',
  help: 'Context Documentation',

	// package: 'developerDocs',

  documentation: {
    label: "Contexts",

    body: function() {/*
      <p>Contexts provide a way to control the global environment at
        run time. You can replace $$DOC{ref:'Model'} definitions, make variables,
        and spawn sub-contexts to limit what your sub-instances can see.
        </p>
        <p>Even if you don't create sub-contexts in your $$DOC{ref:'Model'}, you
        should always use your current context when creating instances:
        <p><code>this.X.MyModel.create(...)</code></p>
        <p>This guarantees you will play nicely with other $$DOC{ref:'Model',usePlural:true}
        that may rely on sub-contexting for dependency injection or to confgure
        the $$DOC{ref:'View',usePlural:true} that you create, without requiring any
        knowledge or intervention on your part. When in doubt, never use a global. Always
        <code>this.X</code>, or use $$DOC{ref:'Model.imports',text:'imports'}
        and $$DOC{ref:'Model.exports',text:'exports'}.
    */},
    chapters: [
      {
        name: 'intro',
        label: 'What is a Context?',
        model_: 'Documentation',
        body: function() {/*
          <p>When you write code in a traditional language, you have the option of creating
          variables in the global scope. Class names are defined globally. Many things
          operate as singletons, sharing a namespace heirarchy that spans the entire
          process or virtual machine. Anything created in this space or named this way
          has a problem: there's no simple way to limit what other parts of your code
          see. Dependency injection frameworks were invented as a workaround for this
          problem, and singletons are avoided.
          </p>
          <p>A $$DOC{ref:'DevDocumentation_Context',text:'Context'} solves this problem
          by wrapping the global namespace and instances into an object, <code>this.X</code>,
          and allowing code
          to create copies with specific changes that can be passed on to
          the instances you create.
          </p>
          <p>For example:</p>
          <p><code>
            myMethod: function() {<br/>
            var subX = this.X.sub({name:'mySubContext'}); // create subcontext<br/>
            subX.greatValue = subX.SimpleValue.create();  // a simple value in sub context<br/>
            }
          </code></p>

          <p>You can also replace $$DOC{ref:'Model'} definitions in a sub-context.
          </p>

        */}
      },
      {
        name: 'dependencyInjection',
        label: 'Dependency Injection',
        model_: 'Documentation',
        body: function() {/*
          <p>The goal of dependency injection is to transparently replace implementation
          as needed. Uses include:</p>
          <ul>
              <li>Picking the most appropriate implementation at run time</li>
              <li>Replacing a production implementation with a mock or fake</li>
              <li>Decoupling dependencies without added layers of interface inheritance</li>
          </ul>
          <p>With control over you Context, you get all this for free. To replace the
          implementation of a $$DOC{ref:'Model'}, just reassign it in your subcontext:
          <p><code>
            init: function() {<br/>
            this.X = this.X.sub(); // replace our own context<br/>
            this.SUPER(); // always call this.SUPER() in your init()!<br/>
            this.X.DetailView = this.X.MyOtherView; // swap in different view<br/>
            ...<br/>
            var actuallyMyOtherView = this.X.DetailView.create();<br/>
            }
          </code></p>
          Not only does this cause your own calls to create() to use the new $$DOC{ref:'DetailView'}
          replacement, but anything you create that happens to create a $$DOC{ref:'DetailView'}
          will get MyOtherView instead.
          </p>
        */}
      },
      {
        name: 'subcontextStructure',
        label: 'Sub-context Structure',
        model_: 'Documentation',
        body: function() {/*
          <p>Sub-contexts are arranged in a tree. The root is the global context,
          which includes all the $$DOC{ref:'Model',usePlural:true} defined outside
          of a specific context.
          </p>
          <p>Each time you call <code>this.X.sub()</code>, you create a branch with
          a copy of the parent context. Changes propagate down the branches, so
          if you add a value instance to the root, all the subcontexts will also have
          that value. If you create a value in a subcontext, however, the parent
          will not see the value.
          </p>
          <p>The basic rule of thumb is that any $$DOC{ref:'Model'} that wants
          to change the contents of its context should sub-context first.
          Calling <code>this.X = this.X.sub();</code> in your init() $$DOC{ref:'Method'},
          before you call <code>this.SUPER();</code>,
          replaces your implicit context with a subcontext, so anything created inside
          your $$DOC{ref:'Model'} will use the subcontext.
          </p>
          <p>You can also create multiple subcontexts, and manage their use yourself:
          <p><code>
            this.searchX = this.X.sub({name:'searchContext'});<br/>
            this.detailX = this.X.sub({name:'detailContext'});<br/>
            ...<br/>
            this.searchX.selection = this.searchX.SimpleValue.create();<br/>
            this.detailX.DetailView = this.X.BetterDetailView;<br/>
             </code></p>
          </p>
        */}
      },
    ]
  },

});

MODEL({
  name: 'DevDocumentation_Events',
  extendsModel: 'DocumentationBook',
  label: 'Events and Binding Documentation',
  help: 'Events and Binding Documentation',

	// package: 'developerDocs',

  documentation: {
    label: "The FOAM Event and Binding System",

    body: function() {/*
      <p>Events and Data Binding are critical concepts in FOAM. Any property or
      object can listen for and respond to events, or trigger events to other
      objects that may be listening to it. Data Binding automatically progagates
      value changes (including changes to the contents of a $$DOC{ref:'DAO'}) to
      bound objects, rippling values through the system without requiring any code
      to move information from one step to the next.</p>
    */},
    chapters: [
      {
        name: 'intro',
        label: 'What are Events in FOAM?',
        model_: 'Documentation',
        body: function() {/*
          <p>FOAM uses a publish/subscribe system for events between objects. Listeners
          must subscribe (or 'listen') to a particular sender object, and are notified
          when a published event is sent.</p>
          <p>The most common type of event is a property change, which is used to notify
          a bound object of a change in its source. As property change events ripple through
          the system, reactive programming emerges.</p>
          <p>Animation is also handled by the event system, and by merging repeated events
          (such as multiple value changes during a single animation frame), the event system
          efficiently handles very large sets of frequently triggered events.</p>
        */}
      },
      {
        name: 'pubSub',
        label: 'Publishing and Subscribing',
        model_: 'Documentation',
        body: function() {/*
          <p>To publish an event, simply invent a topic name. The topic is the type of
          event, and used to filter listeners so they only receive notification when
          the topic they are interested in is triggered. Example topics would include
          'property', 'keydown', 'remove', 'selected', or whatever is relevant to your
          $$DOC{ref:'Model'} and its listeners. </p>
          <p>Every object in FOAM can send and receive events, so there is no need to
          register your intent to publish. When the event happens, just call
          <code>this.publish('topicName', opt_args)</code> and any listeners will be immediately
          notified. If you don't want to wait around for them, the asynchronous version
          <code>this.publishAsync('topicName', opt_args)</code> will return immediately and notify
          the listeners later.</p>
          <p>Listeners receive the optional arguments, if provided. Property changes, for
          instance, will send the old and new values for the listener to reference.</p>
        */}
      },
      {
        name: 'binding',
        label: 'Binding',
        model_: 'Documentation',
        body: function() {/*
          <p>Binding takes care of the publishing and subscribing for you. Just use
          <code>Events.follow(src,dst)</code> to bind
          a source value to a target value, and changes to the source will automatically
          be applied to the target:</p>
          <p><code>
            var source = this.X.SimpleValue.create();<br/>
            var target = this.X.SimpleValue.create();<br/>
            source.set(3);<br/>
            // source is now 3, target is undefined<br/>
            Events.follow(source, target);<br/>
            // source is still 3, target is now 3<br/>
            source.set(5);<br/>
            // both source and target are now 5<br/>
            target.set(2);<br/>
            // source is still 5, target is 2 since the binding is one-way only.<br/>
          </code></p>
          <p>Linking two values with <code>Events.link(obj1, obj2)</code>
          creates a bi-directional binding, so that updates
          to either of the values will propagate to the other:</p>
          <p><code>
            var source = this.X.SimpleValue.create();<br/>
            var target = this.X.SimpleValue.create();<br/>
            source.set(3);<br/>
            // source is now 3, target is undefined<br/>
            Events.link(source, target);<br/>
            // source is still 3, target is now 3<br/>
            source.set(5);<br/>
            // both source and target are now 5<br/>
            target.set(2);<br/>
            // both source and target are now 2<br/>
          </code></p>
          <p>When a binding is no longer needed, clean it up with
          <code>Events.unfollow(src,dst)</code> or
          <code>Events.unlink(obj1, obj2)</code> respectively.
        */}
      },
      {
        name: 'animation',
        label: 'Animation',
        model_: 'Documentation',
        body: function() {/*
          <p>// TODO</p>
        */}
      }

    ]
  }
});

MODEL({
  name: 'DevDocumentation_Views',
  extendsModel: 'DocumentationBook',
  label: 'Views Documentation',
  help: 'Views Documentation',

	// package: 'developerDocs',

  documentation: {
    label: "FOAM Views",

    body: function() {/*
      <p>A $$DOC{ref:'View'} in FOAM is simply a $$DOC{ref:'Model'} designed to nest
      inside other $$DOC{ref:'View',usePlural:true} and perform layout if necessary.
      The currently available $$DOC{ref:'View',usePlural:true} are DOM based for browser
      use, and have some HTML centric properties. You'll find the hardest part of your
      $$DOC{ref:'View'} experience in tweaking your CSS.</p>

    */},
    chapters: [
      {
        name: 'html',
        label: 'HTML Views',
        model_: 'Documentation',
        body: function() {/*
          <p>Some peculiarities of rendering into the DOM include connecting of DOM
          listeners. You should implement at a minimum $$DOC{ref:'View.toInnerHTML'}() (or
          $$DOC{ref:'View.toHTML'}() if you want to create the outermost element, as well).</p>
          <p>When rendering, call $$DOC{ref:'View.toHTML'}(), insert the result into the DOM, then
          call $$DOC{ref:'View.initHTML'}() to finish connecting it up.</p>
        */}
      },
      {
        name: 'templates',
        label: 'Templates in Views',
        model_: 'Documentation',
        body: function() {/*
          <p>$$DOC{ref:'Template',usePlural:true} provide a convenient way of
          expressing blocks of HTML in your $$DOC{ref:'View',usePlural:true}.
				  $$DOC{ref:'Template',usePlural:true} are compiled into $$DOC{ref:'Method',usePlural:true}.
					A $$DOC{ref:'View.toInnerHTML'} or $$DOC{ref:'View.toHTML'} $$DOC{ref:'Template'} is a
					common use.
          </p>
          <p>Use the $$DOC{ref:'.',text:'$$'}propertyName{...} tag syntax to insert sub-views
          based on a $$DOC{ref:'Property'},
          or just call <code>&lt;%= this.mySubViewProperty.toHTML() %&gt;</code> to
          inject some HTML directly. Remember to call $$DOC{ref:'View.initHTML'}()
          afterwards.</p>	
        */}
      },
      {
        name: 'detailView',
        label: 'Automatic View Creation',
        model_: 'Documentation',
        body: function() {/*
          <p>$$DOC{ref:'DetailView',usePlural:true} in FOAM feed from a $$DOC{ref:'DetailView.data'}
          $$DOC{ref:'Property'}, by default using introspection to examine all the
          $$DOC{ref:'Property',usePlural:true} of the $$DOC{ref:'Model'} provided
          and display them.</p>
          <p>A $$DOC{ref:'PropertyView'} is created to process each $$DOC{ref:'Property'},
          and it picks the appropriate $$DOC{ref:'View'} model.</p>
        */}
      },
      {
        name: 'css',
        label: 'CSS in Views',
        model_: 'Documentation',
        body: function() {/*
          <p>You can attach CSS directly to your $$DOC{ref:'View'} by implementing the
					$$DOC{ref:'View.CSS'}() $$DOC{ref:'Method'} or $$DOC{ref:'Template'}. When the view
					is instantiated, the CSS is installed into the document, ready for rendering.
					$$DOC{ref:'View',usePlural:true} can control their individual style attributes
					by setting $$DOC{ref:'View.extraClassName'} inside a submodel, or at run time by
					setting $$DOC{ref:'View.className'}.</p>
        */}
      }

    ]
  }
});


