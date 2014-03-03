/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
EMail.ATTACHMENTS.tableLabel = '<img src="images/paperclip.gif">';

var menu = ToolbarView.create({
  horizontal: false,
});
menu.addActions(FOAM([
   {
      model_: 'Action',
      name: 'newWindow',
      help: 'Open a new Saturn Mail client.',
      action: function () {
         launchController();
      }
   },
   {
      model_: 'Action',
      name: 'syncConfig',
      help: 'View and/or update configuration.',
      action: function () {
         openSettings();
      }
   },
   {
      model_: 'Action',
      name: 'contacts',
      help: 'Manage contacts.',
      action: function () {
         console.log('contacts');
         launchContactController();
      }
   },
   {
      model_: 'Action',
      name: 'labels',
      help: 'Manage labels.',
      action: function () {
         console.log('labels');
      }
   }
]));

var actions = FOAM([
   {
      model_: 'Action',
      name: 'compose',
      label: '',
      help: 'Compose a new email.',
      action: function () {
         aseq(arequire('QuickEMailView'),
           arequire('QuickCompose'),
           arequire('LinkView'),
           arequire('RichTextView'),
           arequire('ContactListTileView'),
           arequire('AutocompleteListView'))(function() {
             var forwardedMail = EMail.create({
                from: ME,
                id: Math.floor(Math.random() * 0xffffff).toVarintString()
             });
             var compose = QuickCompose.create({
               email: forwardedMail,
             });
             stack.pushView(compose);
           });
      }
   }
]).concat(EMail.actions);

actions[0].iconUrl = 'images/pencil.png';

EMail.REPLY.iconUrl = 'images/reply.svg';
EMail.REPLY_ALL.iconUrl = 'images/reply_all.svg';
EMail.FORWARD.iconUrl = 'images/forward.svg';
EMail.STAR.iconUrl = 'images/star_full_large.svg';
EMail.ARCHIVE.iconUrl = 'images/archive.svg';
EMail.SPAM.iconUrl = 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><polygon points="7.101,17 3,12.899 3,7.1 7.101,3 12.899,3 17,7.1 17,12.899 12.899,17 "/><circle fill="#F2F2F2" cx="10" cy="12.999" r="1.05"/><polygon fill="#F2F2F2" points="9,6 11,6 10.65,11 9.35,11 "/><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';
EMail.TRASH.iconUrl = 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><polygon points="11.997,4 11.997,3 8.003,3 8.003,4 4,4 4,6 16,6 16,4 "/><rect x="5" y="7" width="10" height="11"/><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';

// remove 'Send' action
actions.splice(1,1);

actions.forEach(function(a) { a.showLabel = false; });


/** Modify the default QueryParser so that label ids are looked up in the EMailLabels DAO. **/
var queryParser = {
  __proto__: QueryParserFactory(EMail),

  id: sym('string'),

  labelMatch: seq(alt('label','l'), alt(':', '='), sym('valueList'))
}.addActions({
  id: function(v) {
     return OR(
        CONTAINS_IC(EMail.SUBJECT, v),
        CONTAINS_IC(EMail.BODY, v));
  },

  labelMatch: function(v) {
    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      EMailLabels.where(EQ(EMailLabel.DISPLAY_NAME, values[i])).select({put:function(el) {
         or.args.push(EQ(EMail.LABELS, el.id));
      }});
    }
    return or;
  }
});

queryParser.expr = alt(
  sym('labelMatch'),
  queryParser.export('expr')
);

var LabelChoiceRenderer = {
  __proto__: ListChoiceViewRenderer,
  choice: function(name, c, autoId, index, isCurrentSelection) {
    var icon = '<img src=\'' + this.getIconUrl(c) + '\' />';
    return '<li id="' + autoId + '" name="' + name + '"' +
        (isCurrentSelection ? ' class="' + this.selectedCssClass + '"' : '') +
        ' value="' + index + '">' +
        icon + c.n.toString() + '</li>';
  },
  getIconUrl: function(c) {
    var SystemLabels = EMailLabel.getPrototype().SystemLabels;
    switch(c.o.displayName) {
      case SystemLabels.INBOX:   return 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><path d="M16,5H4C3.449,5,3.002,5.449,3,6v8c0,0.553,0.447,1,1,1h12c0.553,0,1-0.447,1-1V6C16.998,5.449,16.55,5,16,5z"/><path fill="#FFFFFF" d="M10,11.037c-0.105,0-0.209-0.032-0.297-0.098L4.103,6.803c-0.222-0.164-0.269-0.479-0.104-0.7 s0.476-0.27,0.699-0.104L10,9.916l5.302-3.918c0.225-0.165,0.535-0.117,0.7,0.104c0.164,0.222,0.117,0.536-0.104,0.7l-5.601,4.137 C10.209,11.005,10.104,11.037,10,11.037z"/><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';
      case SystemLabels.SENT:    return 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><path d="M12,11.553C7.392,11.484,5.163,12.756,4,16c0-4.188,3.168-8.043,8-8.641V4l6,5.5L12,15V11.553z"/><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';
      case SystemLabels.SPAM:    return 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><polygon points="7.101,17 3,12.899 3,7.1 7.101,3 12.899,3 17,7.1 17,12.899 12.899,17 "/><circle fill="#F2F2F2" cx="10" cy="12.999" r="1.05"/><polygon fill="#F2F2F2" points="9,6 11,6 10.65,11 9.35,11 "/><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';
      case SystemLabels.STARRED: return 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><g><polygon points="10.5,5 11.711,9.201 16,9.201 12.5,11.764 13.899,16 10.5,13.291 7.101,16 8.5,11.764 5,9.201 9.289,9.201  "/></g><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';
      case SystemLabels.TRASH:   return 'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="21px" height="21px" viewBox="0 0 21 21" overflow="visible" enable-background="new 0 0 21 21" xml:space="preserve"><defs></defs><polygon points="11.997,4 11.997,3 8.003,3 8.003,4 4,4 4,6 16,6 16,4 "/><rect x="5" y="7" width="10" height="11"/><rect opacity="0" fill="#4387FD" width="21" height="21"/></svg>';
    }
    var char = c.n.charAt(0).toUpperCase();
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10px" height="10px" viewBox="0 0 10 10"><text style="font-size:10px;font-weight:bold;fill:#000000;font-family:Serif;" x="5" y="10" text-anchor="middle">' + char + '</text></svg>';
  }
};

