FOAModel({
  name: 'Contact',

  properties: [
    { name: 'id' },
    { model_: 'StringProperty', name: 'first' },
    { model_: 'StringProperty', name: 'last' },
    { model_: 'StringProperty', name: 'email' },
    { model_: 'StringProperty',
      name: 'color',
      factory: function() {
        var c = Math.floor(Math.random() * 0xffffff).toString(16);
        while ( c.length < 6 ) {
          c = "0" + c;
        }
        return "#" + c;
      }
    }
  ]
});

var dao = EasyDAO.create({
  model: Contact,
  seqNo: true,
  seqProperty: Contact.ID,
  daoType: 'MDAO',
  cache: false
});
  
dao.put(Contact.create({ first: "Harry", last: 	"Chandler", email: "Harry@Chandler.com" }));
dao.put(Contact.create({ first: "Austin", last: 	"Nelson", email: "Austin@Nelson.com" }));
dao.put(Contact.create({ first: "Ruby", last: 	"Romero", email: "Ruby@Romero.com" }));
dao.put(Contact.create({ first: "Henry", last: 	"Vaughn", email: "Henry@Vaughn.com" }));
dao.put(Contact.create({ first: "Katie", last: 	"Mason", email: "Katie@Mason.com" }));
dao.put(Contact.create({ first: "Kayla", last: 	"Cunningham", email: "Kayla@Cunningham.com" }));
dao.put(Contact.create({ first: "Lula", last: 	"Mitchell", email: "Lula@Mitchell.com" }));
dao.put(Contact.create({ first: "Dana", last: 	"Erickson", email: "Dana@Erickson.com" }));
dao.put(Contact.create({ first: "Chad", last: 	"Christensen", email: "Chad@Christensen.com" }));
dao.put(Contact.create({ first: "Yvette", last: 	"Clarke", email: "Yvette@Clarke.com" }));
dao.put(Contact.create({ first: "Danny", last: 	"Sims", email: "Danny@Sims.com" }));
dao.put(Contact.create({ first: "Angelina", last: 	"Frazier", email: "Angelina@Frazier.com" }));
dao.put(Contact.create({ first: "Delia", last: 	"Love", email: "Delia@Love.com" }));
dao.put(Contact.create({ first: "Denise", last: 	"Gonzales", email: "Denise@Gonzales.com" }));
dao.put(Contact.create({ first: "Brandi", last: 	"Palmer", email: "Brandi@Palmer.com" }));
dao.put(Contact.create({ first: "Dexter", last: 	"Reed", email: "Dexter@Reed.com" }));
dao.put(Contact.create({ first: "Ramona", last: 	"Craig", email: "Ramona@Craig.com" }));
dao.put(Contact.create({ first: "Lyle", last: 	"Castillo", email: "Lyle@Castillo.com" }));
dao.put(Contact.create({ first: "Ricardo", last: 	"Saunders", email: "Ricardo@Saunders.com" }));
dao.put(Contact.create({ first: "Rose", last: 	"Goodman", email: "Rose@Goodman.com" }));
dao.put(Contact.create({ first: "Pat", last: 	"Watson", email: "Pat@Watson.com" }));
dao.put(Contact.create({ first: "Courtney", last: 	"Shelton", email: "Courtney@Shelton.com" }));
dao.put(Contact.create({ first: "Lucille", last: 	"Becker", email: "Lucille@Becker.com" }));
dao.put(Contact.create({ first: "Adrienne", last: 	"Benson", email: "Adrienne@Benson.com" }));
dao.put(Contact.create({ first: "Sadie", last: 	"Phelps", email: "Sadie@Phelps.com" }));
dao.put(Contact.create({ first: "Helen", last: 	"Jenkins", email: "Helen@Jenkins.com" }));
dao.put(Contact.create({ first: "Irving", last: 	"Ortega", email: "Irving@Ortega.com" }));
dao.put(Contact.create({ first: "Nora", last: 	"Fox", email: "Nora@Fox.com" }));
dao.put(Contact.create({ first: "Caleb", last: 	"Blair", email: "Caleb@Blair.com" }));
dao.put(Contact.create({ first: "Duane", last: 	"Sparks", email: "Duane@Sparks.com" }));
dao.put(Contact.create({ first: "Sara", last: 	"Bowen", email: "Sara@Bowen.com" }));
dao.put(Contact.create({ first: "Jackie", last: 	"Yates", email: "Jackie@Yates.com" }));
dao.put(Contact.create({ first: "Jenna", last: 	"Hardy", email: "Jenna@Hardy.com" }));
dao.put(Contact.create({ first: "Kenneth", last: 	"Greer", email: "Kenneth@Greer.com" }));
dao.put(Contact.create({ first: "Kristina", last: 	"Davis", email: "Kristina@Davis.com" }));
dao.put(Contact.create({ first: "Gail", last: 	"Wright", email: "Gail@Wright.com" }));
dao.put(Contact.create({ first: "Garrett", last: 	"Byrd", email: "Garrett@Byrd.com" }));
dao.put(Contact.create({ first: "Luz", last: 	"Hunter", email: "Luz@Hunter.com" }));
dao.put(Contact.create({ first: "Janis", last: 	"Miller", email: "Janis@Miller.com" }));
dao.put(Contact.create({ first: "Julie", last: 	"Bates", email: "Julie@Bates.com" }));
dao.put(Contact.create({ first: "Bernice", last: 	"Roberson", email: "Bernice@Roberson.com" }));
dao.put(Contact.create({ first: "Laura", last: 	"Brown", email: "Laura@Brown.com" }));
dao.put(Contact.create({ first: "Terri", last: 	"Little", email: "Terri@Little.com" }));
dao.put(Contact.create({ first: "Bradley", last: 	"Barton", email: "Bradley@Barton.com" }));
dao.put(Contact.create({ first: "Patrick", last: 	"Ortiz", email: "Patrick@Ortiz.com" }));
dao.put(Contact.create({ first: "Sonia", last: 	"Bass", email: "Sonia@Bass.com" }));
dao.put(Contact.create({ first: "Edith", last: 	"Garrett", email: "Edith@Garrett.com" }));
dao.put(Contact.create({ first: "Frankie", last: 	"Valdez", email: "Frankie@Valdez.com" }));
dao.put(Contact.create({ first: "Jermaine", last: 	"Mccoy", email: "Jermaine@Mccoy.com" }));
dao.put(Contact.create({ first: "Zachary", last: 	"Hayes", email: "Zachary@Hayes.com" }));

FOAModel({
  name: 'ContactRowView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value'
    }
  ],

  templates: [
    {
      name: 'toHTML',
      template: '<div id="<%= this.getID() %>" style="height:200px;background:<%= this.value.value.color %>">' +
        '<span>%%value.value.first <b>%%value.value.last</b></span>' +
        '</div>'
    }
  ]
});

var view = TouchListView.create({
  rowView: 'ContactRowView',
  rowViewHeight: 200,
  height: document.body.offsetHeight,
  dao: dao
});

view.write(document);
