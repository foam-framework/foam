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
