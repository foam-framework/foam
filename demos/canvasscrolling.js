CLASS({
  name: 'ExperimentalScrollView',
  extends: 'foam.graphics.CView',
  requires: ['foam.input.touch.GestureTarget'],
  
  constants: {
    colors: 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' '),
    priorityColors: 'DB4437 F4B400 4285F4 0F9D58'.split(' '),
  },
  properties: [
    {
      name: 'silhouette',
      transient: true,
      factory: function() {
        var img = new Image();
        img.src = '../apps/mbug/images/silhouette.png';
        return img;
      }
    },
    {
      name: 'starred',
      transient: true,
      factory: function() {
        var img = new Image();
        img.src = '../apps/mbug/images/ic_star_24dp.png';
        return img;
      }
    },
    {
      name: 'unstarred',
      transient: true,
      factory: function() {
        var img = new Image();
        img.src = '../apps/mbug/images/ic_star_outline_24dp.png';
        return img;
      }
    },
    {
      name: 'map',
      defaultValue: {
        'Low': 3,
        'Medium': 2,
        'High': 1,
        'Critical': 0
      }
    },
    {
      name: 'rowHeight',
      defaultValue: 89
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      type: 'Int',
      name: 'scrollTop',
      preSet: function(_, v) { if ( v < 0 ) return 0; return v; }
    },
    {
      type: 'Int',
      name: 'selectNumber'
    },
    {
      name: 'objs',
      factory: function() { return []; }
    },
    {
      name: 'offset',
      defaultValue: 0
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamicFn(function() { this.width; this.offset; this.objs; }.bind(this),
                     function() {
                       this.view && this.view.paint();
                     }.bind(this));
    },
    initCView: function() {
      this.X.dynamicFn(
        function() {
          this.scrollTop; this.height;
        }.bind(this), this.onDAOUpdate);

      if ( this.X.gestureManager ) {
        var manager = this.X.gestureManager;
        var target = this.GestureTarget.create({
          containerID: this.view.id,
          handler: this,
          gesture: 'verticalScrollMomentum'
        });
        manager.install(target);
      }
    },
    verticalScrollMove: function(dy) {
      this.scrollTop -= dy;
    },
    paintSelf: function() {
//      var start = performance.now();
      var self = this;
      var offset = this.offset;//Math.floor(this.offset);
      var c = self.canvas;
      var doPass = function(f) {
        c.save();
        c.translate(0, offset);
        for ( var i = 0; i < self.objs.length; i++ ) {
          f(self.objs[i]);
          c.translate(0, self.rowHeight);
        }
        c.restore();
      };

       doPass(function(data) {
         c.save();
         c.beginPath();
         c.arc(36, 36, 20, 0, Math.PI * 2);

         if ( data.owner ) {
           c.fillStyle = self.generateColor(data.owner);
           c.fill();
         } else {
           c.clip();
           c.drawImage(self.silhouette, 18, 18);
         }
         c.restore();
       });

       c.lineWidth = 1;
       c.strokeStyle = 'rgba(0,0,0,0.1)';
       c.beginPath();

       doPass(function() {
         c.arc(36, 36, 20, 0, Math.PI * 2);
       });

       c.stroke();

      c.fillStyle = '#fff';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = "normal 20px Roboto, 'Helvetica Neue', 'Helvetica Arial'";
      doPass(function(data) {
        if ( data.owner.length > 0 ) {
          var m = c.measureText(data.owner[0]);
          c.fillText(data.owner[0], 36, 34);
        }
      });

      c.fillStyle = "#444";
      c.font = "400 16px Roboto, 'Helvetica Neue', 'Helvetica Arial'";
      c.textAlign = 'start';
      c.textBaseline = 'top';

      doPass(function(data) {
        c.fillText(data.id.toString(), 72, 16);
      });

/*      doPass(function(data) {
        var pri = self.dataToPriority(
          data.pri !== undefined ? data.pri : data.priority);

        c.fillStyle = self.priorityColors[pri];
        c.fillText('Pri ' + pri, 80 + m.width, 16);
      });*/

      c.fillStyle = '#999';
      c.font = "normal 14px Roboto, 'Helvetica Neue', 'Helvetica Arial'";
      doPass(function(data) {
        c.fillText(data.summary.substring(20), 72, 16 + 20);
      });

      doPass(function(data) {
        c.drawImage(data.starred ? self.starred : self.unstarred, self.width - 62, 16);
      });

//      var end = performance.now();
//      console.log('Render time: ', end - start);
    },
    generateColor: function(data) {
      return '#' + this.colors[Math.abs(data.hashCode()) % this.colors.length];
    },
    dataToPriority: function(data) {
      var numeric = parseInt(data);
      if ( ! Number.isNaN(numeric) ) return numeric;
      if ( this.map[data] !== undefined ) return this.map[data];
//      console.warn('Unknown priority ', data);
      return 3;
    }
  },
  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        if ( ! this.canvas ) return;

        var selectNumber = this.selectNumber + 1;
        this.selectNumber = selectNumber;

        var limit = Math.floor(this.height / this.rowHeight) + 1;
        var skip = Math.floor(this.scrollTop / this.rowHeight);
        var self = this;


        var offset = -(this.scrollTop % this.rowHeight);

        var i = 0;
        this.dao.skip(skip).limit(limit).select([])(function(objs) {
          self.offset = offset;
          self.objs = objs;
        });
      }
    }
  ]
});

CLASS({
  name: 'QIssue',
  properties: [
    'id',
    'pri',
    'priority',
    'owner',
    'summary',
    'starred'
  ]
});

