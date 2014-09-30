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

          <p>Creating a subcontext and replacing a $$DOC{ref:'Model'}
          definition inside it will cause any other instances using that Context to
          use your new $$DOC{ref:'Model'} definition instead, giving you easy
          dependency injection.
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
