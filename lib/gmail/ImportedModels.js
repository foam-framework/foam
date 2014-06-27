FOAModel({
   "model_": "Model",
   "name": "GMailDraft",
   "plural": "drafts",
   "tableProperties": [
      "id",
      "message"
   ],
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
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});

FOAModel({
   "model_": "Model",
   "name": "GMailHistory",
   "plural": "history",
   "tableProperties": [
      "id",
      "messages"
   ],
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
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});

FOAModel({
   "model_": "Model",
   "name": "GMailLabel",
   "plural": "labels",
   "tableProperties": [
      "id",
      "labelListVisibility",
      "messageListVisibility",
      "name",
      "type"
   ],
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
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});

FOAModel({
   "model_": "Model",
   "name": "GMailMessage",
   "plural": "messages",
   "tableProperties": [
      "historyId",
      "id",
      "labelIds",
      "payload",
      "raw",
      "sizeEstimate",
      "snippet",
      "threadId"
   ],
   "properties": [
      {
         "model_": "StringProperty",
         "name": "historyId",
         "help": "The ID of the last history record that modified this message."
      },
      {
         "model_": "StringProperty",
         "name": "id",
         "help": "The immutable ID of the message."
      },
      {
         "model_": "StringArrayProperty",
         "name": "labelIds",
         "help": "List of IDs of labels applied to this message."
      },
      {
         "model_": "Property",
         "name": "payload",
         "subType": "MessagePart",
         "help": "The parsed email structure in the message parts."
      },
      {
         "model_": "StringProperty",
         "name": "raw",
         "help": "The entire email message in an RFC 2822 formatted string. Returned in messages.get and drafts.get responses when the format=RAW parameter is supplied."
      },
      {
         "model_": "IntProperty",
         "name": "sizeEstimate",
         "help": "Estimated size in bytes of the message."
      },
      {
         "model_": "StringProperty",
         "name": "snippet",
         "help": "A short part of the message text."
      },
      {
         "model_": "StringProperty",
         "name": "threadId",
         "help": "The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met: \u000a- The requested threadId must be specified on the Message or Draft.Message you supply with your request. \u000a- The References and In-Reply-To headers must be set in compliance with the <a href=\"https://tools.ietf.org/html/rfc2822\"RFC 2822 standard. \u000a- The Subject headers must match."
      }
   ],
   "actions": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});

FOAModel({
   "model_": "Model",
   "name": "GMailThread",
   "plural": "threads",
   "tableProperties": [
      "historyId",
      "id",
      "messages",
      "snippet"
   ],
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
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