var dao = JSONUtil.arrayToObjArray(X, [
  {
model_: "QIssue",
"blockedOn": [
302078,
333950,
353592,
394130,
394497
],
"blocking": [
344054
],
"published": new Date('Thu May 09 2013 19:10:01 GMT-0400 (EDT)'),
"state": "open",
"id": 239656,
"labels": [
"Cr-Platform-NaCl",
"MovedFrom-31",
"MovedFrom-32",
"Pri-2",
"Type-Bug",
"cr-internals-plugins-pepper",
"merge-merged-git-svn"
],
"author": "dmichael@chromium.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Started",
"cc": [
"bbudge@chromium.org",
"mseaborn@chromium.org"
],
"owner": "dmichael@chromium.org",
"summary": "Refactor NaCl integration to eliminate the trusted, in-process plugin.",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:39:39 GMT-0400 (EDT)'),
"starred": false,
"stars": 6,
"movedFrom": 32,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [
3864,
3802,
348232,
239656
],
"published": new Date('Tue Jul 15 2014 18:06:28 GMT-0400 (EDT)'),
"state": "open",
"id": 394130,
"labels": [
"Cr-Internals-Plugins-Pepper",
"Cr-Platform-NaCl",
"OS-All",
"Pri-2",
"Type-Bug"
],
"author": "terav...@chromium.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Assigned",
"cc": [
"mseaborn@chromium.org",
"hidehiko@chromium.org",
"dschuff@chromium.org",
"ncb...@chromium.org",
"bbudge@chromium.org"
],
"owner": "terav...@chromium.org",
"summary": "Unify open_resource logic for SFI and non-SFI codepaths",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:39:47 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [
30254
],
"published": new Date('Mon Aug 11 2014 13:43:04 GMT-0400 (EDT)'),
"state": "open",
"id": 402530,
"labels": [
"Cr-Tests",
"OS-Chrome",
"Pri-2",
"Type-Bug"
],
"author": "put...@chromium.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Available",
"cc": [
"s...@chromium.org",
"nsand...@chromium.org",
"yongj...@chromium.org"
],
"owner": "put...@chromium.org",
"summary": "Autotest: Some memory test use too much memory",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:41:59 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Wed Sep 10 2014 18:07:09 GMT-0400 (EDT)'),
"state": "open",
"id": 412988,
"labels": [
"Cr-Internals-Plugins-Flash",
"M-38",
"OS-Chrome",
"Pri-2",
"Type-Bug"
],
"author": "yungl...@chromium.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Untriaged",
"cc": [
"rohi...@chromium.org",
"nhu...@chromium.org"
],
"summary": "Hulu commercial stays black after switching tab but comes back normal with main video",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:40:00 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Sep 17 2014 17:40:23 GMT-0400 (EDT)'),
"published": new Date('Thu Sep 11 2014 01:40:29 GMT-0400 (EDT)'),
"state": "closed",
"id": 413096,
"labels": [
"Cr-Platform-Extensions",
"M-39",
"OS-Windows",
"Pri-1",
"ReleaseBlock-Stable",
"Type-Bug-Regression"
],
"author": "rk...@etouch.net",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Fixed",
"cc": [
"smok...@chromium.org",
"tkonch...@chromium.org",
"ericz...@chromium.org",
"rdevlin.cronin@chromium.org",
"dbeam@chromium.org",
"finnur@chromium.org"
],
"owner": "est...@chromium.org",
"summary": "Regression: 'Extension-controlled-warning' is misplaced for on startup section of settings page",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:40:23 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Sep 17 2014 17:43:13 GMT-0400 (EDT)'),
"published": new Date('Fri Sep 12 2014 02:58:18 GMT-0400 (EDT)'),
"state": "closed",
"id": 413546,
"labels": [
"Cr-UI-Browser-Search-Voice",
"Cr-UI-Settings",
"M-39",
"OS-Chrome",
"OS-Linux",
"OS-Mac",
"OS-Windows",
"Pri-1",
"ReleaseBlock-Stable",
"Type-Bug-Regression"
],
"author": "yfulgaon...@etouch.net",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Fixed",
"cc": [
"smok...@chromium.org",
"tkonch...@chromium.org",
"rlp@chromium.org",
"dbeam@chromium.org",
"davidben@chromium.org",
"michae...@chromium.org"
],
"owner": "dbeam@chromium.org",
"summary": "Regression: bubbles not aligned/showing correctly because of script error",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:43:13 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [
398269
],
"published": new Date('Wed Sep 17 2014 14:54:18 GMT-0400 (EDT)'),
"state": "open",
"id": 415246,
"labels": [
"Cr-OS-Packages",
"Iteration-113",
"OS-Chrome",
"Pri-2",
"Type-Bug"
],
"author": "bsimon...@chromium.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Started",
"cc": [
"vapier@chromium.org",
"bsimon...@chromium.org"
],
"owner": "vapier@chromium.org",
"summary": "Update crossdev to set repo-name in metadata/layout.conf",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:42:29 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Wed Sep 17 2014 17:40:43 GMT-0400 (EDT)'),
"state": "open",
"id": 415324,
"labels": [
"Cr-UI",
"OS-Mac",
"Pri-2",
"Type-Bug",
"Via-Wizard"
],
"author": "ren...@idesst.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Unconfirmed",
"cc": [],
"summary": "Print preview only displays/prints in color>no color options listed in menu",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:40:43 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Sep 17 2014 17:44:05 GMT-0400 (EDT)'),
"mergedInto": 415286,
"published": new Date('Wed Sep 17 2014 17:41:15 GMT-0400 (EDT)'),
"state": "closed",
"id": 415325,
"labels": [
"Cr-UI",
"OS-Mac",
"Pri-2",
"Type-Bug",
"Via-Wizard"
],
"author": "ren...@idesst.org",
"priority": "",
"pri": "",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Print preview only displays/prints in color>no color/B&W options listed in menu",
"OS": [],
"modified": new Date('Wed Sep 17 2014 17:44:05 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Dec 19 2013 08:24:36 GMT-0500 (EST)'),
"published": new Date('Wed Oct 30 2013 17:50:55 GMT-0400 (EDT)'),
"state": "closed",
"id": 313430,
"labels": [
"OS-Android",
"Pri-2",
"Restrict-View-Google",
"Stability-Crash"
],
"author": "arthur...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "WontFix",
"cc": [
"android-...@chromium.org",
"dpa...@chromium.org",
"k...@chromium.org",
"ada...@google.com",
"amn...@google.com",
"f...@chromium.org",
"rmcil...@chromium.org",
"primi...@chromium.org",
"klobag@chromium.org"
],
"owner": "rmcil...@chromium.org",
"summary": "Renderer crashed when attempt to parse JSON file",
"OS": [
"Android"
],
"modified": new Date('Thu Dec 19 2013 08:24:36 GMT-0500 (EST)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Sep 03 2013 16:51:50 GMT-0400 (EDT)'),
"published": new Date('Thu Aug 29 2013 03:01:26 GMT-0400 (EDT)'),
"state": "closed",
"id": 281000,
"labels": [
"Cr-Internals-Network",
"Cr-Services-Signin",
"Cr-Services-Sync",
"M-29",
"OS-Mac",
"Pri-0",
"ReleaseBlock-Stable",
"Restrict-View-Google",
"TE-Verified-29.0.1547.64",
"Type-Bug",
"merge-merged-1547",
"merge-merged-1547_57"
],
"author": "tim@chromium.org",
"priority": "",
"pri": "0",
"app": [],
"type": [
"Bug"
],
"milestone": [
"29"
],
"iteration": [],
"releaseBlock": [
"Stable"
],
"cr": [
"Internals-Network",
"Services-Signin",
"Services-Sync"
],
"status": "Verified",
"cc": [
"ligim...@chromium.org",
"akalin@chromium.org",
"whitelaw@chromium.org",
"pauljensen@chromium.org",
"kerz@chromium.org",
"ol...@google.com",
"ol...@google.com",
"js...@google.com",
"ovel...@google.com",
"e...@google.com",
"d...@google.com",
"mrm...@google.com",
"kaz...@google.com",
"rsleevi@chromium.org",
"blundell@chromium.org",
"droger@chromium.org",
"msarda@chromium.org",
"pinkerton@chromium.org",
"pvalenzu...@chromium.org",
"timste...@google.com",
"zea@chromium.org",
"mmontgomery@chromium.org",
"kevin...@google.com",
"nyquist@chromium.org",
"chenyu@chromium.org",
"pav...@chromium.org",
"vbhatsoori@chromium.org",
"astra...@chromium.org",
"srika...@chromium.org",
"ada...@google.com",
"ndhil...@google.com"
],
"owner": "tim@chromium.org",
"summary": "M29 mac clients failing to sync due to persistent auth failure",
"OS": [
"Mac"
],
"modified": new Date('Tue Oct 01 2013 13:07:59 GMT-0400 (EDT)'),
"starred": false,
"stars": 15,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [
44414
],
"closed": new Date('Thu Apr 24 2014 16:21:58 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 22:37:44 GMT-0400 (EDT)'),
"state": "closed",
"id": 56600,
"labels": [
"Cr-UI",
"Cr-UI-Browser-Autofill",
"Cr-UI-Internationalization",
"Pri-2",
"Type-Feature"
],
"author": "dhollowa@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Feature"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-Autofill",
"UI-Internationalization"
],
"status": "WontFix",
"cc": [],
"owner": "rous...@chromium.org",
"summary": "Autofill i18n: Add State field popup menu to DOMUI",
"OS": [],
"modified": new Date('Thu Apr 24 2014 16:21:58 GMT-0400 (EDT)'),
"starred": false,
"stars": 7,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Wed Sep 22 2010 18:15:36 GMT-0400 (EDT)'),
"state": "open",
"id": 56572,
"labels": [
"Cr-Blink",
"Cr-Internals-Plugins-PDF",
"Cr-UI",
"Cr-UI-Internationalization",
"Mstone-X",
"Pri-3",
"RTL",
"Type-Feature",
"bulkmove"
],
"author": "jam@chromium.org",
"priority": "",
"pri": "3",
"app": [],
"type": [
"Feature"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Plugins-PDF",
"UI",
"UI-Internationalization"
],
"status": "Available",
"cc": [
"jeremy@chromium.org",
"prog...@chromium.org"
],
"summary": "Scrollbars should go on the left for RTL users",
"OS": [],
"modified": new Date('Fri Apr 05 2013 23:18:44 GMT-0400 (EDT)'),
"starred": false,
"stars": 4,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [
55399,
61931
],
"blocking": [],
"closed": new Date('Tue Nov 16 2010 10:40:13 GMT-0500 (EST)'),
"published": new Date('Wed Sep 22 2010 17:38:14 GMT-0400 (EDT)'),
"state": "closed",
"id": 56561,
"labels": [
"Cr-Blink",
"Cr-Internals-Media",
"Mstone-X",
"OS-Mac",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"Verifier-Deepakg",
"clang",
"ffmpeg"
],
"author": "thakis@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Media"
],
"status": "Verified",
"cc": [
"fbarch...@chromium.org",
"scherkus@chromium.org"
],
"owner": "thakis@chromium.org",
"summary": "Chrome doesn't build with clang when ffmpeg is enabled",
"OS": [
"Mac"
],
"modified": new Date('Fri Apr 05 2013 22:06:12 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Oct 07 2010 15:49:29 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 16:42:58 GMT-0400 (EDT)'),
"state": "closed",
"id": 56554,
"labels": [
"Cr-Internals",
"Cr-Internals-GPU",
"Cr-Internals-GPU-Canvas2D",
"Cr-Internals-Graphics",
"M-9",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "senorbla...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"9"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-GPU",
"Internals-GPU-Canvas2D",
"Internals-Graphics"
],
"status": "Verified",
"cc": [
"jamesr@chromium.org",
"kbr@chromium.org",
"scheib@chromium.org"
],
"owner": "senorbla...@chromium.org",
"summary": "Layout test fast/canvas/canvas-composite.html is failing with accelerated-2d-canvas enabled",
"OS": [],
"modified": new Date('Wed Mar 13 2013 18:27:28 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Sep 22 2010 17:29:29 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 15:39:47 GMT-0400 (EDT)'),
"state": "closed",
"id": 56544,
"labels": [
"Cr-Internals",
"Cr-Internals-Installer",
"Hotlist-ConOps-TopPriority",
"M-6",
"Pri-0",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "suna...@chromium.org",
"priority": "",
"pri": "0",
"app": [],
"type": [
"Bug"
],
"milestone": [
"6"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Installer"
],
"status": "Verified",
"cc": [
"mal@google.com",
"anan...@chromium.org",
"kerz@chromium.org",
"lafo...@chromium.org",
"cnyga...@chromium.org"
],
"summary": "Trying to install Chrome stable channel throws \"Unknown Installer error\"",
"OS": [],
"modified": new Date('Fri Apr 05 2013 11:22:17 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Nov 25 2011 21:10:15 GMT-0500 (EST)'),
"published": new Date('Wed Sep 22 2010 14:45:18 GMT-0400 (EDT)'),
"state": "closed",
"id": 56539,
"labels": [
"Cr-Blink",
"Cr-Content-Core",
"MovedFrom-9",
"OS-Linux",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"UnM10"
],
"author": "victor.zamanian",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Content-Core"
],
"status": "WontFix",
"cc": [],
"summary": "accelerated-2d-canvas flag renders google images search results incorrectly",
"OS": [
"Linux"
],
"modified": new Date('Fri Apr 05 2013 22:06:13 GMT-0400 (EDT)'),
"starred": false,
"stars": 7,
"movedFrom": 9,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Sep 30 2010 17:34:30 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 14:03:42 GMT-0400 (EDT)'),
"state": "closed",
"id": 56536,
"labels": [
"Cr-UI",
"Cr-UI-Settings",
"M-8",
"MovedToSettings",
"OS-All",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "fam....@live.nl",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Settings"
],
"status": "Fixed",
"cc": [
"venkatar...@chromium.org",
"sky@chromium.org",
"est...@chromium.org",
"jhawk...@chromium.org"
],
"owner": "csilv@chromium.org",
"summary": "Setting 'automatically send crash reports' isn't saved in new options page",
"OS": [
"All"
],
"modified": new Date('Wed Mar 13 2013 18:17:06 GMT-0400 (EDT)'),
"starred": false,
"stars": 7,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:39 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 11:22:57 GMT-0400 (EDT)'),
"state": "closed",
"id": 56519,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "todd.ric...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "All Chrome windows repaint when switching to / from another app",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:08 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Wed Sep 22 2010 11:05:17 GMT-0400 (EDT)'),
"state": "open",
"id": 56517,
"labels": [
"Cr-Blink",
"Mstone-X",
"OS-Windows",
"Pri-2",
"Type-Bug"
],
"author": "r...@condron.us",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink"
],
"status": "Available",
"cc": [],
"summary": "Asp.net Keep Page Scroll doesn't work",
"OS": [
"Windows"
],
"modified": new Date('Fri Apr 05 2013 22:06:14 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:37 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 08:26:38 GMT-0400 (EDT)'),
"state": "closed",
"id": 56505,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "mrei...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Cursor jumps back to previous field with no provocation",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:10 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Sep 24 2010 07:58:34 GMT-0400 (EDT)'),
"published": new Date('Wed Sep 22 2010 03:33:46 GMT-0400 (EDT)'),
"state": "closed",
"id": 56495,
"labels": [
"Cr-UI",
"OS-Linux",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Stability-Valgrind",
"Type-Bug",
"bulkmove"
],
"author": "hb...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI"
],
"status": "Fixed",
"cc": [],
"owner": "phajdan.jr@chromium.org",
"summary": "Leak in SavePackage::Init()",
"OS": [
"Linux"
],
"modified": new Date('Mon Apr 01 2013 11:54:17 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Jan 26 2011 01:35:38 GMT-0500 (EST)'),
"mergedInto": 16476,
"published": new Date('Wed Sep 22 2010 02:14:51 GMT-0400 (EDT)'),
"state": "closed",
"id": 56489,
"labels": [
"Cr-Internals",
"Cr-Internals-Network",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "Shashank...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Network"
],
"status": "Duplicate",
"cc": [
"cbentzel@chromium.org"
],
"summary": "Browser hangs completely",
"OS": [
"Windows"
],
"modified": new Date('Sun Mar 10 2013 18:31:23 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:13:40 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 21:31:18 GMT-0400 (EDT)'),
"state": "closed",
"id": 56475,
"labels": [
"Cr-UI",
"Cr-UI-Browser-StatusBubble",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "supermat...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-StatusBubble"
],
"status": "IceBox",
"cc": [],
"summary": "Status bar at bottom of page has incorrect placement when it is created and the mouse is over it.",
"OS": [
"Windows"
],
"modified": new Date('Sun Mar 10 2013 20:56:07 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Sep 22 2010 15:39:17 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 21:28:14 GMT-0400 (EDT)'),
"state": "closed",
"id": 56474,
"labels": [
"Cr-Blink",
"M-7",
"OS-All",
"Pri-1",
"Restrict-AddIssueComment-EditIssue",
"Security",
"Security_Impact-Stable",
"Security_Severity-High",
"Type-Bug-Security"
],
"author": "infe...@chromium.org",
"priority": "",
"pri": "1",
"app": [],
"type": [
"Bug-Security"
],
"milestone": [
"7"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink"
],
"status": "Fixed",
"cc": [
"o...@chromium.org"
],
"owner": "infe...@chromium.org",
"summary": "User after free in table destroy",
"OS": [
"All"
],
"modified": new Date('Fri Apr 05 2013 22:06:16 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Sep 27 2010 17:47:38 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 21:02:41 GMT-0400 (EDT)'),
"state": "closed",
"id": 56471,
"labels": [
"Cr-Internals",
"OS-Mac",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"Verifier-Deepakg",
"clang"
],
"author": "thakis@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals"
],
"status": "Verified",
"cc": [
"mark@chromium.org",
"evan@chromium.org"
],
"owner": "thakis@chromium.org",
"summary": "Clang build fails \"Verify global text symbol order\" build step",
"OS": [
"Mac"
],
"modified": new Date('Sun Mar 10 2013 18:31:24 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 17:35:28 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 20:55:40 GMT-0400 (EDT)'),
"state": "closed",
"id": 56470,
"labels": [
"Cr-UI",
"Cr-UI-Browser-FullScreen",
"Mstone-X",
"OS-Linux",
"Pri-3",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "icthis...@gmail.com",
"priority": "",
"pri": "3",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-FullScreen"
],
"status": "IceBox",
"cc": [
"est...@chromium.org"
],
"summary": "Bug involving Full Screen Mode when started by *click holding* and pulling down from the top window bar",
"OS": [
"Linux"
],
"modified": new Date('Sun Mar 10 2013 20:56:08 GMT-0400 (EDT)'),
"starred": false,
"stars": 7,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Nov 16 2011 17:25:07 GMT-0500 (EST)'),
"published": new Date('Tue Sep 21 2010 20:52:22 GMT-0400 (EDT)'),
"state": "closed",
"id": 56467,
"labels": [
"Cr-Blink",
"Cr-Internals-Media",
"M-17",
"MovedFrom-16",
"Needs-Feedback",
"OS-All",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "man...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"17"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Media"
],
"status": "WontFix",
"cc": [
"scherkus@chromium.org",
"imas...@chromium.org"
],
"owner": "acolw...@chromium.org",
"summary": "Chunked Transfer causes Multiple Requests, the First Few of Which Terminate Prematurely",
"OS": [
"All"
],
"modified": new Date('Fri Apr 05 2013 22:06:17 GMT-0400 (EDT)'),
"starred": false,
"stars": 8,
"movedFrom": 16,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Oct 18 2010 13:18:13 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 18:35:44 GMT-0400 (EDT)'),
"state": "closed",
"id": 56452,
"labels": [
"Cr-Blink",
"Cr-Content-Core",
"Cr-Internals-Media",
"HTML5",
"M-8",
"OS-Linux",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "IllBa...@gmail.com",
"priority": "",
"pri": "",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Content-Core",
"Internals-Media"
],
"status": "WontFix",
"cc": [],
"owner": "scherkus@chromium.org",
"summary": "HTML5 Videos slide off the HTML5 player.",
"OS": [
"Linux"
],
"modified": new Date('Fri Apr 05 2013 22:06:17 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Sep 21 2010 18:28:09 GMT-0400 (EDT)'),
"mergedInto": 52754,
"published": new Date('Tue Sep 21 2010 17:44:37 GMT-0400 (EDT)'),
"state": "closed",
"id": 56438,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "frankst...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Flash and pop-up blocker cause crash",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:23 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Oct 20 2010 12:51:49 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 17:37:17 GMT-0400 (EDT)'),
"state": "closed",
"id": 56435,
"labels": [
"Cr-ChromeFrame",
"M-8",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug",
"bulkmove"
],
"author": "robertsh...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"ChromeFrame"
],
"status": "Verified",
"cc": [
"tommi@chromium.org",
"a...@chromium.org",
"robertsh...@chromium.org"
],
"owner": "grt@chromium.org",
"summary": "Chrome Frame should read and respect Chrome's locale group policy setting.",
"OS": [
"Windows"
],
"modified": new Date('Wed Mar 13 2013 18:17:10 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Oct 07 2010 17:16:39 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 17:05:58 GMT-0400 (EDT)'),
"state": "closed",
"id": 56426,
"labels": [
"Cr-Internals",
"Cr-Internals-Network",
"M-8",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "rch@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Network"
],
"status": "Fixed",
"cc": [
"willchan@chromium.org",
"wtc@chromium.org"
],
"owner": "rch@chromium.org",
"summary": "ClientSocket::GetPeerAddress does not define behavior for Disconnected sockets",
"OS": [],
"modified": new Date('Wed Mar 13 2013 18:17:11 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Sep 30 2010 20:35:49 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 14:45:09 GMT-0400 (EDT)'),
"state": "closed",
"id": 56411,
"labels": [
"7.0.529.0",
"Cr-Services-Sync",
"OS-All",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "anna...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Services-Sync"
],
"status": "WontFix",
"cc": [],
"summary": "Sync: Password sync should not be enabled.",
"OS": [
"All",
"Windows"
],
"modified": new Date('Mon Mar 11 2013 00:08:26 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Dec 10 2010 21:33:44 GMT-0500 (EST)'),
"published": new Date('Tue Sep 21 2010 12:54:37 GMT-0400 (EDT)'),
"state": "closed",
"id": 56397,
"labels": [
"Needs-Feedback",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Stability-Crash",
"Type-Bug",
"bulkmove"
],
"author": "scukon...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "WontFix",
"cc": [
"aoca...@chromium.org"
],
"summary": "Chrome crashs on trying to open second window",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:28 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Sep 21 2010 10:54:41 GMT-0400 (EDT)'),
"published": new Date('Tue Sep 21 2010 10:11:45 GMT-0400 (EDT)'),
"state": "closed",
"id": 56374,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "satish@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Fixed",
"cc": [],
"owner": "dglazkov@chromium.org",
"summary": "Layout test svg/custom/js-late-pattern-and-object-creation.svg fails in linux.",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:32 GMT-0400 (EDT)'),
"starred": false,
"stars": 0,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Dec 10 2010 21:32:44 GMT-0500 (EST)'),
"published": new Date('Tue Sep 21 2010 06:07:24 GMT-0400 (EDT)'),
"state": "closed",
"id": 56361,
"labels": [
"Cr-Internals",
"Hotlist-ConOps",
"Needs-Feedback",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Stability",
"Stability-Crash",
"Type-Bug",
"bulkmove",
"not-extensions"
],
"author": "oma...@google.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals"
],
"status": "WontFix",
"cc": [
"huanr@chromium.org"
],
"summary": "Chrome 6.0.472.35 crash after certain actions",
"OS": [
"Windows"
],
"modified": new Date('Sun Mar 10 2013 18:31:27 GMT-0400 (EDT)'),
"starred": false,
"stars": 4,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Apr 18 2011 10:39:58 GMT-0400 (EDT)'),
"mergedInto": 16476,
"published": new Date('Tue Sep 21 2010 03:54:48 GMT-0400 (EDT)'),
"state": "closed",
"id": 56350,
"labels": [
"Cr-UI",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "armin.vi...@googlemail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI"
],
"status": "Duplicate",
"cc": [],
"summary": "Opening of background tab with htaccess secured content is not possible",
"OS": [],
"modified": new Date('Sun Mar 10 2013 20:56:10 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Sep 24 2010 13:33:08 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 21:42:30 GMT-0400 (EDT)'),
"state": "closed",
"id": 56332,
"labels": [
"Cr-Blink",
"Cr-Internals-Compositing",
"Cr-Internals-GPU",
"M-8",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "vangelis@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Compositing",
"Internals-GPU"
],
"status": "Fixed",
"cc": [
"hbridge@google.com",
"darin@chromium.org",
"jamesr@chromium.org",
"scheib@chromium.org",
"kbr@chromium.org"
],
"owner": "vangelis@chromium.org",
"summary": "Composited layers appear to betting double-transformed when scrolling",
"OS": [],
"modified": new Date('Fri Apr 05 2013 22:06:24 GMT-0400 (EDT)'),
"starred": false,
"stars": 5,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:15 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 18:55:56 GMT-0400 (EDT)'),
"state": "closed",
"id": 56316,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "grom...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Rendering bug",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:47 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Sep 27 2010 09:05:22 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 18:04:05 GMT-0400 (EDT)'),
"state": "closed",
"id": 56311,
"labels": [
"Cr-Blink",
"Cr-Internals-Plugins-PDF",
"Cr-UI",
"Needs-Feedback",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"bulkmove"
],
"author": "coriolis...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Plugins-PDF",
"UI"
],
"status": "WontFix",
"cc": [],
"summary": "pdf files do not load properly",
"OS": [],
"modified": new Date('Fri Apr 05 2013 23:18:46 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Sep 20 2010 20:11:03 GMT-0400 (EDT)'),
"mergedInto": 56290,
"published": new Date('Mon Sep 20 2010 15:47:38 GMT-0400 (EDT)'),
"state": "closed",
"id": 56289,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "mr.pf.le...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Lastpass username and password not being added",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:52 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:12 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 14:41:55 GMT-0400 (EDT)'),
"state": "closed",
"id": 56281,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "lonest...@live.fr",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Wave application mode - panels resized after minimize to task bar",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:53 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Sun Nov 21 2010 17:30:17 GMT-0500 (EST)'),
"published": new Date('Mon Sep 20 2010 14:15:52 GMT-0400 (EDT)'),
"state": "closed",
"id": 56277,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "atwilson@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Fixed",
"cc": [
"jamesr@chromium.org",
"o...@chromium.org",
"senorbla...@chromium.org",
"mikelawt...@chromium.org",
"scheib@chromium.org"
],
"owner": "mikelawt...@chromium.org",
"summary": "canvas/philip/tests/2d.imageData.get.source.outside.html generates failed assertions",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:53 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Sep 20 2010 16:16:13 GMT-0400 (EDT)'),
"mergedInto": 16362,
"published": new Date('Mon Sep 20 2010 14:04:00 GMT-0400 (EDT)'),
"state": "closed",
"id": 56276,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "dave.den...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Please add about:config",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:54 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Mon Sep 20 2010 12:47:14 GMT-0400 (EDT)'),
"state": "open",
"id": 56264,
"labels": [
"Cr-Tests-Disabled",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "evan@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Tests-Disabled"
],
"status": "Assigned",
"cc": [
"jcive...@chromium.org",
"evan@chromium.org"
],
"owner": "jam@chromium.org",
"summary": "ResourceDispatcherTest.SyncXMLHttpRequest_DuringUnload very slow / flaky",
"OS": [],
"modified": new Date('Thu Jul 04 2013 01:55:36 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Sep 27 2010 13:28:14 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 10:56:29 GMT-0400 (EDT)'),
"state": "closed",
"id": 56258,
"labels": [
"Needs-Feedback",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Stability-Crash",
"Type-Bug",
"bulkmove"
],
"author": "TINO%doo...@gtempaccount.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "WontFix",
"cc": [],
"summary": "normal news-page makes chrome to crash",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:56 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Feb 28 2011 14:30:40 GMT-0500 (EST)'),
"published": new Date('Mon Sep 20 2010 10:37:29 GMT-0400 (EDT)'),
"state": "closed",
"id": 56257,
"labels": [
"Cr-UI",
"Hotlist-GoodFirstBug",
"MovedFrom-10",
"Mstone-X",
"OS-Mac",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"bulkmove"
],
"author": "pinkerton@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI"
],
"status": "Duplicate",
"cc": [
"al...@google.com",
"thakis@chromium.org"
],
"owner": "pinkerton@chromium.org",
"summary": "Cmd-Shift-V for paste and match style",
"OS": [
"Mac"
],
"modified": new Date('Sun Mar 10 2013 20:56:14 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedFrom": 10,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Mon Sep 20 2010 06:55:25 GMT-0400 (EDT)'),
"state": "open",
"id": 56244,
"labels": [
"Cr-Blink",
"Mstone-X",
"OS-All",
"Pri-2",
"Type-Bug"
],
"author": "eno...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink"
],
"status": "Available",
"cc": [
"anan...@chromium.org"
],
"summary": "www.crossness.org.uk renders with bar in the middle",
"OS": [
"All"
],
"modified": new Date('Fri Apr 05 2013 22:06:34 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:10 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 06:05:39 GMT-0400 (EDT)'),
"state": "closed",
"id": 56242,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "romil...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "I keep getting-this webpage is not available",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:08:59 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:09 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 06:00:44 GMT-0400 (EDT)'),
"state": "closed",
"id": 56239,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "yuri.khrustalev",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "javascript debug breakpoint dublicated after page reload",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:02 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Oct 06 2010 20:13:25 GMT-0400 (EDT)'),
"published": new Date('Mon Sep 20 2010 00:09:06 GMT-0400 (EDT)'),
"state": "closed",
"id": 56235,
"labels": [
"Cr-Blink",
"Cr-Internals",
"Cr-Internals-Plugins-PDF",
"M-8",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "rsc@google.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals",
"Internals-Plugins-PDF"
],
"status": "WontFix",
"cc": [],
"owner": "jam@chromium.org",
"summary": "PDF missing plugin (on Linux)",
"OS": [],
"modified": new Date('Fri Apr 05 2013 23:18:47 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Sep 24 2010 14:54:10 GMT-0400 (EDT)'),
"mergedInto": 53334,
"published": new Date('Sun Sep 19 2010 21:59:49 GMT-0400 (EDT)'),
"state": "closed",
"id": 56225,
"labels": [
"Cr-Internals",
"Cr-Internals-Network",
"M-7",
"OS-Linux",
"Pri-1",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "r...@version2beta.com",
"priority": "",
"pri": "1",
"app": [],
"type": [
"Bug"
],
"milestone": [
"7"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Network"
],
"status": "Duplicate",
"cc": [],
"owner": "wtc@chromium.org",
"summary": "https://adcenter.microsoft.com security cert revoked only in chrome",
"OS": [
"Linux"
],
"modified": new Date('Wed Mar 13 2013 18:05:55 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:07 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 21:09:27 GMT-0400 (EDT)'),
"state": "closed",
"id": 56224,
"labels": [
"Cr-Internals",
"Cr-UI-Browser-Incognito",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Feature"
],
"author": "the...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Feature"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"UI-Browser-Incognito"
],
"status": "IceBox",
"cc": [],
"summary": "Referrer should not be sent in Incognito mode",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:34 GMT-0400 (EDT)'),
"starred": false,
"stars": 6,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Sun Sep 19 2010 20:05:53 GMT-0400 (EDT)'),
"state": "open",
"id": 56221,
"labels": [
"Build",
"Pri-2",
"Type-Feature",
"bulkmove"
],
"author": "o...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Feature"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Available",
"cc": [
"maruel@chromium.org",
"bevc@chromium.org"
],
"summary": "console view should allow you to page back and view more events",
"OS": [],
"modified": new Date('Sat Mar 09 2013 23:11:44 GMT-0500 (EST)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Jul 02 2014 13:53:52 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 19:44:22 GMT-0400 (EDT)'),
"state": "closed",
"id": 56218,
"labels": [
"Build",
"Pri-2",
"Type-Feature",
"bulkmove"
],
"author": "o...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Feature"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "WontFix",
"cc": [
"sh...@chromium.org",
"phajdan.jr@chromium.org",
"stip@chromium.org"
],
"owner": "maruel@chromium.org",
"summary": "trychange.py --bot should allow wildcards",
"OS": [],
"modified": new Date('Wed Jul 02 2014 13:53:52 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:06 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 19:10:29 GMT-0400 (EDT)'),
"state": "closed",
"id": 56217,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "steve.yelvington",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Login cookies deleted when browser is restarted",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:05 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:05 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 18:38:47 GMT-0400 (EDT)'),
"state": "closed",
"id": 56216,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "bjornre...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Unable to open warlords game on facebook using chrome",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:05 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Feb 27 2013 16:36:05 GMT-0500 (EST)'),
"published": new Date('Sun Sep 19 2010 16:18:03 GMT-0400 (EDT)'),
"state": "closed",
"id": 56208,
"labels": [
"Cr-Blink",
"Cr-Content-Core",
"M-12",
"MovedFrom-10",
"MovedFrom-11",
"MovedFrom-9",
"OS-All",
"Pri-1",
"Restrict-AddIssueComment-EditIssue",
"Stability-Crash",
"Type-Bug-Regression",
"bulkmove"
],
"author": "tstromb...@google.com",
"priority": "",
"pri": "1",
"app": [],
"type": [
"Bug-Regression"
],
"milestone": [
"12"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Content-Core"
],
"status": "Invalid",
"cc": [
"dglazkov@chromium.org",
"lafo...@chromium.org",
"anan...@chromium.org"
],
"owner": "morrita@google.com",
"summary": "iExploder Crash: <progress style=\"font: 9999 x; \"> @ WTF::RefCounted<WebCore::SVGAnimatedTemplate<WebCore::FloatRect> >::deref()",
"OS": [
"All"
],
"modified": new Date('Fri Apr 05 2013 22:06:37 GMT-0400 (EDT)'),
"starred": false,
"stars": 5,
"movedFrom": 9,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:05 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 15:34:35 GMT-0400 (EDT)'),
"state": "closed",
"id": 56205,
"labels": [
"Cr-Blink",
"Cr-Content-Core",
"Mstone-X",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "gel...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Content-Core"
],
"status": "IceBox",
"cc": [],
"summary": "Incorrect DOM construction for self-closing tag in foreign namespace",
"OS": [],
"modified": new Date('Fri Apr 05 2013 22:06:38 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Oct 01 2010 12:33:32 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 14:29:02 GMT-0400 (EDT)'),
"state": "closed",
"id": 56203,
"labels": [
"Cr-UI",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug-Regression",
"bulkmove"
],
"author": "chrisobr...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug-Regression"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI"
],
"status": "Duplicate",
"cc": [],
"summary": "White bar at bottom of page",
"OS": [],
"modified": new Date('Sat Mar 09 2013 18:48:09 GMT-0500 (EST)'),
"starred": false,
"stars": 4,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Sep 21 2010 17:57:15 GMT-0400 (EDT)'),
"mergedInto": 54972,
"published": new Date('Sun Sep 19 2010 14:14:23 GMT-0400 (EDT)'),
"state": "closed",
"id": 56201,
"labels": [
"Cr-Internals",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "n8arc...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals"
],
"status": "Duplicate",
"cc": [
"venkatar...@chromium.org"
],
"summary": "Google Docs frequently crashing",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:36 GMT-0400 (EDT)'),
"starred": false,
"stars": 4,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Sep 21 2010 19:06:33 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 13:54:19 GMT-0400 (EDT)'),
"state": "closed",
"id": 56199,
"labels": [
"Cr-Blink",
"Cr-Internals",
"Cr-Internals-Plugins",
"Needs-Feedback",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"bulkmove"
],
"author": "willisur...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals",
"Internals-Plugins"
],
"status": "Duplicate",
"cc": [],
"summary": "Multiple flash instance does not load",
"OS": [],
"modified": new Date('Sat Apr 06 2013 00:28:46 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:05 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 13:43:24 GMT-0400 (EDT)'),
"state": "closed",
"id": 56197,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "djpa...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Scrolling problem",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:07 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Jan 27 2011 05:21:39 GMT-0500 (EST)'),
"published": new Date('Sun Sep 19 2010 13:28:33 GMT-0400 (EDT)'),
"state": "closed",
"id": 56194,
"labels": [
"Cr-Platform-DevTools",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "pfeld...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Platform-DevTools"
],
"status": "Fixed",
"cc": [],
"owner": "yurys@chromium.org",
"summary": "DevTools: Stack information is inconsistent between Error.stack, console.trace and runtime errors.",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:08 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Oct 19 2010 15:54:25 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 12:38:51 GMT-0400 (EDT)'),
"state": "closed",
"id": 56192,
"labels": [
"Cr-Blink",
"Crash-Reproducible",
"M-8",
"OS-Mac",
"Pri-2",
"ReleaseBlock-Beta",
"Restrict-AddIssueComment-EditIssue",
"Stability-Crash",
"Type-Bug",
"Verifier-Deepakg",
"bulkmove"
],
"author": "tstromb...@google.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [
"Beta"
],
"cr": [
"Blink"
],
"status": "WontFix",
"cc": [
"pinkerton@chromium.org",
"koz@chromium.org",
"avi@chromium.org"
],
"summary": "iExploder Crash: <script style=\"content: url(https://);\">",
"OS": [
"Mac"
],
"modified": new Date('Fri Apr 05 2013 22:06:39 GMT-0400 (EDT)'),
"starred": false,
"stars": 4,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Nov 01 2010 14:21:06 GMT-0400 (EDT)'),
"mergedInto": 61147,
"published": new Date('Sun Sep 19 2010 12:22:12 GMT-0400 (EDT)'),
"state": "closed",
"id": 56190,
"labels": [
"Cr-Internals",
"Cr-Platform-Extensions",
"M-9",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Feature"
],
"author": "tobias.de@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Feature"
],
"milestone": [
"9"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Platform-Extensions"
],
"status": "Duplicate",
"cc": [],
"owner": "asargent@chromium.org",
"summary": "Extension context menu entries show up in incognito tabs",
"OS": [],
"modified": new Date('Wed Mar 13 2013 18:27:34 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:02 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 10:31:25 GMT-0400 (EDT)'),
"state": "closed",
"id": 56186,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "carlmaul...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Google Chrome task bar has expanded across page. Bookmark star at right end of bar covering copy/print bookmark.",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:10 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:01 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 09:18:36 GMT-0400 (EDT)'),
"state": "closed",
"id": 56181,
"labels": [
"Needs-Reduction",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Compat",
"bulkmove"
],
"author": "radic...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Compat"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Bug: Unable to move browser frame to access log in",
"OS": [],
"modified": new Date('Sun Mar 10 2013 16:36:47 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Feb 17 2011 00:00:21 GMT-0500 (EST)'),
"published": new Date('Sun Sep 19 2010 08:21:21 GMT-0400 (EDT)'),
"state": "closed",
"id": 56180,
"labels": [
"Cr-Blink",
"Cr-Internals-Media",
"Hotlist-GoodFirstBug",
"Mstone-X",
"OS-All",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"bulkmove",
"ffmpeg"
],
"author": "jan.ger...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Media"
],
"status": "Fixed",
"cc": [
"fbarch...@chromium.org"
],
"summary": "Chrome does not support Theora nullframes",
"OS": [
"All"
],
"modified": new Date('Fri Apr 05 2013 22:06:41 GMT-0400 (EDT)'),
"starred": false,
"stars": 9,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Oct 11 2010 14:47:10 GMT-0400 (EDT)'),
"mergedInto": 39407,
"published": new Date('Sun Sep 19 2010 05:39:38 GMT-0400 (EDT)'),
"state": "closed",
"id": 56174,
"labels": [
"Cr-UI",
"Cr-UI-Browser-Bookmarks",
"M-8",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "nkatza...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-Bookmarks"
],
"status": "Duplicate",
"cc": [
"arv@chromium.org"
],
"owner": "arv@chromium.org",
"summary": "\"Invalid URL\" Dialog in Bookmark Manager when adding page",
"OS": [],
"modified": new Date('Wed Mar 13 2013 18:17:24 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:57:00 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 05:10:28 GMT-0400 (EDT)'),
"state": "closed",
"id": 56171,
"labels": [
"Cr-UI",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "gMinu...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI"
],
"status": "IceBox",
"cc": [],
"summary": "Page zooming shouldn't be centered at the top of the page",
"OS": [],
"modified": new Date('Sun Mar 10 2013 20:56:16 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Oct 20 2010 23:37:02 GMT-0400 (EDT)'),
"mergedInto": 57167,
"published": new Date('Sun Sep 19 2010 04:37:57 GMT-0400 (EDT)'),
"state": "closed",
"id": 56170,
"labels": [
"Cr-Blink",
"Cr-Internals-Media",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "mockee",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Media"
],
"status": "Duplicate",
"cc": [],
"summary": "<audio> element can not play all mp3 files. mediaError: 4, Network states numeric value 3",
"OS": [],
"modified": new Date('Fri Apr 05 2013 22:06:41 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Sun Sep 19 2010 19:46:34 GMT-0400 (EDT)'),
"mergedInto": 147,
"published": new Date('Sun Sep 19 2010 03:43:39 GMT-0400 (EDT)'),
"state": "closed",
"id": 56167,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "filar...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "No confirm before quit Chrome with 2 or more opened tabs",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:15 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:58 GMT-0400 (EDT)'),
"published": new Date('Sun Sep 19 2010 02:36:46 GMT-0400 (EDT)'),
"state": "closed",
"id": 56164,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "FlawedLojik@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Google Search Settings - Number of Results returns to Default value",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:15 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Sep 20 2010 14:39:07 GMT-0400 (EDT)'),
"mergedInto": 55228,
"published": new Date('Sun Sep 19 2010 01:38:06 GMT-0400 (EDT)'),
"state": "closed",
"id": 56162,
"labels": [
"Cr-UI",
"Cr-UI-Browser-FindInPage",
"M-7",
"OS-Mac",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "srikan...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"7"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-FindInPage"
],
"status": "Duplicate",
"cc": [
"srikan...@chromium.org"
],
"owner": "rohitrao@chromium.org",
"summary": "Find in page does not work ",
"OS": [
"Mac"
],
"modified": new Date('Wed Mar 13 2013 18:05:56 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Feb 02 2012 14:17:04 GMT-0500 (EST)'),
"published": new Date('Sat Sep 18 2010 23:48:59 GMT-0400 (EDT)'),
"state": "closed",
"id": 56159,
"labels": [
"Cr-UI",
"Cr-UI-Browser-Autofill",
"Hotlist-GoodFirstBug",
"OS-All",
"Pri-3",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "varun....@gmail.com",
"priority": "",
"pri": "3",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-Autofill"
],
"status": "WontFix",
"cc": [],
"summary": "Auto fill not working correctly - inserting invalid entries into web forms",
"OS": [
"All"
],
"modified": new Date('Sun Mar 10 2013 20:56:16 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:56 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 21:40:00 GMT-0400 (EDT)'),
"state": "closed",
"id": 56157,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "josh.r.r...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "When expanding a story in iGoogle Chrome always jumps to the top of the page",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:17 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:55 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 20:29:14 GMT-0400 (EDT)'),
"state": "closed",
"id": 56155,
"labels": [
"Needs-Reduction",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Compat",
"bulkmove"
],
"author": "ra002...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Compat"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "JQuery UI Layout + Richfaces + Facelets = Panels Rendering Error.",
"OS": [],
"modified": new Date('Sun Mar 10 2013 16:36:48 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Sat Sep 25 2010 11:15:52 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 18:23:08 GMT-0400 (EDT)'),
"state": "closed",
"id": 56152,
"labels": [
"Cr-UI",
"Cr-UI-Settings",
"M-8",
"MovedToSettings",
"OS-All",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "jhawk...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Settings"
],
"status": "Fixed",
"cc": [
"zelidrag@chromium.org",
"dhg@chromium.org",
"glen@chromium.org",
"al...@google.com"
],
"owner": "csilv@chromium.org",
"summary": "DOMUI Settings page should be available at chrome://settings and chrome:settings",
"OS": [
"All"
],
"modified": new Date('Wed Mar 13 2013 18:17:25 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Jan 24 2011 20:37:43 GMT-0500 (EST)'),
"published": new Date('Sat Sep 18 2010 18:02:41 GMT-0400 (EDT)'),
"state": "closed",
"id": 56150,
"labels": [
"Cr-Blink",
"M-10",
"MovedFrom-9",
"Pri-1",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug-Regression",
"bulkmove"
],
"author": "nickro...@gmail.com",
"priority": "",
"pri": "1",
"app": [],
"type": [
"Bug-Regression"
],
"milestone": [
"10"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink"
],
"status": "Fixed",
"cc": [
"pkasting@chromium.org",
"venkatar...@chromium.org"
],
"owner": "pkasting@chromium.org",
"summary": "releasing a middle click opens the link regardless of the location of the initial click",
"OS": [],
"modified": new Date('Fri Apr 05 2013 22:06:42 GMT-0400 (EDT)'),
"starred": false,
"stars": 57,
"movedFrom": 9,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Sep 24 2010 21:55:41 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 18:00:38 GMT-0400 (EDT)'),
"state": "closed",
"id": 56149,
"labels": [
"Cr-UI",
"Cr-UI-Browser-Omnibox",
"OS-Mac",
"Pri-1",
"Restrict-AddIssueComment-Commit",
"Type-Bug-Regression",
"Verifier-Deepakg",
"bulkmove"
],
"author": "meh...@chromium.org",
"priority": "",
"pri": "1",
"app": [],
"type": [
"Bug-Regression"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-Omnibox"
],
"status": "Verified",
"cc": [
"shess@chromium.org",
"rohitrao@chromium.org",
"kr...@chromium.org",
"rohi...@chromium.org",
"pinkerton@chromium.org",
"ka...@chromium.org"
],
"owner": "isherman@chromium.org",
"summary": "Omnibox-Menu shrinks and suggestions disappear when I focus a suggestion with the arrow-key",
"OS": [
"Mac"
],
"modified": new Date('Sat Mar 09 2013 18:48:11 GMT-0500 (EST)'),
"starred": false,
"stars": 6,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:55 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 17:43:43 GMT-0400 (EDT)'),
"state": "closed",
"id": 56148,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "lhrr...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "ETA calculation",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:18 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Sat Oct 26 2013 08:50:36 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 16:36:57 GMT-0400 (EDT)'),
"state": "closed",
"id": 56146,
"labels": [
"Cr-UI-Internationalization",
"Mstone-X",
"Needs-Evangelism",
"Pri-2",
"RTL",
"Type-Compat",
"bulkmove"
],
"author": "prog...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Compat"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI-Internationalization"
],
"status": "WontFix",
"cc": [
"jeremy@chromium.org",
"jshin@chromium.org",
"x...@chromium.org"
],
"summary": "pardesia.muni.il: Bad encoding",
"OS": [],
"modified": new Date('Sat Oct 26 2013 08:50:36 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon Nov 29 2010 20:40:37 GMT-0500 (EST)'),
"published": new Date('Sat Sep 18 2010 15:55:45 GMT-0400 (EDT)'),
"state": "closed",
"id": 56142,
"labels": [
"Cr-Internals",
"Cr-Internals-Network",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "kurtp...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Network"
],
"status": "WontFix",
"cc": [
"a...@chromium.org"
],
"owner": "wtc@chromium.org",
"summary": "Website (https://www.hillsbank.com/) fails to display",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:38 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Mon May 23 2011 14:18:30 GMT-0400 (EDT)'),
"mergedInto": 76590,
"published": new Date('Sat Sep 18 2010 15:45:46 GMT-0400 (EDT)'),
"state": "closed",
"id": 56140,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "david.ha...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Status bar presence preventing clicking on underlying content.",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:19 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:52 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 14:49:56 GMT-0400 (EDT)'),
"state": "closed",
"id": 56135,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "sana...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "it gets hanged too often and is quite slow.i was unable to change screen resolution",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:20 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Feb 27 2013 16:36:05 GMT-0500 (EST)'),
"published": new Date('Sat Sep 18 2010 12:22:41 GMT-0400 (EDT)'),
"state": "closed",
"id": 56127,
"labels": [
"Pri-0",
"Restrict-AddIssueComment-Commit",
"Security",
"Type-Bug-Security"
],
"author": "URE...@gmail.com",
"priority": "",
"pri": "0",
"app": [],
"type": [
"Bug-Security"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Invalid",
"cc": [],
"summary": "送ります",
"OS": [],
"modified": new Date('Wed Feb 05 2014 22:05:15 GMT-0500 (EST)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Sep 23 2010 16:03:16 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 12:14:02 GMT-0400 (EDT)'),
"state": "closed",
"id": 56126,
"labels": [
"Cr-Blink",
"Cr-Internals-Media",
"M-8",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "fbarch...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Media"
],
"status": "Fixed",
"cc": [
"jz...@chromium.org"
],
"owner": "fbarch...@chromium.org",
"summary": "FFmpeg encoding does support partitions or altref",
"OS": [],
"modified": new Date('Fri Apr 05 2013 22:06:45 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:51 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 12:07:43 GMT-0400 (EDT)'),
"state": "closed",
"id": 56125,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "mykesx",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Developer tools scripts tab keeps disapearing",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:23 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [
50
],
"closed": new Date('Tue Oct 12 2010 12:42:44 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 12:07:14 GMT-0400 (EDT)'),
"state": "closed",
"id": 56124,
"labels": [
"Cr-Blink",
"Cr-Content-Core",
"OS-All",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "pcxunlimited@gmail.com",
"priority": "",
"pri": "",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Content-Core"
],
"status": "WontFix",
"cc": [
"pkasting@chromium.org"
],
"summary": "\"click\" event no longer works with middle click.",
"OS": [
"All"
],
"modified": new Date('Fri Apr 05 2013 22:06:45 GMT-0400 (EDT)'),
"starred": false,
"stars": 7,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:51 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 11:30:35 GMT-0400 (EDT)'),
"state": "closed",
"id": 56123,
"labels": [
"Cr-UI",
"Cr-UI-Browser-TabStrip",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "johnbarc...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-TabStrip"
],
"status": "IceBox",
"cc": [],
"summary": "Duplicate should not reload page",
"OS": [],
"modified": new Date('Sun Mar 10 2013 20:56:17 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:50 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 11:19:27 GMT-0400 (EDT)'),
"state": "closed",
"id": 56122,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "prashant...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "A web page opens by default without me opening in chrome. Is it a vrius?",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:24 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:49 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 09:34:11 GMT-0400 (EDT)'),
"state": "closed",
"id": 56117,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "ba...@shaw.ca",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "background:url where php routine is used to select image does not work on chrome - does work on IE, firefox",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:25 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Oct 20 2010 14:42:58 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 08:56:40 GMT-0400 (EDT)'),
"state": "closed",
"id": 56115,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Compat",
"bulkmove"
],
"author": "live4hi...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Compat"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "WontFix",
"cc": [],
"summary": "https://session.wikispaces.com/1/auth/auth?authToken=02e6af50ab374638bc5c9816662a03cb3",
"OS": [],
"modified": new Date('Sun Mar 10 2013 16:36:49 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Thu Oct 07 2010 20:44:35 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 08:53:11 GMT-0400 (EDT)'),
"state": "closed",
"id": 56114,
"labels": [
"Cr-UI",
"Cr-UI-Browser-FullScreen",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "purplepa...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI",
"UI-Browser-FullScreen"
],
"status": "WontFix",
"cc": [],
"summary": "Access to auto-hidden taskbar not available when in fullscreen mode",
"OS": [
"Windows"
],
"modified": new Date('Sun Mar 10 2013 20:56:19 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Feb 08 2011 08:14:35 GMT-0500 (EST)'),
"mergedInto": 67869,
"published": new Date('Sat Sep 18 2010 08:11:03 GMT-0400 (EDT)'),
"state": "closed",
"id": 56113,
"labels": [
"Cr-Internals",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "mity...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals"
],
"status": "Duplicate",
"cc": [],
"summary": "Don't work video acceliration",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:39 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Sat Sep 18 2010 06:51:27 GMT-0400 (EDT)'),
"state": "open",
"id": 56111,
"labels": [
"Cr-Internals",
"Cr-Internals-Graphics",
"Cr-Internals-Skia",
"MovedFrom-14",
"MovedFrom-16",
"MovedFrom-17",
"MovedFrom15",
"Pri-2",
"Type-Bug",
"bulkmove"
],
"author": "phistuck",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Graphics",
"Internals-Skia"
],
"status": "Available",
"cc": [
"lafo...@chromium.org"
],
"summary": "Text is much less readable",
"OS": [],
"modified": new Date('Sun Mar 10 2013 04:50:48 GMT-0400 (EDT)'),
"starred": false,
"stars": 7,
"movedFrom": 15,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Sat Sep 18 2010 06:03:39 GMT-0400 (EDT)'),
"mergedInto": 9885,
"published": new Date('Sat Sep 18 2010 05:55:27 GMT-0400 (EDT)'),
"state": "closed",
"id": 56109,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "thekoetj...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Window resize allows the window to get too small",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:26 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Sat Sep 18 2010 05:43:18 GMT-0400 (EDT)'),
"mergedInto": 19783,
"published": new Date('Sat Sep 18 2010 04:20:26 GMT-0400 (EDT)'),
"state": "closed",
"id": 56103,
"labels": [
"OS-Mac",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"Verifier-Rohitbm"
],
"author": "yaniv.ak...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Duplicate",
"cc": [],
"summary": "Cmd-K isn't mapped to search; no option to map it manually",
"OS": [
"Mac"
],
"modified": new Date('Mon Mar 11 2013 00:09:27 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Apr 19 2011 00:51:24 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 03:38:37 GMT-0400 (EDT)'),
"state": "closed",
"id": 56101,
"labels": [
"Cr-Internals",
"Cr-Internals-Network",
"Cr-Internals-Network-Auth",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "bugauga@yandex.ru",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-Network",
"Internals-Network-Auth"
],
"status": "WontFix",
"cc": [
"cbentzel@chromium.org",
"wtc@chromium.org"
],
"summary": "Chrome doesn's save login/password for .htpasswd authorization",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:39 GMT-0400 (EDT)'),
"starred": false,
"stars": 3,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Jun 24 2011 13:10:13 GMT-0400 (EDT)'),
"published": new Date('Sat Sep 18 2010 02:37:33 GMT-0400 (EDT)'),
"state": "closed",
"id": 56099,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "louisgud...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "WontFix",
"cc": [],
"summary": "memory leak on Windows XP",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:28 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Sep 21 2010 16:41:28 GMT-0400 (EDT)'),
"published": new Date('Fri Sep 17 2010 23:33:23 GMT-0400 (EDT)'),
"state": "closed",
"id": 56097,
"labels": [
"Cr-UI",
"OS-Windows",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "tara...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"UI"
],
"status": "WontFix",
"cc": [],
"summary": "Shortcut Key Issue",
"OS": [
"Windows"
],
"modified": new Date('Sun Mar 10 2013 20:56:20 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"published": new Date('Fri Sep 17 2010 23:28:30 GMT-0400 (EDT)'),
"state": "open",
"id": 56095,
"labels": [
"Cr-Blink",
"Cr-Blink-JavaScript",
"Pri-2",
"Type-Bug"
],
"author": "rebecca....@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Blink-JavaScript"
],
"status": "Assigned",
"cc": [
"isherman@chromium.org",
"ka...@chromium.org"
],
"owner": "danno@chromium.org",
"summary": "Markdown behavior since v6 branch",
"OS": [],
"modified": new Date('Fri Apr 05 2013 23:27:39 GMT-0400 (EDT)'),
"starred": false,
"stars": 14,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Feb 27 2013 16:36:05 GMT-0500 (EST)'),
"published": new Date('Fri Sep 17 2010 23:20:56 GMT-0400 (EDT)'),
"state": "closed",
"id": 56094,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "tara...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "Invalid",
"cc": [],
"summary": "MISTAKE OF SHORTCUT KEY",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:30 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Feb 27 2013 16:36:05 GMT-0500 (EST)'),
"published": new Date('Fri Sep 17 2010 21:53:07 GMT-0400 (EDT)'),
"state": "closed",
"id": 56091,
"labels": [
"Cr-Internals",
"Cr-Platform-Apps",
"Pri-0",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "mpcomplete@chromium.org",
"priority": "",
"pri": "0",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Platform-Apps"
],
"status": "Invalid",
"cc": [],
"owner": "mpcomplete@chromium.org",
"summary": "AppBackgroundPageApiTest.Basic broken by r59889",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:40 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Nov 16 2011 19:53:15 GMT-0500 (EST)'),
"published": new Date('Fri Sep 17 2010 20:47:56 GMT-0400 (EDT)'),
"state": "closed",
"id": 56087,
"labels": [
"Cr-Internals",
"Cr-Internals-GPU-Canvas2D",
"Mstone-X",
"Needs-Feedback",
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug",
"bulkmove"
],
"author": "gorud...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"X"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Internals",
"Internals-GPU-Canvas2D"
],
"status": "Fixed",
"cc": [],
"summary": "Harware rendering in linux doesnt work",
"OS": [],
"modified": new Date('Sun Mar 10 2013 18:31:40 GMT-0400 (EDT)'),
"starred": false,
"stars": 6,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Tue Oct 05 2010 20:11:55 GMT-0400 (EDT)'),
"published": new Date('Fri Sep 17 2010 18:30:21 GMT-0400 (EDT)'),
"state": "closed",
"id": 56080,
"labels": [
"Cr-Blink",
"Cr-Internals-Compositing",
"M-8",
"Pri-1",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "nduca@google.com",
"priority": "",
"pri": "1",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Compositing"
],
"status": "Fixed",
"cc": [
"vange...@google.com",
"scheib@chromium.org"
],
"owner": "nd...@chromium.org",
"summary": "Accelerated compositing: Blue scroll bars in windows",
"OS": [],
"modified": new Date('Fri Apr 05 2013 22:06:47 GMT-0400 (EDT)'),
"starred": false,
"stars": 5,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Fri Aug 10 2012 16:56:45 GMT-0400 (EDT)'),
"published": new Date('Fri Sep 17 2010 17:51:40 GMT-0400 (EDT)'),
"state": "closed",
"id": 56074,
"labels": [
"Pri-2",
"Restrict-AddIssueComment-Commit",
"Type-Bug"
],
"author": "ktm...@gmail.com",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [],
"iteration": [],
"releaseBlock": [],
"cr": [],
"status": "IceBox",
"cc": [],
"summary": "Chrome no longer connects to new or updates existing webpages.",
"OS": [],
"modified": new Date('Mon Mar 11 2013 00:09:32 GMT-0400 (EDT)'),
"starred": false,
"stars": 2,
"movedTo": []
},
{
model_: "QIssue",
"blockedOn": [],
"blocking": [],
"closed": new Date('Wed Sep 29 2010 05:15:12 GMT-0400 (EDT)'),
"published": new Date('Fri Sep 17 2010 17:41:10 GMT-0400 (EDT)'),
"state": "closed",
"id": 56071,
"labels": [
"Cr-Blink",
"Cr-Internals-Plugins-PDF",
"Cr-UI",
"M-8",
"Pri-2",
"Restrict-AddIssueComment-EditIssue",
"Type-Bug"
],
"author": "jeffr...@chromium.org",
"priority": "",
"pri": "2",
"app": [],
"type": [
"Bug"
],
"milestone": [
"8"
],
"iteration": [],
"releaseBlock": [],
"cr": [
"Blink",
"Internals-Plugins-PDF",
"UI"
],
"status": "Fixed",
"cc": [
"r...@chromium.org"
],
"owner": "g...@chromium.org",
"summary": "[PDF] adjustments to fading of tools buttons overlay",
"OS": [],
"modified": new Date('Fri Apr 05 2013 23:18:48 GMT-0400 (EDT)'),
"starred": false,
"stars": 1,
"movedTo": []
}]);

dao.dao;

this.X.touchManager = this.X.lookup('foam.input.touch.TouchManager').create({});
var gestureManager = this.X.lookup('foam.input.touch.GestureManager').create({});

var scroller = this.X.ExperimentalScrollView.create({ dao: dao });

var win = Window.create({ window: window });
win.view = scroller.toPositionedView_();

var scrollToTop = function() {
  Movement.animate(10000, function() { scroller.scrollTop = 0; }, undefined, function() {
    scrollToBottom();
  })();
};

var scrollToBottom = function() {
  Movement.animate(10000, function() { scroller.scrollTop = 1000; }, undefined, function() {
    scrollToTop();
  })();
}

scrollToBottom();
