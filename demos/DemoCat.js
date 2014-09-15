var VIDEO_PATH = 'https://x20web.corp.google.com/~kgr/power/videos/DemoDen/';

MODEL({
  name: 'Demo',
  properties: [
    {
      name: 'name'
    },
    {
      name: 'path'
    },
    {
      model_: 'StringProperty',
      name: 'description'
    },
    {
      name: 'keywords'
    },
    {
      name: 'src',
      defaultValueFn: function() {
        console.log('view-source: ' + window.location.origin + '/demos/' + this.path);

        return 'view-source: ' + window.location.origin + '/demos/' + this.path;
      }
      /*
      preSet: function(_, src) {
        return src.replace('view-source:', 'view-source:' + window.location.origin + '/demos/');
      }
      */
    },
    {
      name: 'image'
    },
    {
      name: 'video'
    }
  ]
});


var demos = [
  /*
  {
    model_: 'Demo',
    name: '',
    path: '',
    description: '',
    keywords: [],
    image: ''
  },
  */
  {
    model_: 'Demo',
    name: 'Solar System',
    path: 'SolarSystem.html',
    description: 'An animation which demonstrates reactive-programming.  Use the Time-Wheel to spin-time.',
    keywords: ['animation', 'reactive'],
    src: 'SolarSystem.js',
    image: 'SolarSystem.png',
  },
  {
    model_: 'Demo',
    name: 'Reactive Clocks',
    path: 'ReactiveClocks.html',
    description: 'A simple demo of reactive programming.  The first clocks reacts to the position of the mouse while the second clock reacts to the position of the first clock and to time.  Reacting to time essentially gives you an animation system for free.',
    keywords: ['animation', 'reactive'],
    image: 'ReactiveClocks.png',
    video: 'part11.ogv'
  },
  {
    model_: 'Demo',
    name: 'Unix Simulator',
    path: 'UnixSimulator.html',
    description: "A simulator which demonstrates the advantage of UNIX's architecture over previous operating-sytems.",
    keywords: ['simulation', 'animation', 'architecture'],
    image: 'UnixSimulator.png',
    video: 'part1.ogv'
  },
  {
    model_: 'Demo',
    name: 'Google Simulator',
    path: 'GoogleSimulator.html',
    description: 'A simulation of the growth of Google.',
    keywords: ['simulation', 'animation', 'architecture'],
    image: 'GoogleSimulator.png',
    video: 'part15.ogv'
  },
  {
    model_: 'Demo',
    name: 'Fading Circles',
    path: 'FadingCircles.html',
    description: 'An reactive-programming animation which demonstrates the use of Events.dynamic() and Movement.animate().',
    keywords: ['animation'],
    image: 'FadingCircles.png'
  },
  {
    model_: 'Demo',
    name: 'Follow The Leader',
    path: 'FollowTheLeader.html',
    description: 'An animation which uses Movement.moveTowards() to create a chain of circles which follow the mouse.',
    keywords: ['animation'],
    image: 'FollowTheLeader.png'
  },
  {
    model_: 'Demo',
    name: 'InterpolatedClocks',
    path: 'InterpolatedClocks.html',
    description: 'A demonstration of animation interpolators.  Click to animate the clocks.  Notice how the different clocks use different acceleration curves to reach their targets.',
    keywords: ['animation'],
    image: 'InterpolatedClocks.png'
  },
  {
    model_: 'Demo',
    name: 'FOAM Architecture Diagram',
    path: 'demoBlockDiagram.html',
    description: 'An animated diagram of FOAM\'s architecture.  Notice the reflections.',
    keywords: ['architecture', 'animation'],
    image: 'DemoBlockDiagram.png',
    video: 'part6.ogv'
  },
  {
    model_: 'Demo',
    name: 'Dragon Live-Coding',
    path: 'DragonLiveCoding.html',
    description: 'A version of the dragon animation that you can live-code.  Use the Model editor to update methods while the animation is running.',
    keywords: ['animation', 'live-coding'],
    src: 'DragonLiveCoding.js',
    image: 'LiveDragon.png',
    video: 'part12.ogv'
  },
  {
    model_: 'Demo',
    name: 'Pong',
    path: 'Pong.html',
    description: 'A simple pong game which demonstrates the both the use of graphical traits (motion blur and shadow) and of the physics engine.',
    keywords: ['animation', 'game', 'physics', 'traits'],
    src: 'Pong.js',
    image: 'Pong.png'
  },
  {
    model_: 'Demo',
    name: 'DAO Samples',
    path: 'dao.html',
    description: 'An extensive set of DAO (Data-Access-Object) samples.  A must read for learning FOAM.',
    keywords: ['DAO', 'database'],
    image: 'DAO.png'
  },
  {
    model_: 'Demo',
    name: 'Collision',
    path: 'Collision.html',
    description: 'Demonstration of collision-detection.',
    keywords: ['physics'],
    src: 'Collision.js',
    image: 'Collision.png'
  },
  {
    model_: 'Demo',
    name: 'Collision With Spring',
    path: 'CollisionWithSpring.html',
    description: 'A simple physics simulation which shows the use of springs and collision detection.',
    keywords: ['physics'],
    src: 'CollisionWithSpring.js',
    image: 'CollisionWithSpring.png'
  },
  {
    model_: 'Demo',
    name: 'Spring',
    path: 'Spring.html',
    description: 'Addictive spring physics simulation.',
    keywords: ['physics'],
    src: 'Spring.js',
    image: 'Spring.png'
  },
  {
    model_: 'Demo',
    name: 'Trait Graphics',
    path: 'TraitGraphics.html',
    description: 'Demonstrates the use of graphical Traits.  The circles on the left have shadows and those on the right have motion-blure.',
    keywords: ['traits','graphics'],
    src: 'TraitGraphics.js',
    image: 'TraitGraphics.png'
  },
  {
    model_: 'Demo',
    name: 'Crop Circles',
    path: 'CropCircle.html',
    description: 'Crop Circle inspired fractals graphics. Can take 10-20 seconds to load on slow machines. Each fractal is implemented in only one line of code.',
    keywords: ['graphics'],
    src: 'CropCircle.js',
    image: 'CropCircle.png'
  },
  {
    model_: 'Demo',
    name: 'Complements',
    path: 'Complements.html',
    description: 'An animated colour wheel.  Ported from the Elm demo.',
    keywords: ['animation'],
    image: 'Complements.png'
  },
  {
    model_: 'Demo',
    name: 'Dragon',
    path: 'Tags.html',
    description: 'Demonstrates use of the FOAM tag to instantiate three views: an animated dragon, a time-wheel, and a DetailView of time.  Use the time-wheel to control the animation.',
    keywords: ['animation'],
    image: 'Dragon.png'
  },
  {
    model_: 'Demo',
    name: 'Two-Way Data-Binding',
    path: 'TwoWayDataBinding.html',
    description: 'Demonstrates how to do two way data-binding in FOAM. See the same demo implemented with other JS libraries at: http://n12v.com/2-way-data-binding/?hn',
    keywords: ['tutorial'],
    image: 'TwoWayDataBinding.png'
  },
  {
    model_: 'Demo',
    name: 'Calculator',
    path: '../apps/calc/Calc.html',
    description: 'A simple calculator application.',
    keywords: ['app'],
    src: '../apps/calc/',
    image: 'Calc.png'
  },
  {
    model_: 'Demo',
    name: 'Calculator (Material-Design)',
    path: '../apps/acalc/Calc.html',
    description: 'A calculator application with an animated Material-Design interface.',
    keywords: ['app', 'material-design'],
    src: '../apps/acalc/',
    image: 'ACalc.png'
  },
  {
    model_: 'Demo',
    name: 'GMail (Material-Design)',
    path: '../apps/gmail/main.html',
    description: 'A simple mobile GMail client with a Material-Design interface, in less than 1k lines of code.',
    keywords: ['app', 'material-design', 'gmail', 'mobile'],
    src: '../apps/gmail/',
    image: 'GMail.png'
  },
  {
    model_: 'Demo',
    name: 'QuickBug',
    path: 'https://chrome.google.com/webstore/detail/quickbug/hmdcjljmcglpjnmmbjhpialomleabcmg',
    description: 'A Chrome packaged-app clone of the crbug.com issue tracker.  Provides many extra features and improved performance.  Be sure to try out the grid-view with a PIE chart and warped scrolling.',
    keywords: ['app'],
    src: '../apps/quickbug/',
    image: 'QuickBug.png'
  },
  {
    model_: 'Demo',
    name: 'Issue Tracker (Material-Design)',
    path: '../apps/mbug/main.html',
    description: 'A simple mobile code.google.com issue-tracker client with a Material-Design interface.  Triage your Crbugs on the go.',
    keywords: ['app', 'material-design', 'mobile'],
    src: '../apps/mbug/',
    image: 'MBug.png'
  },
  {
    model_: 'Demo',
    name: 'Phone Catalog',
    path: '../apps/phonecat/Cat.html',
    description: '',
    keywords: ['tutorial'],
    src: '../apps/phonecat/',
    image: 'PhoneCat.png'
  },
  {
    model_: 'Demo',
    name: 'Quick-Compose',
    path: 'https://chrome.google.com/webstore/detail/quickcompose/elckoikggmpkacmbmpbgdepginigahja',
    description: 'A Chrome App for composing (and sending) quick GMails.',
    keywords: ['app'],
    src: '../apps/quickcompose/',
    image: 'QuickCompose.png'
  },
  {
    model_: 'Demo',
    name: 'Todo',
    path: '../apps/todo/Todo.html',
    description: 'A FOAM implementation of the http://todomvc.com comparison application.',
    keywords: ['tutorial'],
    src: '../apps/todo/',
    image: 'Todo.png'
  },
  {
    model_: 'Demo',
    name: 'FOAM Code Browser',
    path: '../core/fobrowser.html',
    description: 'A FOAM Model browser.',
    keywords: ['tool', 'dev'],
    src: '../core/fobrowser.js',
    image: 'FOBrowser.png'
  },
].dao;


