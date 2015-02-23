CLASS({
  package: 'com.google.sweeper',
  name: 'Cell',

  extendsModel: 'View',

  imports: [ 'board' ],

  properties: [
    {
      name: 'x'
    },
    {
      name: 'y'
    },
    {
      name: 'mineCount'
    },
    {
      model_: 'BooleanProperty',
      name: 'covered',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'marked',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      name: 'mined',
      factory: function() { return Math.random() < 0.18; }
    },
    {
      name: 'className',
      defaultValue: 'sweeper-cell'
    }
  ],

  templates: [
    function CSS() {/*
      .sweeper-cell {
        display: table-cell;
        border: 1px solid black;
        width: 24px;
        height: 24px;
      }
      .sweeper-cell.covered {
        background: #bbb;
        color: #bbb;
      }
      .sweeper-cell.marked {
        background: lightgreen;
        color: lightgreen;
      }
    */}
  ],

  methods: {
    toInnerHTML: function() {
      this.mineCount = this.board.getMineCount(this);
      return this.mined ? ' X' :
        this.mineCount ? this.mineCount : ' ';
    },
    initHTML: function() {
      this.setClass(
        'covered',
        function () {
          var covered = this.covered;
          var marked = this.marked;
          return covered && ! marked; },
        this.id);
      this.setClass('marked', function () { return this.marked; }, this.id);
      this.$.addEventListener('click', this.sweep);
      this.$.addEventListener('contextmenu', this.mark, true);
      this.SUPER();
    }
  },

  listeners: [
    {
      name: 'sweep',
      code: function(e) {
        console.log(e.which);
        this.covered = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    {
      name: 'mark',
      code: function(e) {
        this.marked = ! this.marked;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  ]
});
