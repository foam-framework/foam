var RemoteSend = function(path) {
  return function(ret, msg) {
    var data = JSONUtil.compact.stringify(msg);
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

var PersonDAO = ClientDAO.create({
  model: Person,
  asend: RemoteSend('http://127.0.0.1:8080/api')
});
