var VIDEO_PATH = 'https://x20web.corp.google.com/~kgr/power/videos/DemoDen/';


CLASS({
  name: 'Demo',
  properties: [
    'name', 'path', 'keywords', 'image', 'video', 'description',
    {
      name: 'model',
      postSet: function(_, m) {
        this.path = '../index.html?model=' + m;
        if ( ! this.hasOwnProperty('src') ) this.src = '../js/' + m.replace(/\./g, '/') + '.js';
      }
    },
    {
      name: 'src',
      preSet: function(_, src) {
        return src.endsWith('/') ?
          'https://github.com/foam-framework/foam/tree/master/' + src :
          src ;
      },
      defaultValueFn: function() {
        var i = window.location.href.indexOf('DemoCat.html');
        var path = window.location.href.substring(0, i);
        return 'view-source: ' + path + this.path;
      }
    }
  ]
});


CLASS({
  name: 'Controller',
  traits: ['foam.ui.CSSLoaderTrait'],
  requires: [
    'Demo',
    'foam.ui.DAOListView',
    'foam.ui.TextFieldView'
  ],
  properties: [
    { name: 'search', view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true } },
    { name: 'dao', factory: function() {
return JSONUtil.arrayToObjArray(X, [
  {
    name: 'Googley Eyes',
    model: 'foam.demos.graphics.EyesDemo',
    description: 'A Googley version of the old xeyes app.  Follows your mouse.',
    keywords: ['graphics', 'reactive'],
    image: 'Eyes.png',
  },
  {
    name: 'Solar System',
    model: 'foam.demos.SolarSystem',
    description: 'An animation which demonstrates reactive-programming.  Use the Time-Wheel to spin-time.  This was the first graphical FOAM demo to be written (in 2011).  I\'ve added the <b>old</b> keyword to this, and other older, non-modernized demos.',
    keywords: ['animation', 'reactive', 'old'],
    image: 'SolarSystem.png',
  },
  {
    name: 'Minesweeper',
    model: 'com.google.sweeper.Game',
    description: 'A Minesweeper game.',
    keywords: ['game'],
    src: 'js/com/google/sweeper/',
    image: 'Minesweeper.png',
  },
  {
    name: 'Reactive Clocks',
    model: 'foam.demos.ReactiveClocks',
    description: 'A simple demo of reactive programming.  The first clocks reacts to the position of the mouse while the second clock reacts to the position of the first clock and to time.  Reacting to time essentially gives you an animation system for free.',
    keywords: ['animation', 'reactive'],
    image: 'ReactiveClocks.png',
    video: 'part11.ogv'
  },
  {
    name: 'Unix Simulator',
    path: 'UnixSimulator.html',
    description: "A simulator which demonstrates the advantage of UNIX's architecture over previous operating-sytems.",
    keywords: ['simulation', 'animation', 'architecture', 'old'],
    image: 'UnixSimulator.png',
    src: 'UnixSimulator.js',
    video: 'part1.ogv'
  },
  {
    name: 'Google Simulator',
    path: 'GoogleSimulator.html',
    description: 'A simulation of the growth of Google.',
    keywords: ['simulation', 'animation', 'architecture', 'old'],
    image: 'GoogleSimulator.png',
    video: 'part15.ogv'
  },
  {
    name: 'Fading Circles',
    model: 'foam.demos.graphics.FadingCircles',
    description: 'An reactive-programming animation which demonstrates the use of Events.dynamicFn() and Movement.animate().',
    keywords: ['animation'],
    image: 'FadingCircles.png'
  },
  {
    name: 'Follow The Leader',
    path: 'FollowTheLeader.html',
    description: 'An animation which uses Movement.moveTowards() to create a chain of circles which follow the mouse.',
    keywords: ['animation'],
    image: 'FollowTheLeader.png'
  },
  {
    name: 'InterpolatedClocks',
    model: 'foam.demos.InterpolatedClocks',
    description: 'A demonstration of animation interpolators.  Click to animate the clocks.  Notice how the different clocks use different acceleration curves to reach their targets.',
    keywords: ['animation'],
    image: 'InterpolatedClocks.png'
  },
  {
    name: 'FOAM Architecture Diagram',
    model: 'foam.demos.ArchitectureDiagram',
    description: 'An animated diagram of FOAM\'s architecture.  Notice the reflections.',
    keywords: ['architecture', 'animation'],
    image: 'DemoBlockDiagram.png',
    video: 'part6.ogv'
  },
  {
    name: 'Dragon Live-Coding',
    model: 'foam.demos.DragonLiveCoding',
    description: 'A version of the dragon animation that you can live-code.  Use the Model editor to update methods while the animation is running.',
    keywords: ['animation', 'live-coding'],
    image: 'LiveDragon.png',
    video: 'part12.ogv'
  },
  {
    name: 'Pong',
    model: 'foam.demos.pong.Pong',
    description: 'A simple pong game which demonstrates the both the use of graphical traits (motion blur and shadow) and of the physics engine.',
    keywords: ['animation', 'game', 'physics', 'traits'],
    image: 'Pong.png'
  },
  {
    name: 'DAO Samples',
    path: 'dao.html',
    description: 'An extensive set of DAO (Data-Access-Object) samples.  A must read for learning FOAM.',
    keywords: ['DAO', 'database'],
    image: 'DAO.png'
  },
  {
    name: 'Collision',
    model: 'foam.demos.physics.Collision',
    description: 'Demonstration of the physics engine and collision-detection.',
    keywords: ['physics'],
    image: 'Collision.png'
  },
  {
    name: 'Collision With Spring',
    model: 'foam.demos.physics.CollisionWithSpring',
    description: 'A simple physics simulation which shows the use of springs and collision detection.',
    keywords: ['physics'],
    image: 'CollisionWithSpring.png'
  },
  {
    name: 'Spring',
    model: 'foam.demos.physics.Spring',
    description: 'Addictive spring physics simulation.',
    keywords: ['physics'],
    image: 'Spring.png'
  },
  {
    name: 'Baloons',
    model: 'foam.demos.physics.Baloons',
    description: 'Collision detection with inflatable baloons.',
    keywords: ['physics'],
    image: 'Baloons.png'
  },
  {
    name: 'Bubbles',
    model: 'foam.demos.physics.Bubbles',
    description: 'Demonstrates use of gravity.  Negative gravity makes bubbles rise.',
    keywords: ['physics'],
    image: 'Bubbles.png'
  },
  {
    name: 'Trait Graphics',
    path: 'TraitGraphics.html',
    description: 'Demonstrates the use of graphical Traits.  The circles on the left have shadows and those on the right have motion-blur.  Traits are not limited to graphics and are a generalized method for safely providing multiple inheritance.',
    keywords: ['traits','graphics'],
    src: 'TraitGraphics.js',
    image: 'TraitGraphics.png'
  },
  {
    name: 'Internationalization',
    path: 'I18N.html',
    description: 'Simple I18N Example.',
    keywords: ['i18n'],
    src: 'I18N.js',
    image: 'I18N.png'
  },
  {
    name: 'Crop Circles',
    path: 'CropCircle.html',
    description: 'Crop Circle inspired fractals graphics. Can take 10-20 seconds to load on slow machines. Each fractal is implemented in only one line of code.  Just started: needs animation and a graphical live-coding system.',
    keywords: ['graphics'],
    src: 'CropCircle.js',
    image: 'CropCircle.png'
  },
  {
    name: 'Complements',
    model: 'foam.demos.graphics.Complements',
    description: 'An animated colour wheel.  Shows use of Events.dynamicFn().<br>Ported from the <a href="http://elm-lang.org/edit/examples/Intermediate/Complements.elm">Elm demo</a>.',
    keywords: ['animation'],
    image: 'Complements.png'
  },
  {
    name: 'Complements2a',
    model: 'foam.demos.graphics.Complements2a',
    description: 'Mesmerizing animation.',
    keywords: ['animation'],
    image: 'Complements2a.png'
  },
  {
    name: 'Complements2b',
    model: 'foam.demos.graphics.Complements2b',
    description: 'Mesmerizing animation with shadowBlur.',
    keywords: ['animation'],
    image: 'Complements2b.png'
  },
  {
    name: 'Spin',
    model: 'foam.demos.graphics.Spin',
    description: 'Concentric spinng arcs.',
    keywords: ['animation'],
    image: 'Spin.png'
  },
  {
    name: 'Dragon',
    path: 'Tags.html',
    description: 'Demonstrates use of the FOAM tag to instantiate three views: an animated dragon, a time-wheel, and a DetailView of time.  Use the time-wheel to control the animation.',
    keywords: ['animation'],
    image: 'Dragon.png'
  },
  {
    name: 'Two-Way Data-Binding',
    path: 'TwoWayDataBinding.html',
    description: 'Demonstrates how to do two way data-binding in FOAM. See the same demo implemented <a href="http://n12v.com/2-way-data-binding/?hn">with other JS libraries</a>.',
    keywords: ['tutorial'],
    image: 'TwoWayDataBinding.png'
  },
  {
    name: 'Calculator (pure FOAM)',
    path: '../apps/calc/Calc.html',
    description: 'A simple calculator application.  Demonstrates the use of templates to completely change the appearance of a DetailView.',
    keywords: ['app'],
    src: 'apps/calc/',
    image: 'Calc.png'
  },
  {
    name: 'Calculator (Material-Design)',
    path: '../apps/acalc/Calc.html',
    description: 'A calculator application with an animated Material-Design interface.',
    keywords: ['app', 'material-design'],
    src: 'apps/acalc/',
    image: 'ACalc.png'
  },
  {
    name: 'Calculator (Material-Design, FOAM + Polymer)',
    path: '../apps/pcalc/Calc.html',
    description: 'A calculator applications that uses Polymer component views.',
    keywords: ['app', 'material-design', 'polymer', '15'],
    src: 'apps/pcalc/',
    image: 'ACalc.png'
  },
  {
    name: 'GMail (Material-Design)',
    path: 'http://foam-framework.github.io/foam/apps/gmail/main.html',
    description: 'A simple mobile GMail client with a Material-Design interface, in less than 1k lines of code.',
    keywords: ['app', 'material-design', 'gmail', 'mobile'],
    src: 'apps/gmail/',
    image: 'GMail.png'
  },
  {
    name: 'QuickBug',
    path: 'https://chrome.google.com/webstore/detail/quickbug/hmdcjljmcglpjnmmbjhpialomleabcmg',
    description: 'A Chrome packaged-app clone of the crbug.com issue tracker.  Provides many extra features and improved performance.  Be sure to try out grid-view\'s drag-and-drop tiles and PIE charts with warped scrolling features. See: <a href="http://quickbug.foamdev.com">http://quickbug.foamdev.com</a>',
    keywords: ['app'],
    src: 'apps/quickbug/',
    image: 'QuickBug.png'
  },
  {
    name: 'Issue Tracker (Material-Design)',
    path: 'http://foam-framework.github.io/foam/apps/mbug/main.html',
    description: 'A simple mobile code.google.com issue-tracker client with a Material-Design interface.  Triage your Crbugs on the go.  See: <a href="http://mbug.foamdev.com">http://mbug.foamdev.com</a>',
    keywords: ['app', 'material-design', 'mobile', 'android'],
    src: 'apps/mbug/',
    image: 'MBug.png'
  },
  {
    name: 'Phone Catalog',
    model: 'foam.tutorials.phonecat.Controller',
    description: 'A port of an Angular application for browsing a Cellphone catalog.  Create this app yourself by following the <a href="http://foam-framework.github.io/foam/tutorial/0-intro/">tutorial</a>.',
    keywords: ['tutorial'],
    src: 'js/foam/tutorials/phonecat/',
    image: 'PhoneCat.png'
  },
  /*
  {
    name: 'Quick-Compose',
    path: 'https://chrome.google.com/webstore/detail/quickcompose/elckoikggmpkacmbmpbgdepginigahja',
    description: 'A Chrome App for composing (and sending) quick GMails.  Compose emails while offline and have them delivered when you eventually get a network connection.',
    keywords: ['app'],
    src: '../apps/quickcompose/',
    image: 'QuickCompose.png'
  },
  */
  {
    name: 'Todo',
    path: '../apps/todo/index.html',
    description: 'A FOAM implementation of the <a href="http://todomvc.com">http://todomvc.com</a> comparison application.  Notice that the FOAM implementation is by far the shortest listed on the TodoMVC site.',
    keywords: ['tutorial'],
    src: 'apps/todo/',
    image: 'Todo.png'
  },
  {
    name: 'TodoBrowser',
    model: 'foam.tutorials.todo.TodoApp',
    description: "A Todo app building using FOAM's reusable controller.",
    keywords: ['tutorial'],
    image: 'TodoBrowser.png'
  },
  /*
  {
    name: 'FOAM Code Browser',
    path: '../core/fobrowser.html',
    description: 'A FOAM Model browser.',
    keywords: ['tool', 'dev'],
    src: '../core/fobrowser.js',
    image: 'FOBrowser.png'
  },
*/
  {
    name: 'FOAM Documentation Browser',
    path: '../apps/docs/docbrowser.html',
    description: 'A FOAM Document browser.',
    keywords: ['tool', 'dev', 'docs'],
    src: 'apps/docs/',
    image: '../../apps/docs/images/Model_runtime2.png'
  },
  /*
  {
    name: 'DAO Sync',
    path: 'SyncDemo.html',
    description: 'Demonstration of the sync protocol/implementation do synchronize two DAOs.',
    keywords: ['dao', 'sync'],
    image: 'sync.png',
    src: 'SyncDemo.js',
  },
  */
  {
    name: 'FOAM Logo',
    model: 'foam.demos.graphics.Logo',
    description: 'Animated FOAM logo. Uses trick that only works in Chrome.',
    keywords: ['demo', 'animation'],
    image: 'Logo.png'
  },
  {
    name: 'FOAM-Overflow',
    path: '../apps/overflow/Overflow.html',
    description: 'A simple searchable FOAM Question and Answer database.',
    keywords: ['docs', 'demo'],
    src: 'apps/overflow/',
    image: 'Overflow.png'
  },
  /*
  {
    name: 'FOAM Modeller',
    path: '../index.html?model=foam.apps.Modeller',
    description: 'A demo of the IDE potential for FOAM due to its meta-modelling.',
    keywords: ['dev', 'ide', 'model'],
    src: '/js/foam/apps/Modeller.js'
  }    */
  {
    name: 'Olympic Medals',
    model: 'foam.demos.olympics.Controller',
    description: 'Browse an olympic medal database.  With reciprocal search.<br>Ported from the <a href="https://google.github.io/lovefield/demos/olympia_db/demo_angular.html">Lovefield demo</a>.',
    keywords: [ 'DAO', 'database', 'search' ],
    image: 'Olympics.png'
  },
  {
    name: 'Snake Game',
    model: 'foam.demos.supersnake.Game',
    description: 'Simple snake game.  Not finished, but the source makes a good example.  Move with either the a,w,s,d or arrow keys and fire with either x or the spacebar.',
    keywords: [ 'animation', 'graphics', 'game' ],
    image: 'Snake.png'
  },
  {
    name: 'Tudor Wall',
    model: 'foam.demos.graphics.TudorWall',
    description: 'An animated rainbow coloured wall.',
    keywords: [ 'animation', 'graphics' ],
    image: 'TudorWall.png'
  },
  {
    name: 'Task Manager',
    model: 'foam.apps.ctm.TaskManager',
    description: 'Prototype Chrome Task Manager that adds Material Design, search, and graphing.',
    keywords: [ 'graphics' ],
    image: 'TaskManager.png'
  },
  {
    name: 'Robot',
    xxxmodel: 'foam.demos.supersnake.Robot',
    path: '../index.html?model=foam.demos.supersnake.Robot&x=200&y=200&scaleX=3&scaleY=3&width=1000&height=10000',
    src: '../js/foam/demos/supersnake/Robot.js',
    description: 'Simple animated robot written by an eleven year old.',
    keywords: [ 'graphics', 'animation' ],
    image: 'Robot.png'
  },
  {
    name: 'FOAM Presentation',
    model: 'foam.demos.empire.Preso3',
    description: 'Presentation on FOAM written in FOAM. Press the + button to see all 25 slides run at once (which includes 50k objects, 20k one and two-way data bindings, and 7k animated objects).',
    src: '../js/foam/demos/empire/Preso3_toHTML.ft',
    keywords: [ 'animation', 'graphics', 'game', 'presentation', 'DAO', 'database', 'search' ],
    image: 'Preso3.png'
  },
  {
    name: 'FOAM Demo Catalog',
    path: 'DemoCat.html',
    description: 'A FOAM Demo browser.  The demo you\'re currently running.',
    keywords: ['docs', 'demo'],
    src: 'DemoCat.js',
    image: 'DemoCat.png'
  }


  ], this.Demo).dao;
    } },
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',
      view: { factory_: 'foam.ui.DAOListView', mode: 'read-only' },
      dynamicValue: [ function() { this.dao; this.search; }, function() {
        return this.dao.where(CONTAINS_IC(SEQ(Demo.NAME, Demo.DESCRIPTION, Demo.KEYWORDS), this.search));
      } ]
    },
  ],
  methods: { init: function init() {
      this.SUPER();
      var i = window.location.href.indexOf('?q=');
      if ( i != -1 ) this.search = window.location.href.substring(i+3);
    }}/* [
    function init() {
      this.SUPER();
      var i = window.location.href.indexOf('?q=');
      if ( i != -1 ) this.search = window.location.href.substring(i+3);
    }
  ]*/,
  templates: [
    function CSS() {/*
      .thumbnail { margin-bottom: 40px; }
      .screenshot {
        border: 1px solid gray;
        box-shadow: 5px 5px 15px gray;
        margin-left: 30px;
        margin-top: -38px;
        max-height: 300px;
      }
      span[name="description"] {
        margin-top: 24px;
        display: block;
        width: 500px;
    */},
    function toDetailHTML() {/*
        &nbsp;&nbsp; Search: $$search
        <p>
        <foam f="filteredDAO" className="demos" tagName="ul">
          <li class="thumbnail">
            <a href="%%data.path" class="thumb">$$name{mode: 'read-only'}</a>
            <br>
            <% if ( this.data.image ) { %> <br><a href="%%data.path"><img class="screenshot" src="democat/%%data.image"></a> <% } %>
            <p>$$description{mode: 'read-only', escapeHTML: false}</p>
            <b>Keywords:</b> <%= this.data.keywords.join(', ') %><br>
            <b>Source:</b> <a href="%%data.src">here</a><br>
            <% if ( VIDEO_PATH && this.data.video ) { %>
            <b>Video:</b> <a href="<%= VIDEO_PATH + this.data.video%>"><img style="vertical-align:middle;" width=30 height=30 src="democat/movie-clip-icon.png"></a>
            <% } %>
            <br>
          </li>
        </foam>
    */}
  ]
});
