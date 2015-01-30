CLASS({
   "model_": "Model",
   "id": "com.google.mail.FOAMGMailLabel",
   "package": "com.google.mail",
   "name": "FOAMGMailLabel",
   "extendsModel": "com.google.mail.GMailLabel",
   "requires": [],
   "imports": [],
   "exports": [],
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
         "name": "type",
         "help": "The owner type for the label. User labels are created by the user and can be modified and deleted by the user and can be applied to any message or thread. System labels are internally created and cannot be added, modified, or deleted. System labels may be able to be applied to or removed from messages and threads under some circumstances but this is not guaranteed. For example, users can apply and remove the INBOX and UNREAD labels from messages and threads, but cannot apply or remove the DRAFTS or SENT labels from messages or threads."
      },
      {
         "model_": "StringProperty",
         "name": "name",
         "postSet": function (_, nu) {
        if ( this.type === 'system' && this.LABELS[nu] )
          this.label = this.LABELS[nu];
      },
         "help": "The display name of the label."
      },
      {
         "model_": "Property",
         "name": "label",
         "defaultValueFn": function () { return this.name; }
      },
      {
         "model_": "Property",
         "name": "iconUrl",
         "view": "ImageView",
         "defaultValueFn": function () {
        if ( this.ICONS[this.name] ) return this.ICONS[this.name];
        return 'icons/ic_label_black_24dp.png';
      }
      }
   ],
   "actions": [],
   "constants": [
      {
         "model_": "Constant",
         "name": "LABELS",
         "value":          {
                        "INBOX": "Inbox",
            "STARRED": "Starred",
            "DRAFT": "Drafts",
            "SENT": "Sent",
            "SPAM": "Spam",
            "TRASH": "Trash",
            "CATEGORY_FORUMS": "Forums",
            "CATEGORY_PERSONAL": "Personal",
            "CATEGORY_PROMOTIONS": "Promotions",
            "CATEGORY_SOCIAL": "Social",
            "CATEGORY_UPDATES": "Updates",
            "IMPORTANT": "Priority Inbox"
         }
      },
      {
         "model_": "Constant",
         "name": "ICONS",
         "value":          {
                        "INBOX": "icons/ic_inbox_black_24dp.png",
            "STARRED": "icons/ic_star_black_24dp.png",
            "DRAFT": "icons/ic_drafts_black_24dp.png",
            "SENT": "icons/ic_send_black_24dp.png",
            "SPAM": "icons/ic_report_black_24dp.png",
            "TRASH": "icons/ic_delete_black_24dp.png",
            "IMPORTANT": "icons/ic_priority_inbox_black_24dp.png"
         }
      }
   ],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
