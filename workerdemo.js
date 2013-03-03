var partitions = [
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue})
];
var dao = PartitionDAO.create({partitions: partitions});

var arraydao = [];
var idao = IDAO.create({ model: Issue });

idao.addIndex(Issue.SEVERITY);
idao.addIndex(Issue.ASSIGNED_TO);
idao.addIndex(Issue.STATUS);

var severities = [
  "Minor",
  "Major",
  "Feature",
  "Question"
];

var assignee = [
  "kgr",
  "adamvy",
  "alice",
  "bob"
];

var statuses = [
  "Open",
  "Accepted",
  "Complete",
  "Closed"
];

for (var j = 0; j < 10; j++) {
  for (var k = 0; k < 200; k++) {
    var id = j * 1000 + k;
    var issue = Issue.create({
      id: id,
      severity: severities[Math.floor(Math.random() * severities.length)],
      assignedTo: assignee[Math.floor(Math.random() * assignee.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });

    dao.put(issue);
    idao.put(issue);
    arraydao.put(issue);
  }
}


function benchmark(sink, dao) {
  var totaltime = 0;
  var starttime = 0;
  var endtime = 0;
  arepeat(
      1000,
      function(ret) {
        starttime = Date.now();
        dao.select(sink)(function(sink){
          endtime = Date.now();
          totaltime += endtime - starttime;
          ret();
        });
      })(function() {
        console.log('average: ', totaltime / 1000, "ms");
      });
}
