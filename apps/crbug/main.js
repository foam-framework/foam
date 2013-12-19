/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// Listen for table selection and go to crbug page
var rowSelection = SimpleValue.create();
rowSelection.addListener(function(_,_,_,issue) {
   document.location = 'https://code.google.com/p/chromium/issues/detail?id=' + issue.id;
});


var altView = createView(rowSelection);

// From: google3/codesite/dit/constants.py
var searchChoice = ChoiceView.create({
  helpText: 'Search within:',
  choices:[
    ["",                            "&nbsp;All issues"],
    ["-status=Closed",              "&nbsp;Open issues"],
    ["owner=me -status=Closed",     "&nbsp;Open and owned by me"],
    ["-status=Closed reporter=me",  "&nbsp;Open and reported by me"],
    ["-status=Closed is:starred",   "&nbsp;Open and starred by me"],
    ["-status=Closed commentby:me", "&nbsp;Open and comment by me"],
    ["status=New",                  "&nbsp;New issues"],
    ["status=Fixed,Done",           "&nbsp;Issues to verify"]
  ]
});

// Set initial value to 'Open issues'
searchChoice.value.set(searchChoice.choices[1][0]);

var searchField = TextFieldView.create({
  name: 'search',
  displayWidth: 90
});

/** Filter data with the supplied predicate, or select all data if null. **/
function search(p) {
  if ( p ) console.log('SEARCH: ', p.toSQL());
  altView.dao = p ? IssueDAO.where(p) : IssueDAO;
}

function performQuery() {
  search(AND(
      CIssueQueryParser.parseString(searchChoice.value.get()) || TRUE,
      CIssueQueryParser.parseString(searchField.value.get()) || TRUE
    ).partialEval());
}

searchChoice.value.addListener(performQuery);
searchField.value.addListener(performQuery);

searchChoice.insertInElement('searchChoice');
searchField.insertInElement('searchField');

altView.write(document);

var syncManager = SyncManager.create({
  srcDAO: IssueNetworkDAO,
  dstDAO: IssueDAO,
  lastModified: new Date(2013,01,01),
  modifiedProperty: CIssue.UPDATED
});

var syncView = ActionBorder.create(SyncManager, DetailView.create({model: SyncManager, value: SimpleValue.create(syncManager)}));
document.writeln(syncView.toHTML());
syncView.initHTML();

var space = Canvas.create({width: 1300, height: 100, background:'#000'});
var graph = Graph.create({x:0, y:0, width:1300, height:100, axisColor:'white', data:[]});
space.addChild(graph);
space.write(document);
 syncManager.propertyValue('timesSynced').addListener(function() { graph.addData(syncManager.lastBatchSize); space.paint(); });
// syncManager.propertyValue('timesSynced').addListener(function() { graph.addData(syncManager.lastSyncDuration); space.paint(); });

var timer = Timer.create({});
var logo = $('logo');
syncManager.propertyValue('isSyncing').addListener(function() {
  if ( syncManager.isSyncing ) {
     timer.step();
     timer.start();
  } else {
     timer.stop();
     altView.view = altView.view;
  }
});

logo.onclick = syncManager.forceSync.bind(syncManager);

/*
timer.propertyValue('i').addListener(function() {
  logo.style.webkitTransform = 'rotate(' + -timer.i + 'deg)';
});
*/
Events.dynamic(function() {
  logo.style.webkitTransform = 'rotate(' + -timer.i + 'deg)';
});
