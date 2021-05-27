const express = require("express");
const apiRouter = express();
const employeeRouter = require("./employees.js");
const menuRouter = require("./menus");


apiRouter.use("/employees",employeeRouter);
apiRouter.use("/menus",menuRouter);
module.exports = apiRouter;