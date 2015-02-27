CLASS({
   "name": "ProjectIssueConfig",
   "package": "foam.apps.quickbug.model.imported",
   "tableProperties": [
      "defaultColumns",
      "defaultPromptForMembers",
      "defaultPromptForNonMembers",
      "defaultSorting",
      "kind",
      "labels",
      "prompts",
      "restrictToKnown",
      "statuses",
      "usersCanSetLabels"
   ],
   "properties": [
      {
         "model_": "StringArrayProperty",
         "name": "defaultColumns",
         "help": "Default column ordering defined for this project."
      },
      {
         "model_": "IntProperty",
         "name": "defaultPromptForMembers",
         "help": "Index into the prompts list of the default prompt for project members."
      },
      {
         "model_": "IntProperty",
         "name": "defaultPromptForNonMembers",
         "help": "Index into the prompts list of the default prompt for non-project-members."
      },
      {
         "model_": "StringArrayProperty",
         "name": "defaultSorting",
         "help": "Default sort specification defined for this project."
      },
      {
         "model_": "StringProperty",
         "name": "kind",
         "help": "Issue tracker configuration for a project."
      },
      {
         "model_": "ArrayProperty",
         "name": "labels",
         "help": "Pre-defined issue labels configured for this project, e.g., \"Type-Defect\", \"Priority-Medium\", etc."
      },
      {
         "model_": "ArrayProperty",
         "name": "prompts",
         "help": "Pre-defined issue prompts configured for this project, e.g., \"User defect report\", \"Review request\", etc."
      },
      {
         "model_": "BooleanProperty",
         "name": "restrictToKnown",
         "help": "Whether or not the project restricts issue labels and statuses to the pre-defined values."
      },
      {
         "model_": "ArrayProperty",
         "name": "statuses",
         "help": "Pre-defined issue statuses configured for this project, e.g., \"New\", \"Accepted\", etc."
      },
      {
         "model_": "BooleanProperty",
         "name": "usersCanSetLabels",
         "help": "Whether non-project-members can set labels on new issues."
      }
   ]
});
