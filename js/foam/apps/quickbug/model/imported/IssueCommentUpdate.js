CLASS({
  "model_": "Model",
  "name": "IssueCommentUpdate",
  "package": "foam.apps.quickbug.model.imported",
  "tableProperties": [
    "blockedOn",
    "blocking",
    "cc",
    "kind",
    "labels",
    "mergedInto",
    "owner",
    "status",
    "summary"
  ],
  "properties": [
    {
      "model_": "StringArrayProperty",
      "name": "blockedOn",
      "help": "Changes made to the list of issues blocked on this issue."
    },
    {
      "model_": "StringArrayProperty",
      "name": "blocking",
      "help": "Changes made to the list of issues blocking this issue."
    },
    {
      "model_": "StringArrayProperty",
      "name": "cc",
      "help": "Changes made to the issue's cc list."
    },
    {
      "model_": "StringProperty",
      "name": "kind",
      "help": "Metadata updates made as part of a comment."
    },
    {
      "model_": "StringArrayProperty",
      "name": "labels",
      "help": "Changes made to the issue's labels."
    },
    {
      "model_": "StringProperty",
      "name": "mergedInto",
      "help": "ID of the issue this issue has been merged into."
    },
    {
      "model_": "StringProperty",
      "name": "owner",
      "help": "Updated owner of the issue."
    },
    {
      "model_": "StringProperty",
      "name": "status",
      "help": "Updated status of the issue."
    },
    {
      "model_": "StringProperty",
      "name": "summary",
      "help": "Updated summary of the issue."
    }
  ]
});
