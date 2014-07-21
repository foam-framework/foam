/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var partitions = [
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue}),
  WorkerDAO.create({model: Issue})
];
var dao = PartitionDAO.create({partitions: partitions});

var arraydao = [];
var idao = MDAO.create({ model: Issue });

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
