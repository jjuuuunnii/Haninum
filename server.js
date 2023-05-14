//Create express app
/*
require로 express라이브러리 가져오기
app에 express객체 할당하기
이제 app변수를 사용해서 HTTP요청을 처리하고 응답하는 함수들을 등록하고, 서버를 실행하는 코드를 작성할수있음
*/
// require로 express 라이브러리 가져오기
var express = require("express");

// express 객체를 app 변수에 할당하기
var app = express();

// database.js 파일에서 db 객체 가져오기
var db = require("./database.js");

// md5 라이브러리 가져오기
var md5 = require("md5");

// body-parser 라이브러리 가져오기
var bodyParser = require("body-parser");

// urlencoded와 json 미들웨어 사용하기
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 서버 포트 설정하기
var HTTP_PORT = 8000;

// 서버 시작하기
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});

// 루트 엔드포인트 설정하기
app.get("/", (req, res, next) => {
  var sql = "SELECT * FROM user";
  var params = [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

// 사용자 리스트 엔드포인트 설정하기
app.get("/api/users", (req, res, next) => {
  var sql = "SELECT * FROM user";
  var params = [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

// 특정 사용자 정보 엔드포인트 설정하기
app.get("/api/user/:id", (req, res, next) => {
  var sql = "SELECT * FROM user WHERE id = ?";
  var params = [req.params.id];

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

// 새로운 사용자 추가 엔드포인트 설정하기
app.post("/api/user/", (req, res, next) => {
  var errors = [];

  if (!req.body.password) {
    errors.push("No password specified");
  }

  if (!req.body.email) {
    errors.push("No email specified");
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }

  var data = {
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
  };

  var sql =
    "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
  var params = [data.name, data.email, data.password];

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: data,
      id: this.lastID,
    });
  });
});

app.patch("/api/user/:id", (req, res, next) => {
  var data = {
      name: req.body.name,
      email: req.body.email,
      password : req.body.password ? md5(req.body.password) : null
  }
  db.run(
      `UPDATE user set 
         name = COALESCE(?,name), 
         email = COALESCE(?,email), 
         password = COALESCE(?,password) 
         WHERE id = ?`,
      [data.name, data.email, data.password, req.params.id],
      function (err, result) {
          if (err){
              res.status(400).json({"error": res.message})
              return;
          }
          res.json({
              message: "success",
              data: data,
              changes: this.changes
          })
  });
})

app.delete("/api/user/:id", (req, res, next) => {
  db.run(
      'DELETE FROM user WHERE id = ?',
      req.params.id,
      function (err, result) {
          if (err){
              res.status(400).json({"error": res.message})
              return;
          }
          res.json({"message":"deleted", changes: this.changes})
  });
})

// 404 Not Found 에러 핸들링하기
app.use(function(req, res){
  res.status(404).json({"error": "Not found"});
});
