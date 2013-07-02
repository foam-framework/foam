var searchField = TextFieldView.create({
   name: 'search',
   displayWidth: 90
});
searchField.insertInElement('searchField');

EMail.ATTACHMENTS.compare = function(o1, o2) {
   return this.f(o1).length - this.f(o2).length;
};

var footer = $('footer');
var search = $('search');
var browse = $('browse');
var edit   = $('edit');

function pos(e, top, left, width, height) {
   var s = e.style;
   left = left || 0;

   top != null && (e.style.top = toNum(top) + 'px');
   left != null && (e.style.left = toNum(left) + 'px');
   width != null && (e.style.width = toNum(width) + 'px');
   height != null && (e.style.height = toNum(height) + 'px');
}

var MIN_THREE_COLUMN_W = 1600;
var table;

function layout() {
   var W         = window.innerWidth - 15;
   var H         = window.innerHeight-5;
   var HEADER_H  = 85;
   var FOOTER_H  = 20;
   var SEARCH_W  = 180;
   var SEARCH_H  = H - HEADER_H - FOOTER_H;
   var RIGHT_W   = W - SEARCH_W - 5;

   //  pos(header,null,null,W,HEADER_H-10);
   pos(search, HEADER_H, null, SEARCH_W, SEARCH_H);

   if ( W > MIN_THREE_COLUMN_W ) {
      pos(browse, HEADER_H, SEARCH_W + 10, RIGHT_W * 0.6, SEARCH_H+70); // ??? Why is the 70 needed
      pos(edit, HEADER_H, SEARCH_W + 10 + RIGHT_W * 0.6, RIGHT_W * 0.4-10, SEARCH_H-15);
   } else {
      pos(browse, HEADER_H, SEARCH_W + 10, RIGHT_W, SEARCH_H/2);
      pos(edit,
          toNum(browse.style.top) + toNum(browse.style.height) + 5,
          SEARCH_W + 10,
          RIGHT_W-10,
          SEARCH_H / 2 -20);
   }
   pos(footer, H-FOOTER_H, null, W, FOOTER_H);

   table && table.layout();
}

window.onresize = layout;

emails = IndexedDBDAO.create({model: EMail});

var dao = IDAO.create({model: EMail});
dao.addIndex(EMail.TIMESTAMP);
// dao.addIndex(EMail.CONV_ID);
dao.addIndex(EMail.TO);
// dao.addIndex(EMail.FROM);
dao.addIndex(EMail.SUBJECT);

dao = CachingDAO.create(dao, emails);

table = ScrollBorder.create({
   view: TableView2.create({
      model: EMail,
      dao: dao,
      rows: 20
   }),
   dao: dao
});
table.insertInElement('browse');

layout();

table.view.selection.addListener(function (src, property, oldValue, newValue) {
   if ( ! newValue ) return;

   var editView = SummaryView.create(table.view.selection);
   editView.model = EMail;
   edit.innerHTML = editView.toHTML();
   editView.initHTML();
});

//    table.view.selection.set(table.view.objs[0]);

var queryParser = QueryParserFactory(EMail);

function performQuery() {
   console.log('********************************* query: ', searchField.value.get());
   var predicate =
      (queryParser.parseString(searchField.value.get()) || TRUE)
      .partialEval();;

   console.log('query: ', predicate.toSQL());

   table.scrollbar.value = 0;

   table.view.model = EMail;
   table.dao = dao.where(predicate);
}

searchField.value.addListener(performQuery);

layout();

