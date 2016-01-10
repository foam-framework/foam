
CLASS({
  name: 'Folder',
  extends: 'foam.ui.View',

  properties: [
    {
      type: 'Array',
      subType: 'Tab',
      name: 'tabs'
    },
    {
      type: 'StringArray',
      name: 'strings'
    }
  ],

  methods: {
    toHTML: function() {
      var out = '';
      out += this.strings.join(',');

      for ( var i = 0 ; i < this.tabs.length ; i++ ) {
        var tab = this.tabs[i];
        console.log(i, tab);
        out += '<br><br><b>' + tab.title + '</b><br>'
        var v = tab.view();
        this.addChild(v);
        out += v.toHTML();
      }

      return out;
    }
  }
});


CLASS({
  name: 'Tab',

  properties: [
    {
      name: 'title'
    },
    {
      type: 'ViewFactory',
      name: 'view'
    }
  ]
});


CLASS({
  name: 'Controller',

  properties: [
  ],

  templates: [
    function toDetailHTML() {/*
      <foam model="Folder">
        <strings>a</strings>
        <strings>b</strings>
        <strings>c</strings>
        <string>Created win singular name: 'string'</string>
        <tabs>
          <title>Title1</title>
          <view>Embedded here.</view>
        </tabs>
        <tabs>
          <title>Title2</title>
          <view>More stuff embedded here.</view>
        </tabs>
        <tabs>
          <title>Title3</title>
          <view>Tab3 Contents</view>
        </tabs>
        <tab>
          <title>Title4</title>
          <view>Notice that this tab is created with the singular name: 'tab'.</view>
        </tab>
        <tab title="Title5">
          <view>Notice that this tab defined the title as an attribute.</view>
        </tab>
      </foam>
    */}
  ]
});
