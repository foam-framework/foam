CLASS({
   "model_": "Model",
   "id": "com.google.mail.GMailDraft",
   "package": "com.google.mail",
   "name": "GMailDraft",
   "plural": "drafts",
   "properties": [
      {
         "model_": "StringProperty",
         "name": "id",
         "help": "The immutable ID of the draft."
      },
      {
         "model_": "Property",
         "name": "message",
         "subType": "Message",
         "help": "The message content of the draft."
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
