CLASS({
  name: 'Contact',

  properties: [
    { name: 'id' },
    { type: 'String', name: 'first' },
    { type: 'String', name: 'last' },
    { type: 'String', name: 'email' },
    {
      name: 'avatar',
      factory: function() {
        var blob = new Blob(['<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="64" height="64"><rect width="64" height="64" x="0" y="0" style="fill:#d40000"/><text x="32" y="32" style="text-anchor:middle;font-size:19;font-style:normal;font-weight:bold;font-family:Arial, sans;fill:#fff">' + this.last[0] + '</text></svg>'], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
      }
    },
    { type: 'String',
      name: 'color',
      factory: function() {
        var colors = 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' ');
        var c = Math.abs(this.hashCode()) % colors.length;
        return '#' + colors[c];
      }
    }
  ]
});

var dao = X.lookup('foam.dao.EasyDAO').create({
  model: Contact,
  seqNo: true,
  seqProperty: Contact.ID,
  daoType: 'MDAO',
  cache: false
});

dao.put(Contact.create({ first: "Harry", last:   "Chandler", email: "Harry@Chandler.com" }));
dao.put(Contact.create({ first: "Austin", last:   "Nelson", email: "Austin@Nelson.com" }));
dao.put(Contact.create({ first: "Ruby", last:   "Romero", email: "Ruby@Romero.com" }));
dao.put(Contact.create({ first: "Henry", last:   "Vaughn", email: "Henry@Vaughn.com" }));
dao.put(Contact.create({ first: "Katie", last:   "Mason", email: "Katie@Mason.com" }));
dao.put(Contact.create({ first: "Kayla", last:   "Cunningham", email: "Kayla@Cunningham.com" }));
dao.put(Contact.create({ first: "Lula", last:   "Mitchell", email: "Lula@Mitchell.com" }));
dao.put(Contact.create({ first: "Dana", last:   "Erickson", email: "Dana@Erickson.com" }));
dao.put(Contact.create({ first: "Chad", last:   "Christensen", email: "Chad@Christensen.com" }));
dao.put(Contact.create({ first: "Yvette", last:   "Clarke", email: "Yvette@Clarke.com" }));
dao.put(Contact.create({ first: "Danny", last:   "Sims", email: "Danny@Sims.com" }));
dao.put(Contact.create({ first: "Angelina", last:   "Frazier", email: "Angelina@Frazier.com" }));
dao.put(Contact.create({ first: "Delia", last:   "Love", email: "Delia@Love.com" }));
dao.put(Contact.create({ first: "Denise", last:   "Gonzales", email: "Denise@Gonzales.com" }));
dao.put(Contact.create({ first: "Brandi", last:   "Palmer", email: "Brandi@Palmer.com" }));
dao.put(Contact.create({ first: "Dexter", last:   "Reed", email: "Dexter@Reed.com" }));
dao.put(Contact.create({ first: "Ramona", last:   "Craig", email: "Ramona@Craig.com" }));
dao.put(Contact.create({ first: "Lyle", last:   "Castillo", email: "Lyle@Castillo.com" }));
dao.put(Contact.create({ first: "Ricardo", last:   "Saunders", email: "Ricardo@Saunders.com" }));
dao.put(Contact.create({ first: "Rose", last:   "Goodman", email: "Rose@Goodman.com" }));
dao.put(Contact.create({ first: "Pat", last:   "Watson", email: "Pat@Watson.com" }));
dao.put(Contact.create({ first: "Courtney", last:   "Shelton", email: "Courtney@Shelton.com" }));
dao.put(Contact.create({ first: "Lucille", last:   "Becker", email: "Lucille@Becker.com" }));
dao.put(Contact.create({ first: "Adrienne", last:   "Benson", email: "Adrienne@Benson.com" }));
dao.put(Contact.create({ first: "Sadie", last:   "Phelps", email: "Sadie@Phelps.com" }));
dao.put(Contact.create({ first: "Helen", last:   "Jenkins", email: "Helen@Jenkins.com" }));
dao.put(Contact.create({ first: "Irving", last:   "Ortega", email: "Irving@Ortega.com" }));
dao.put(Contact.create({ first: "Nora", last:   "Fox", email: "Nora@Fox.com" }));
dao.put(Contact.create({ first: "Caleb", last:   "Blair", email: "Caleb@Blair.com" }));
dao.put(Contact.create({ first: "Duane", last:   "Sparks", email: "Duane@Sparks.com" }));
dao.put(Contact.create({ first: "Sara", last:   "Bowen", email: "Sara@Bowen.com" }));
dao.put(Contact.create({ first: "Jackie", last:   "Yates", email: "Jackie@Yates.com" }));
dao.put(Contact.create({ first: "Jenna", last:   "Hardy", email: "Jenna@Hardy.com" }));
dao.put(Contact.create({ first: "Kenneth", last:   "Greer", email: "Kenneth@Greer.com" }));
dao.put(Contact.create({ first: "Kristina", last:   "Davis", email: "Kristina@Davis.com" }));
dao.put(Contact.create({ first: "Gail", last:   "Wright", email: "Gail@Wright.com" }));
dao.put(Contact.create({ first: "Garrett", last:   "Byrd", email: "Garrett@Byrd.com" }));
dao.put(Contact.create({ first: "Luz", last:   "Hunter", email: "Luz@Hunter.com" }));
dao.put(Contact.create({ first: "Janis", last:   "Miller", email: "Janis@Miller.com" }));
dao.put(Contact.create({ first: "Julie", last:   "Bates", email: "Julie@Bates.com" }));
dao.put(Contact.create({ first: "Bernice", last:   "Roberson", email: "Bernice@Roberson.com" }));
dao.put(Contact.create({ first: "Laura", last:   "Brown", email: "Laura@Brown.com" }));
dao.put(Contact.create({ first: "Terri", last:   "Little", email: "Terri@Little.com" }));
dao.put(Contact.create({ first: "Bradley", last:   "Barton", email: "Bradley@Barton.com" }));
dao.put(Contact.create({ first: "Patrick", last:   "Ortiz", email: "Patrick@Ortiz.com" }));
dao.put(Contact.create({ first: "Sonia", last:   "Bass", email: "Sonia@Bass.com" }));
dao.put(Contact.create({ first: "Edith", last:   "Garrett", email: "Edith@Garrett.com" }));
dao.put(Contact.create({ first: "Frankie", last:   "Valdez", email: "Frankie@Valdez.com" }));
dao.put(Contact.create({ first: "Jermaine", last:   "Mccoy", email: "Jermaine@Mccoy.com" }));
dao.put(Contact.create({ first: "Zachary", last:   "Hayes", email: "Zachary@Hayes.com" }));

