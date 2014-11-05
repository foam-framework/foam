MODEL({
  name: 'C',
  properties: [
    'id',
    'c'
  ]
});

MODEL({
  name: 'B',
  properties: [
    'id',
    'b',
    {
      model_: 'ArrayProperty',
      name: 'cs',
      subType: 'C',
      view: 'DAOListView',
      factory: function() { return [C.create({id: 1, c:'c1'})]; }
    }
  ]
});

MODEL({
  name: 'A',
  properties: [
    'id',
    'a',
    {
      name: 'b',
      subType: 'B',
      view: { factory_: 'DetailView', model: B },
      factory: function() { return B.create({id: 1, b:'nested B'}); }
    },
    {
      model_: 'ArrayProperty',
      name: 'bs',
      subType: 'B',
      view: 'DAOListView',
      factory: function() { return [B.create({id: 1, b:'b1'})]; }
    }
  ]
});


var dao = EasyDAO.create({model: 'A', daoType: 'MDAO', seqNo: true});

dao.put(A.create({a: 'a1'}));
//dao.put(A.create({a: 'a2'}));

var view1 = DAOListView.create({dao: dao});
var view2 = DAOListView.create({dao: dao});

document.writeln('<h1>View 1</h1>');
view1.write(document);

document.writeln('<h1>View 2</h1>');
view2.write(document);
