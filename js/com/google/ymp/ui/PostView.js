/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.ymp.ui',
  name: 'PostView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ymp.ui.ColorPicker',
    'com.google.ymp.ui.DynamicImageLoader',
    'com.google.ymp.bb.Reply',
    'foam.u2.DAOCreateController',
  ],
  imports: [
    'location',
    'encodeURIComponent',
    'replyDAO',
    'currentUser',
  ],
  exports: [
    'as self',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( nu ) {
          this.replies = this.replyDAO.where(EQ(this.Reply.PARENT_POST, nu.id))
            .orderBy(this.Reply.getPrototype().CREATION_TIME);
        }
      }
    },
    {
      type: 'foam.core.types.DAO',
      name: 'replies',
      toPropertyE: 'foam.u2.DAOListView',
    },
    {
      type: 'String',
      name: 'whatsAppLink',
      dynamicValue: function() {
        return 'whatsapp://send?text=' + this.encodeURIComponent(
            '"' + this.data.title + '" ' + this.location.href);
      },
    },
  ],

  actions: [
    {
      name: 'replyButton',
      ligature: 'reply',
      code: function() {
        this.X.stack.pushView(
          this.DAOCreateController.create({
            model: this.Reply,
            data: this.Reply.create({
              id: createGUID(),
              author: this.currentUser.id,
              parentPost: this.data.id,
              market: this.data.market,
            }),
            dao: this.replyDAO,
          }, this.Y.sub({
            data: null
          })));
      }
    },
    {
      name: 'sendButton',
      ligature: 'send',
      code: function() {},
    },
  ],

  templates: [
    function initE() {/*#U2
      <div class="^">
        <div class="^flex-col">
          <:image width="100%" />
          <div class="^content">{{ this.data.content$ }}</div>
          <div class="^author">Posted by&nbsp;<:author /></div>
          <div class="^separator"></div>
          <div><:contact /></div>
          <div class="^separator"></div>
          <div class="^flex-row">
            <div class="^reply-title">Replies</div>
            <div>

              <a href={{this.whatsAppLink$}} style="color:#000">
                <i class="material-icons-extended" style="font-size: 24px; color: currentColor">send</i></a>
              <self:replyButton />
            </div>
          </div>
          <self:replies />
        </div>
      </div>
    */},
    function CSS() {/*
      ^ {
        overflow-y: hidden;
      }
      ^flex-col {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      ^author {
        text-align: right;
        margin-bottom: 4px;
        opacity: 0.54;
        padding: 8px;
      }
      ^separator {
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 4px;
      }
      ^content {
        padding: 8px;
      }
      ^reply-title {
        margin: 8px;
        font-size: 20px;
        color: rgba(0,0,0,0.54);
      }
      ^flex-row {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        justify-content: space-between;
      }
    */},
  ]
});
