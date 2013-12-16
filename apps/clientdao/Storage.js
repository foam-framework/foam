var RemoteSend = function(path) {
  return function(ret, msg) {
    var data = JSONUtil.stringify(msg);
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("POST", path);
    aseq(
      function(ret) {
        xhr.asend(ret, data);
      },
      function(ret, resp) {
        resp = FOAM(resp);
        ret(resp);
      })(ret);
  };
};

var Person = FOAM({
  model_: 'Model',
  name: 'Person',

  properties: [
    { name: 'id' },
    { name: 'name' },
    { name: 'sex', defaultValue: 'M' },
    { model_: 'IntegerProperty', name: 'age' }
  ]
});

var PersonDAO = ClientDAO.create({
  model: Person,
  asend: RemoteSend('http://172.23.181.171:8080/api')
});
