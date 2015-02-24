// Flag image from www.icons-land.com
CLASS({
  package: 'com.google.sweeper',
  name: 'Cell',

  extendsModel: 'View',

  imports: [ 'board' ],

  constants: {
    COUNT_COLOURS: [ '', 'green', 'blue', 'orange', 'red', 'red', 'red', 'red' ],
  },
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
        border: 1px solid black;
        display: table-cell;
        height: 24px;
        text-align: center;
        vertical-align: middle;
        width: 24px;
        font-weight: bold;
      }
      .sweeper-cell.covered {
        background: #ccc;
      }
      .sweeper-cell.covered font {
        display: none;
      }
      .sweeper-cell.marked font {
        display: none;
      }
      .sweeper-cell.marked {
        background-color: #ccc;
        background-image: url('js/com/google/sweeper/flag.png');
      }
    */}
  ],

  methods: {
    toInnerHTML: function() {
      this.mineCount = this.board.getMineCount(this);
      return this.mined ? '<font color="black">X</font>' :
        this.mineCount ? '<font color="' + this.COUNT_COLOURS[this.mineCount] + '">' + this.mineCount + '</font>' : '';
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
        // console.log(e.which);
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
