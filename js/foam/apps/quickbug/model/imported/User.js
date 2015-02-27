CLASS({
  "model_": "Model",
  "name": "User",
  "package": "foam.apps.quickbug.model.imported",
  "tableProperties": [
    "id",
    "kind",
    "projects"
  ],
  "properties": [
    {
      "model_": "StringProperty",
      "name": "id",
      "help": "User identifier."
    },
    {
      "model_": "StringProperty",
      "name": "kind",
      "help": "User on Google Code Project Hosting."
    },
    {
      "model_": "ArrayProperty",
      "name": "projects",
      "help": "Projects of which this user is a member.",
      "subType": "Project"
    }
  ]
});
