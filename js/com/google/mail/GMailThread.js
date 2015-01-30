CLASS({
   "model_": "Model",
   "id": "com.google.mail.GMailThread",
   "package": "com.google.mail",
   "name": "GMailThread",
   "plural": "threads",
   "properties": [
      {
         "model_": "StringProperty",
         "name": "historyId",
         "help": "The ID of the last history record that modified this thread."
      },
      {
         "model_": "StringProperty",
         "name": "id",
         "help": "The unique ID of the thread."
      },
      {
         "model_": "ReferenceArrayProperty",
         "name": "messages",
         "help": "The list of messages in the thread.",
         "subType": "Message",
         "subKey": ".ID"
      },
      {
         "model_": "StringProperty",
         "name": "snippet",
         "help": "A short part of the message text."
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
