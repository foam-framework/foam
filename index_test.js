/*
var OrderedMap = {
  create: function(prop) {
    return {
      __proto__: this,
      root: undefined,
      index: TreeIndex.create(prop)
    };
  },

  bulkLoad: function(a) { this.root = this.index.bulkLoad(a); },
  putObject: function(value) { this.root = this.index.put(this.root, value); },
  put: function(key, value) { this.root = this.index.putKeyValue(this.root, key, value); },
  get: function(key) { return this.index.get(this.root, key); },
  select: function(sink) { this.index.select(this.root, sink); },
  selectReverse: function(sink) { this.index.selectReverse(this.root, sink); },
  size: function() { return this.index.size(this.root); }
};
*/


if ( false ) {

var m = OrderedMap.create({compare: StringComparator, f: function(x) { return x;}});

console.log('\nOrderedSet Test');
m.putObject('k');
m.putObject('e');
m.putObject('v');
m.putObject('i');
m.putObject('n');
m.putObject('kevin');
m.putObject('greer');
m.putObject('was');
m.putObject('here');
m.putObject('boo');

m.select(console.log);

console.log(m.get('kevin'));
m.put('kevin', 'greer');
console.log(m.get('kevin'));


console.log('\nOrderedSet BulkLoad Test');
m = OrderedMap.create({compare: StringComparator, f: function(x) { return x;}});

m.bulkLoad('kxeyvizngdrwfash'.split(''));

m.select(console.log);

}

if ( false ) {

console.log('\nIDAO Test');

var d = IDAO.create({model:Issue});

// d.index = AltIndex.create(TreeIndex.create(Issue.SEVERITY));

/*
d.index = AltIndex.create(TreeIndex.create(Issue.STATUS, TreeIndex.create(Issue.ID)));
d.root = undefined;
*/

d.put(Issue.create({id:1, severity:'Minor',   status:'Open'}));
d.put(Issue.create({id:2, severity:'Major',   status:'Closed'}));
d.put(Issue.create({id:3, severity:'Feature', status:'Accepted'}));
d.put(Issue.create({id:4, severity:'Minor',   status:'Closed'}));
d.put(Issue.create({id:5, severity:'Major',   status:'Accepted'}));
d.put(Issue.create({id:6, severity:'Feature', status:'Open'}));

var sink = {
  put: function(i) {
    console.log(i && i.id, i && i.severity, i && i.status);
  }
};

console.log('\nDefault Order');
d.select(sink);

console.log('\nLimit Order');
d.skip(2).limit(2).select(sink);

d.where(EQ(Issue.ID, 2)).select(sink);

// This causes the DAO's tree to rebalance itself. Cool!
// d.bulkLoad(d);

d.addIndex(Issue.SEVERITY);
d.addIndex(Issue.STATUS);


console.log('\nBy Severity');
d.orderBy(Issue.SEVERITY).select(sink);

console.log('\nBy Status');
d.orderBy(Issue.STATUS).select(sink);


console.log('\nWhere Closed');
d.where(EQ(Issue.STATUS, 'Closed')).select(sink);

console.log('\nWhere Major');
d.where(EQ(Issue.SEVERITY, 'Major')).select(sink);

console.log('\nWhere Open');
d.where(EQ(Issue.STATUS, 'Open')).select(sink);

console.log('\nMissing Key');
d.where(EQ(Issue.STATUS, 'XXX')).select(sink);

}