MODEL({ name: 'DemoView', extendsModel: 'DetailView', templates: [
  function CSS() {/*
    .thumbnail {
       margin-bottom: 40px;
    }
  */},
  function toHTML() {/*
      <li class="thumbnail">
        <a href="%%data.path" class="thumb">$$name{mode: 'read-only'}</a>
        <br>
        <% if ( this.data.image ) { %> <br><img width=250 height=250 src="democat/%%data.image"> <% } %>
        <p>$$description{mode: 'read-only'}</p>
        <b>Keywords:</b> <%= this.data.keywords.join(', ') %><br>
        <b>Source:</b> <a href="%%data.src">here</a><br>
        <% if ( VIDEO_PATH && this.data.video ) { %>
        <b>Video:</b> <a href="<%= VIDEO_PATH + this.data.video%>"><img style="vertical-align:middle;" width=30 height=30 src="democat/movie-clip-icon.png"></a>
        <% } %>
        <br>
      </li>
  */}
]});


MODEL({
  name: 'Controller',
  properties: [
    {
      name: 'search',
      view: { model_: 'TextFieldView', onKeyMode: true },
    },
    { name: 'dao', defaultValue: demos },
    {
      name: 'filteredDAO',
      model_: 'DAOProperty',
      view: { model_: 'DAOListView', rowView: 'DemoView', mode: 'read-only' },
      dynamicValue: function() {
        return this.dao.where(CONTAINS_IC(SEQ(Demo.NAME, Demo.DESCRIPTION), this.search));
      }
    }
  ]
});


MODEL({
  name: 'ControllerView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
        &nbsp;&nbsp; Search: $$search
        <p>
        $$filteredDAO{className: 'demos', tagName: 'ul'}
    */}
 ]
});


X.DemoView; // Install CSS, shouldn't be required.  TODO: Fix
