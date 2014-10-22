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

  documentation: function() {/*
    <p>To create a body of documentation for general reference (a topic not
    connected to a specific model), create a model that extends $$DOC{ref:'.'}.
    Fill in the documentation property as normal, including chapters if necessary.
    Reference it the same way you would a normal model, and the $$DOC{ref:'DocView'} will
    load a different view for book references than for standard model references.</p>
  */}

});


MODEL({
  name: 'DevDocumentation_Context',
  extendsModel: 'DocumentationBook',
  label: 'Context Documentation',
  help: 'Context Documentation',

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
        <code>this.X</code>.
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
      }

    ]
  }
});
