CLASS({
  name: 'C',
  properties: [
    'id',
    'c'
  ]
});

CLASS({
  name: 'B',
  properties: [
    'id',
    'b',
    {
      type: 'Array',
      name: 'cs',
      subType: 'C',
      view: 'foam.ui.DAOListView',
      factory: function() { return [C.create({id: 1, c:'c1'})]; }
    }
  ]
});

CLASS({
  name: 'A',
  properties: [
    'id',
    'a',
    {
      name: 'b',
      subType: 'B',
      view: { factory_: 'foam.ui.DetailView', model: B },
      factory: function() { return B.create({id: 1, b:'nested B'}); }
    },
    {
      type: 'Array',
      name: 'bs',
      subType: 'B',
      view: 'foam.ui.DAOListView',
      factory: function() { return [B.create({id: 1, b:'b1'})]; }
    }
  ]
});


var dao = X.lookup('foam.dao.EasyDAO').create({model: 'A', daoType: 'MDAO', seqNo: true});

dao.put(A.create({a: 'a1'}));
//dao.put(A.create({a: 'a2'}));

var view1 = DAOListView.create({dao: dao});
var view2 = DAOListView.create({dao: dao});

document.writeln('<h1>View 1</h1>');
view1.write();

document.writeln('<h1>View 2</h1>');
view2.write();
