CLASS({
  "model_": "Model",
  "name": "Project",
  "package": "foam.apps.quickbug.model.imported",
  "tableProperties": [
    "description",
    "domain",
    "externalId",
    "htmlLink",
    "issuesConfig",
    "kind",
    "labels",
    "members",
    "name",
    "repositoryUrls",
    "role",
    "summary",
    "versionControlSystem"
  ],
  "properties": [
    // Moved to first spot to make the id
    {
      "model_": "StringProperty",
      "name": "externalId",
      "help": "Single string identifier of the project, encoding the name and domain."
    },
    {
      "model_": "StringProperty",
      "name": "description",
      "help": "Description of the project."
    },
    {
      "model_": "StringProperty",
      "name": "domain",
      "help": "Domain in which this project exists."
    },
    {
      "model_": "StringProperty",
      "name": "htmlLink",
      "help": "URL of the project home page."
    },
    {
      "model_": "ReferenceProperty",
      "name": "issuesConfig",
      "help": "Information about how issues are handled for this project.",
      "subType": "ProjectIssueConfig"
    },
    {
      "model_": "StringProperty",
      "name": "kind",
      "help": "Project hosted by Google Code Project Hosting."
    },
    {
      "model_": "StringArrayProperty",
      "name": "labels",
      "help": "Labels that have been applied to this project by the project's owners."
    },
    {
      "model_": "StringArrayProperty",
      "name": "members",
      "help": "List of members of this project."
    },
    {
      "model_": "StringProperty",
      "name": "name",
      "help": "Name of the project."
    },
    {
      "model_": "StringArrayProperty",
      "name": "repositoryUrls",
      "help": "URLs where the source for the project can be checked out."
    },
    {
      "model_": "StringProperty",
      "name": "role",
      "help": "The user's role in the project, if there is one."
    },
    {
      "model_": "StringProperty",
      "name": "summary",
      "help": "Short summary of the project."
    },
    {
      "model_": "StringProperty",
      "name": "versionControlSystem",
      "help": "Version control system used by the project."
    }
  ]
});
