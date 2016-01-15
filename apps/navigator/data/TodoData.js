var TodoData = [];

arequire('foam.navigator.types.Todo')(function(todoModel) {
  TodoData = JSONUtil.arrayToObjArray(X, [
    {
      // model_: "foam.navigator.types.Todo",
      "id": "Todo:1",
      "lastModified": new Date('Mon Jan 26 2015 20:33:57 GMT-0500 (EST)'),
      "labels": [
        "FOAM",
        "SLICE",
        "web"
      ],
      "name": "Integrate web search",
      "dueDate": new Date('Thu Feb 12 2015 19:00:00 GMT-0500 (EST)'),
      "notes": "Web search results should be intelligently included in FOAM SLICE search results."
    },
    {
      // model_: "foam.navigator.types.Todo",
      "id": "Todo:2",
      "lastModified": new Date('Mon Jan 26 2015 20:42:14 GMT-0500 (EST)'),
      "labels": [
        "FOAM",
        "SLICE",
        "web"
      ],
      "name": "Implement SLICE demo for InnoWeek",
      "priority": 1,
      "dueDate": new Date('Mon Jan 26 2015 19:00:00 GMT-0500 (EST)'),
      "notes": "We need a Googley view of the many-types/one-interface work we have been doing for SLICE'able FOAM models.",
      "done": true
    },
    {
      // model_: "foam.navigator.types.Todo",
      "id": "Todo:3",
      "lastModified": new Date('Mon Jan 26 2015 20:43:45 GMT-0500 (EST)'),
      "labels": [
        "FOAM",
        "Chrome"
      ],
      "name": "Implement Chrome.fileSystem DAO",
      "dueDate": new Date('Thu Jan 29 2015 19:00:00 GMT-0500 (EST)'),
      "notes": "We already have one app that uses chrome.fileSystem in a one-off sort of way. We should build a DAO for managing this more cleanly in the Chrome App space."
    },
    {
      // model_: "foam.navigator.types.Todo",
      "id": "Todo:4",
      "lastModified": new Date('Mon Jan 26 2015 20:46:08 GMT-0500 (EST)'),
      "labels": [
        "personal"
      ],
      "name": "Gas & Groceries",
      "priority": 2,
      "dueDate": new Date('Thu Jan 22 2015 19:00:00 GMT-0500 (EST)'),
      "notes": "Buy gas and pick up groceries on the way home tonight.\u000a\u000aGrocery list:\u000a- Eggs\u000a- Spinach\u000a- Bread\u000a- Diced tomatoes\u000a- Avocado\u000a- Apples\u000a- Something for dessert",
      "done": true
    },
    {
      // model_: "foam.navigator.types.Todo",
      "id": "Todo:5",
      "lastModified": new Date('Mon Jan 26 2015 20:47:52 GMT-0500 (EST)'),
      "labels": [
        "FOAM",
        "i18n",
        "Calc"
      ],
      "name": "Prepare Calc messages for translation",
      "dueDate": new Date('Sat Jan 24 2015 19:00:00 GMT-0500 (EST)'),
      "done": true
    },
    {
      // model_: "foam.navigator.types.Todo",
      "id": "Todo:6",
      "lastModified": new Date('Mon Jan 26 2015 20:49:49 GMT-0500 (EST)'),
      "labels": [
        "personal",
        "finance"
      ],
      "name": "Finish reimbursement paperwork",
      "dueDate": new Date('Tue Jan 27 2015 19:00:00 GMT-0500 (EST)'),
      "notes": "Still need to sign a few things to finalize expense report for reimbursement."
    }
  ], todoModel);
});
