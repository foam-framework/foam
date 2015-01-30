CLASS({
   "model_": "Model",
   "id": "com.google.mail.GMailLabel",
   "package": "com.google.mail",
   "name": "GMailLabel",
   "plural": "labels",
   "properties": [
      {
         "model_": "StringProperty",
         "name": "id",
         "help": "The immutable ID of the label."
      },
      {
         "model_": "StringProperty",
         "name": "labelListVisibility",
         "help": "The visibility of the label in the label list in the Gmail web interface."
      },
      {
         "model_": "StringProperty",
         "name": "messageListVisibility",
         "help": "The visibility of the label in the message list in the Gmail web interface."
      },
      {
         "model_": "StringProperty",
         "name": "name",
         "help": "The display name of the label."
      },
      {
         "model_": "StringProperty",
         "name": "type",
         "help": "The owner type for the label. User labels are created by the user and can be modified and deleted by the user and can be applied to any message or thread. System labels are internally created and cannot be added, modified, or deleted. System labels may be able to be applied to or removed from messages and threads under some circumstances but this is not guaranteed. For example, users can apply and remove the INBOX and UNREAD labels from messages and threads, but cannot apply or remove the DRAFTS or SENT labels from messages or threads."
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