EMail.ATTACHMENTS.compare = function(o1, o2) {
   return this.f(o1).length - this.f(o2).length;
};

var MIN_SEARCH_W = 40;

// TODO: I would rather have the default semantics be to open a window and then have that
// revert to a stack in situations where it is necessary.
var stack = {
  openWindow: function(view, width, height, opt_cb) {
     var self = this;
     chrome.app.window.create('empty.html', {width: width, height: height}, function(w) {
       w.contentWindow.onload = function() {
         self.window = w.contentWindow;
         $addWindow(w.contentWindow);
         view.window = w.contentWindow;
         self.window.document.body.innerHTML = view.toHTML();
         view.initHTML();
         w.focus();
         opt_cb && opt_cb(self.window);
       };
       w.onClosed.addListener(function() {
         $removeWindow(self.window);
       });
     });
  },
  pushView: function(view, name, cb) {
     // this.window = window.open('','','width=700,height=600');
     this.openWindow(view, 900, 800, cb);
  },
  back: function() {
    this.window.close();
    this.window = undefined;
  },
  setPreview: function() {
    /* nop */
  }
};

function openMenu(e) {
  var doc = e.toElement.ownerDocument;
  menu.document = doc;
  menu.left = doc.body.clientWidth - 162;
  menu.top = 15;
  menu.openAsMenu();
}

function openSettings() {
  var detailView = DetailView.create({
    model: emsAgent.model_
  });
  detailView.value.set(emsAgent);

  var actionBorder = ActionBorder.create(emsAgent.model_, detailView);
  stack.pushView(actionBorder);

}

