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
      name: 'image'
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
    name: 'Reactive Clocks',
    path: 'ReactiveClocks.html',
    description: 'A simple demo of reactive programming.  The first clocks reacts to the position of the mouse while the second clock reacts to the position of the first clock and to time.  Reacting to time essentially gives you an animation system for free.',
    keywords: ['animation', 'reactive'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Unix Simulator',
    path: 'UnixSimulator.html',
    description: 'A simulator which demonstrates the competitive advantage of UNIX over previous operating-sytems.',
    keywords: ['simulation', 'animation', 'architecture'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Fading Circles',
    path: 'FadingCircles.html',
    description: 'An reactive-programming animation which demonstrates the use of Events.dynamic() and Movement.animate().',
    keywords: ['animation'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Follow The Leader',
    path: 'FollowTheLeader.html',
    description: 'An animation which uses Movement.moveTowards() to create a chain of circles which follow the mouse.',
    keywords: ['animation'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'InterpolatedClocks',
    path: 'InterpolatedClocks.html',
    description: 'A demonstration of animation interpolators.  Click to animate the clocks.  Notice how the different clocks use different acceleration curves to reach their targets.',
    keywords: ['animation'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'FOAM Architecture Diagram',
    path: 'demoBlockDiagram.html',
    description: 'An animated diagram which demonstrates FOAM\'s architecture.  Notice the reflections.',
    keywords: ['architecture', 'animation'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Dragon Animation',
    path: 'Dragon.html',
    description: 'Animated dragon.',
    keywords: ['animation'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Pong',
    path: 'Pong.html',
    description: 'A simple pong game which demonstrates the both the use of graphical traits (motion blur and shadow) and of the physics engine.',
    keywords: ['animation', 'game', 'physics', 'traits'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'DAO Samples',
    path: 'dao.html',
    description: 'An extensive set of DAO (Data-Access-Object) samples.  A must read for learning FOAM.',
    keywords: ['DAO', 'database'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Collision With Spring',
    path: 'A simple physics simulation which shows the use of springs and collision detection.',
    description: '',
    keywords: ['physics'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Crop Circles',
    path: 'CropCircle.js',
    description: 'Crop Circle inspired fractals graphics. Can take 10-20 seconds to load on slow machines.',
    keywords: ['graphics'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Collision',
    path: 'Collision.html',
    description: 'Demonstration of collision-detection.',
    keywords: ['physics'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Spring',
    path: 'Spring.html',
    description: 'Addictive spring physics simulation.',
    keywords: ['physics'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Trait Graphics',
    path: 'TraitGraphics.html',
    description: 'Demonstrates the use of graphical Traits.  The circles on the left have shadows and those on the right have motion-blure.',
    keywords: ['traits','graphics'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Dragon',
    path: 'Tags.html',
    description: 'Demonstrates use of the FOAM tag to instantiate three views: an animated dragon, a time-wheel, and a DetailView of time.  Use the time-wheel to control the animation.',
    keywords: [],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Two-Way Data-Binding',
    path: 'TwoWayDataBinding',
    description: 'Demonstrates how to do two way data-binding in FOAM.',
    keywords: [],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Calculator',
    path: '../apps/calc/Calc.html',
    description: 'A simple calculator application.',
    keywords: ['app'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Material-Design Calculator',
    path: '../apps/acalc/Calc.html',
    description: 'A calculator application with an animated Material-Design interface.',
    keywords: ['app', 'material-design'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Material-Design GMail',
    path: '../apps/gmail/main.html',
    description: 'A simple mobile GMail client with a Material-Design interface, in less than 1k lines of code.',
    keywords: ['app', 'material-design', 'gmail', 'mobile'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Material-Design Issue Tracker',
    path: '../apps/mbug/main.html',
    description: 'A simple mobile code.google.com issue-tracker client with a Material-Design interface.  Triage your Crbugs on the go.',
    keywords: ['app', 'material-design', 'gmail', 'mobile'],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Phone Catalog',
    path: '../apps/phonecat/Cat.html',
    description: '',
    keywords: [],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'QuickBug',
    path: '',
    description: 'A Chrome packaged-app clone of the crbug.com issue tracker.  Provides many extra features and improved performance.  Be sure to try out the grid-view with a PIE chart and warped scrolling.',
    keywords: [],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'QuickCompose',
    path: '',
    description: '',
    keywords: [],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'Todo',
    path: '../apps/todo/Todo.html',
    description: '',
    keywords: [],
    image: ''
  },
  {
    model_: 'Demo',
    name: 'FOAM Code Browser',
    path: '../core/fobrowser.html',
    description: 'A FOAM Model browser.',
    keywords: [],
    image: ''
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
        <p>$$description{mode: 'read-only'}</p>
        <b>Keywords:</b> $$keywords{mode: 'read-only'}
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