CLASS({
  name: 'ContactRowView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'value'
    }
  ],

  templates: [
    {
      name: 'toHTML',
      template: '<div id="<%= this.id %>" style="height:200px;background:<%= this.value.value.color %>">' +
        '<span>%%value.value.first <b>%%value.value.last</b></span>' +
        '</div>'
    }
  ]
});

CLASS({
  name: 'ContactRowRenderer',
  properties: [
    { name: 'height', defaultValue: 200 }
  ],
  methods: {
    render: function(ctx, obj) {

      ctx.beginPath();
      ctx.arc(36, 44, 20, 0, 2 * Math.PI, false);
      ctx.fillStyle = obj.color;
      ctx.strokeStyle = "#e5e5e5";
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = '20px Roboto';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.last[0], 36, 44);

      ctx.font = '16px Roboto';
      ctx.fillStyle = "#444";
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(obj.first + ' ' + obj.last, 72, 40);

      var words = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'.split(' ');
      var text = words[0];

      ctx.fillStyle = "#999";

      var max = 200;
      var w = 0;
      var i = 1;
      while ( true ) {
        var metrics = ctx.measureText(text + ' ' + words[i]);
        if ( metrics.width > max ) break;
        text += ' ' + words[i++];
      }

      ctx.fillText(text, 72, 60);
    }
  }
});

var view = DAOListCView.create({
  rowRenderer: ContactRowRenderer.create({}),
  width: 400,
  height: 800
});

var cview = CViewView.create({
  cview: view,
  width: 400,
  height: 800
});

cview.write();

view.dao = dao;

var Y = this.X.subWindow(window);
Y.registerModel(MomentumTouch, 'FOAMTouch');
Y.registerModel(MomentumTouchManager, 'TouchManager');

var touch = Y.foam.input.touch.TouchManager.create({});
touch.install(document);

touch.subscribe(touch.TOUCH_START, function(_, _, t) {
  t.y$.addListener(function(_,_,old,nu) {
    view.scrollTop = view.scrollTop + old - nu;
  });
});
