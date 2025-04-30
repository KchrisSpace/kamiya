const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// 自定义中间件处理登录请求
server.use(jsonServer.bodyParser);
server.use(middlewares);

// 登录验证中间件
server.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 验证管理员账号
  if (username === "admin" && password === "000000") {
    return res.json({
      success: true,
      user: {
        username: "admin",
        role: "admin",
      },
      token: "admin-token",
    });
  }

  // 验证普通用户账号
  const users = router.db.get("login[0].user").value();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: "user",
      },
      token: "user-token",
    });
  }

  // 验证失败
  res.status(401).json({
    success: false,
    message: "用户名或密码错误",
  });
});

// 使用默认路由
server.use(router);

// 启动服务器
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
