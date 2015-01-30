CLASS({
   "model_": "Model",
   "id": "com.google.mail.GMailHistory",
   "package": "com.google.mail",
   "name": "GMailHistory",
   "plural": "history",
   "properties": [
      {
         "model_": "StringProperty",
         "name": "id",
         "help": "The mailbox sequence ID."
      },
      {
         "model_": "ReferenceArrayProperty",
         "name": "messages",
         "help": "The messages that changed in this history record.",
         "subType": "Message",
         "subKey": ".ID"
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
