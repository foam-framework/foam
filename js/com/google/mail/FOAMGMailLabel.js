/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
   "package": "com.google.mail",
   "name": "FOAMGMailLabel",
   "extends": "com.google.mail.GMailLabel",
   "requires": [],
   "imports": [],
   "exports": [],
   "properties": [
      {
         type: 'String',
         "name": "id",
         "help": "The immutable ID of the label."
      },
      {
         type: 'String',
         "name": "labelListVisibility",
         "help": "The visibility of the label in the label list in the Gmail web interface."
      },
      {
         type: 'String',
         "name": "messageListVisibility",
         "help": "The visibility of the label in the message list in the Gmail web interface."
      },
      {
         type: 'String',
         "name": "type",
         "help": "The owner type for the label. User labels are created by the user and can be modified and deleted by the user and can be applied to any message or thread. System labels are internally created and cannot be added, modified, or deleted. System labels may be able to be applied to or removed from messages and threads under some circumstances but this is not guaranteed. For example, users can apply and remove the INBOX and UNREAD labels from messages and threads, but cannot apply or remove the DRAFTS or SENT labels from messages or threads."
      },
      {
         type: 'String',
         "name": "name",
         "postSet": function (_, nu) {
        if ( this.type === 'system' && this.LABELS[nu] )
          this.label = this.LABELS[nu];
      },
         "help": "The display name of the label."
      },
      {
         model_: "Property",
         "name": "label",
         "defaultValueFn": function () { return this.name; }
      },
      {
         model_: "Property",
         "name": "iconUrl",
         "view": "foam.ui.ImageView",
         "defaultValueFn": function () {
        if ( this.ICONS[this.name] ) return this.ICONS[this.name];
        return 'icons/ic_label_black_24dp.png';
      }
      }
   ],
   "actions": [],
   "constants": [
      {
         model_: "Constant",
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
         model_: "Constant",
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