function launchController(_, callback) {
  // TODO: set real query strings
  // TODO: have actions or DAO decorator remove emails from Inbox
  // when marked as Spam, Archive, Trash, etc.
  var searchChoice = ListChoiceView.create({
    choicesDao: EMailLabels,
    displayNameProperty: { f: function(self) {
      return EMailLabel.getPrototype().getRenderName.call(self); } },
    valueProperty: { f: function(self) {
      return EMailLabel.getPrototype().getSearch.call(self); } },
    renderableProperty: { f: function(self) {
      return EMailLabel.getPrototype().isSearchable.call(self); } },
    initialSelectionValue: "labels:^i",
    selectedCssClass: 'selected',
    renderer: LabelChoiceRenderer
  });

  var controller = ThreePaneController.create({
    model: EMail,
    dao: EMailDAO,
    queryParser: queryParser,
    searchChoice: searchChoice,
    searchWidth: MIN_SEARCH_W
  });
  controller.toolbar.addActions(actions);
  controller.editView.toHTML = function() {
    this.children = [];
    var model = this.model;

    var str = "";
    str += '<div id="' + this.getID() + '" class="detailView">';

    // Header
    str += '<div class="header">';
    str += '<div class="subject">' + this.createView(EMail.SUBJECT).toHTML() + '</div>';
    str += '<div class="labels">' + this.createView(EMail.LABELS).toHTML() + '</div>';
    str += '</div>';

    str += '<div class="details">';
    str += '<div class="details1">';
    str += '<img class="avatar" src="images/profile_mask_2x.png" />';
    str += '<div class="from">' + this.createView(EMail.FROM).toHTML() + '</div>';
    str += '<div class="timestamp">' + this.createView(EMail.TIMESTAMP).toHTML() + '</div>';
    str += '</div>';
    str += '<div class="details2">';
    str += '<div class="to">to</div> ' + this.createView(EMail.TO).toHTML();
    str += '<div class="to">cc</div> ' + this.createView(EMail.CC).toHTML();
    str += '</div>';

    str += '<div class="body">' + this.createView(EMail.BODY).toHTML() + '</div>';

    str += '</div>';

    return str;
  };

  controller.table.scrollbar.handleColor = '#e1e1e1';
  controller.table.sortOrder = DESC(EMail.TIMESTAMP);

  // Add support for expanding/shrinking the left-panel
  var States = {
    GROWING: {
      tick: function() {
        controller.searchWidth += 25;
        if ( controller.searchWidth < controller.maxSearchWidth ) {
          scheduleTick();
        } else {
          controller.searchWidth = controller.maxSearchWidth;
          setState(States.GROWN);
        }
      },
      out: function() { setState(States.SHRINKING); }
    },
    GROWN: { out: function() { setState(States.SHRINKING); } },
    SHRINKING: {
      tick: function() {
        scheduleTick();

        controller.searchWidth -= 25;
        if ( controller.searchWidth > MIN_SEARCH_W ) {
          scheduleTick();
        } else {
          controller.searchWidth = MIN_SEARCH_W;
          setState(States.SHRUNK);
        }
      },
      over: function() { setState(States.GROWING); }
    },
    SHRUNK: { over: function() { setState(States.GROWING); } }
  };

  function setState(s) { expandState = s; s.tick && s.tick(); }
  var expandState = States.SHRUNK;
  var scheduleTick = (function() {
    var timeout;
    return function() {
      cancelAnimationFrame(timeout);
      timeout = requestAnimationFrame(function() { expandState.tick && expandState.tick(); });
    };
  })();


  timer.addPropertyListener('i', function() {
    var logo = $('logo-' + controller.getID());
    if (logo) logo.style.webkitTransform = 'rotate(' + 10*Math.sin(timer.i/40) + 'deg)';
  });

  stack.pushView(controller, 'main', function(w) {

     // Install keyboard shortcuts.
     // 's' to focus the searchbox.
     controller.addShortcut('U+0053', function() {
       this.searchField.$.focus();
     }.bind(controller));

     // 'c' to open the compose window.
     controller.addShortcut('U+0043', function() {
       this.toolbar.children[0].action.action();
     }.bind(controller));

     // 't' to focus the first item in the toolbar.
     controller.addShortcut('U+0054', function() {
       this.toolbar.children[1].$.focus();
     }.bind(controller));

     new KeyboardShortcutController(w, controller);

     w.controller = controller;

     if ( navigator.offLine ) controller.setLogo('images/logo_offline.png');

     w.addEventListener('online', function(e) {
        controller.setLogo('images/logo.png');
     }, false);

     w.addEventListener('offline', function(e) {
        controller.setLogo('images/logo_offline.png');
     }, false);

    // TODO: this should be a property of the controller
    $('settings-' + controller.getID()).onclick = openMenu;
    controller.searchChoice.$.parentElement.parentElement.onmouseout  = function(e) { expandState.out && expandState.out(); };
    controller.searchChoice.$.parentElement.parentElement.onmouseover = function(e) { expandState.over && expandState.over(); };
    controller.layout();
    w.onresize = EventService.merged(function() {
      controller.layout();
    });

    callback && callback(controller);
  });
}

function launchContactController(_, callback) {
/*
  var searchChoice = TextFieldView.create();
  var controller = ThreePaneController.create({
    model: Contact,
    dao: ContactDAO,
    queryParser: QueryParserFactory(Contact),
    searchChoice: searchChoice,
    searchWidth: 0
  });
  controller.toolbar.actions = [];
  controller.table.scrollbar.handleColor = '#e1e1e1';
  stack.pushView(controller, 'main', function(w) {
     controller.layout();
     callback && callback(controller);
  });
*/
  FOAM.browse(Contact, ContactDAO);
}


function editLabels(_, callback) {
   var controller = ThreePaneController.create({
      model: EMailLabel,
      dao: EMailLabels,
      queryParser: QueryParserFactory(EMailLabel),
      searchChoice: TextFieldView.create(),
      searchWidth: 0
   });

   controller.table.scrollbar.handleColor = '#e1e1e1';

   stack.pushView(controller, 'labels', function(w) {
      callback && callback(controller);
   });
}

// TODO: generalize and move to FOAM
chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
  if ( message.command == "search" ) {
     var predicate = queryParser.parseString(message.searchString).partialEval();
     var suggests = [];
     EMailDAO.limit(10).orderBy(DESC(EMail.TIMESTAMP)).where(predicate).select({
        put: function(x) {
           suggests.push({
              content: 'id:' + x.id,
              description: 'From ' + AbstractView.strToHTML(x.from) + ': ' + AbstractView.strToHTML(x.subject)
           });
        },
        eof: function() {
           sendResponse(suggests);
        }
      });
      return true;
   } else if ( message.command == "select" ) {
     launchController(undefined, function(controller) {
       // The next line prevents the onDaoUpdate listener from updating
       // the selection and showing the wrong email.
       controller.table.selection.set(undefined);
       controller.searchChoice.value.set('');
       controller.searchField.value.set(message.selectText);
       controller.layout();
     });
   } else if (message.command == "compose" ) {
     StorageFuture.get(function() {
       actions[0].action();
     });
   }
});
