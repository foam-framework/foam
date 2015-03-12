CLASS({
  name: 'CrawableDetailView',
  imports: [ 'applicationURL', 'applicationIdURL' ],
  extendsModel: 'foam.ui.DetailView',
  properties: [
    { name: 'title', defaultValueFn: function() { return this.model.label; } }
  ],
  methods: {
    rowToHTML: function(prop, view) {
      var str = '';
      var val = this.data[prop.name]

      if ( ! val ) return '';

      view.mode = 'read-only';

      str += '<tr>';
      str += "<td class='label'>" + prop.label + ": </td>";
      str += '<td>';
      if ( prop.name === 'id' ) {
        str += '<a href="' + this.applicationIdURL + val + '">' + val + '</a>';
      } else if ( typeof val === 'object' ) {
        str += JSONUtil.stringify(val);
      } else {
        str += val;
      }
      str += '</td>';
      str += '</tr>';

      return str;
    }
  }
});


CLASS({
  name: 'CrawableRowView',
  requires: [ 'foam.ui.animated.ImageView' ],
  extendsModel: 'foam.ui.DetailView',
  templates: [
    function toHTML() {/*
      <!-- /CrawableCat.html#{{this.data.id}}<br>
      --><a href="#{{this.data.id}}">{{this.data.name}}</a><br>
    */}
  ]
});


CLASS({
  name: 'CrawableController',
  extendsModel: 'foam.ui.View',
  requires: [ 'CrawableDetailView', 'foam.ui.DAOListView' ],
  exports: [ 'applicationURL', 'applicationIdURL' ],
  properties: [
    {
      name: 'applicationURL'
    },
    {
      name: 'applicationIdURL'
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'CrawableRowView'
      }
    }
  ],
  templates: [
    function toHTML() {/*
      <% if ( window.location.hash ) {
        var view = this.CrawableDetailView.create();
        this.addChild(view);

        var id = window.location.hash.substring(1);
        this.dao.find(id, {put: function(obj) {
          view.data = obj;
        }});

//        window.setTimeout(
//          function() { window.location = self.applicationIdURL + id; },
//          1000);

        return view.toHTML();
      } else { %>
        $$dao
        <%
//        window.setTimeout(
//          function() { window.location = self.applicationURL; },
//          1000);
        %>
      <% } %>
    */}
 ],
  methods: {
    init: function() {
      this.SUPER();
      window.addEventListener('hashchange', function() {
        this.children = [];
        document.body.innerHTML = this.toHTML();
        this.initHTML();
      }.bind(this));
    }
  }
});


CLASS({
  name: 'PhoneCrawableController',
  extendsModel: 'CrawableController',
  properties: [
    { name: 'dao',              defaultValue: phones },
    { name: 'applicationURL',   defaultValue: 'http://localhost:8000/apps/phonecat/Cat.html' },
    { name: 'applicationIdURL', defaultValue: 'http://localhost:8000/apps/phonecat/Cat.html#' }
  ]
});
