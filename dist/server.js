// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/configaration/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connection: process.env.CONNECTION_STRING,
  secret: process.env.JWT_SECRET,
  expTime: process.env.JWT_EXPIRESINTIME,
  refresh_secrete: process.env.JWT_REFRESH_SECRET
};
var configaration_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: configaration_default.connection
});
var initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(20) UNIQUE NOT NULL,
    password TEXT NOT NULL,

    role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN('contributor', 'maintainer')),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    ) 
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL CHECK (char_length(trim(description)) >=20),
      type VARCHAR(255) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(255) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
      reporter_id INT NOT NULL,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("db connected");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.serviece.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var signupUserToDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
     INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  if (result.rows.length === 0) {
    throw new Error("User not created");
  }
  delete result.rows[0].password;
  return result.rows[0];
};
var loginUserFromDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Wrong Email!");
  }
  const logUser = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, logUser.password);
  if (!matchPassword) {
    throw new Error("Wrong Password");
  }
  const jwtPayload = {
    id: logUser.id,
    name: logUser.name,
    email: logUser.email,
    role: logUser.role
  };
  const token = jwt.sign(jwtPayload, configaration_default.secret, {
    expiresIn: "1d"
  });
  const user = {
    ...jwtPayload,
    created_at: logUser.created_at,
    updated_at: logUser.updated_at
  };
  return { token, user };
};
var authService = {
  signupUserToDB,
  loginUserFromDB
};

// src/utils/sedResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sedResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await authService.signupUserToDB(req.body);
    sedResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var loginUser = async (req, res) => {
  try {
    const { token, user } = await authService.loginUserFromDB(req.body);
    sedResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { token, user }
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var authController = {
  signupUser,
  loginUser
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.serviece.ts
var createIssueToDB = async (payload) => {
  const { title, description, type, status, reporter_id } = payload;
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id]
  );
  if (user.rows.length === 0) {
    throw new Error("User Not Exists");
  }
  const insetIssueIntoDB = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, COALESCE($4, 'open'), $5)  RETURNING *
    `,
    [title, description, type, status, reporter_id]
  );
  if (!insetIssueIntoDB.rows || insetIssueIntoDB.rows.length === 0) {
    throw new Error("Issue Creation Failed");
  }
  const result = insetIssueIntoDB.rows[0];
  return result;
};
var getAllIssuesFromDB = async (payload) => {
  const { sort = "newest", type, status } = payload;
  let queryText = `SELECT * FROM issues`;
  const queryValues = [];
  const whereConditions = [];
  if (type) {
    queryValues.push(type);
    whereConditions.push(`type = $${queryValues.length}`);
  }
  if (status) {
    queryValues.push(status);
    whereConditions.push(`status = $${queryValues.length}`);
  }
  if (whereConditions.length > 0) {
    queryText += ` WHERE ${whereConditions.join(" AND ")}`;
  }
  const orderby = sort === "oldest" ? "ASC" : "DESC";
  queryText += ` ORDER BY created_at ${orderby}`;
  const result = await pool.query(queryText, queryValues);
  const issues = result.rows;
  if (issues.length === 0) {
    return [];
  }
  const allReporterId = [...new Set(issues.map((issue) => issue.reporter_id))];
  const dynamicPlaceHolder = allReporterId.map((_, index) => `$${index += 1}`).join(",");
  const usersResult = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id IN (${dynamicPlaceHolder})`,
    allReporterId
  );
  const users = usersResult.rows;
  const userReporter = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
  const finalIssueFormat = issues.map((issue) => {
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: userReporter[issue.reporter_id],
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
  return finalIssueFormat;
};
var getSingleIssueFromDB = async (id) => {
  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  if (issueData.rows.length === 0) {
    throw new Error("Issue Not Found!");
  }
  const issue = issueData.rows[0];
  const reporterId = issue.reporter_id;
  const userResult = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=$1
    `,
    [reporterId]
  );
  const user = userResult.rows[0];
  const finalIssueReult = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: user,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return finalIssueReult;
};
var updateIssueIntoDB = async (id, userId, userRole, payload) => {
  const { title, description, type } = payload;
  const issueSelect = await pool.query(
    `
      SELECT reporter_id, status FROM issues WHERE id = $1
      `,
    [id]
  );
  if (issueSelect.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueSelect.rows[0];
  if (userRole !== "maintainer") {
    if (issue.reporter_id !== Number(userId)) {
      throw new Error("You're unauthorized to update the issue");
    }
    if (issue.status !== "open") {
      throw new Error("Contributors can only update issues with 'open' status");
    }
  }
  if (title === void 0 && description === void 0 && type === void 0) {
    throw new Error("Please provide at least one field to update");
  }
  const values = [
    title !== void 0 ? title : null,
    description !== void 0 ? description : null,
    type !== void 0 ? type : null,
    id
  ];
  const updatedResult = await pool.query(
    `
    UPDATE issues
    SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    type = COALESCE($3, type),
    updated_at = NOW() 
    WHERE id = $4
    RETURNING *
    `,
    values
  );
  const result = updatedResult.rows[0];
  return result;
};
var deleteIssueFromDB = async (id) => {
  const checkIssue = await pool.query(`SELECT id FROM issues WHERE id = $1`, [
    id
  ]);
  if (checkIssue.rows.length === 0) {
    throw new Error("Issue not found");
  }
  await pool.query(
    `DELETE FROM issues WHERE id = $1`,
    [id]
  );
};
var issueServiece = {
  createIssueToDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporter_id = req.user?.id;
    const result = await issueServiece.createIssueToDB({
      ...req.body,
      reporter_id
    });
    sedResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var getALlIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issueServiece.getAllIssuesFromDB({
      sort,
      type,
      status
    });
    sedResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result || []
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueServiece.getSingleIssueFromDB(id);
    sedResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = await issueServiece.updateIssueIntoDB(
      id,
      userId,
      userRole,
      req.body
    );
    sedResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var removeIssue = async (req, res) => {
  try {
    const { id } = req.params;
    await issueServiece.deleteIssueFromDB(id);
    sedResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    if (error instanceof Error) {
      sedResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    }
  }
};
var issueController = {
  createIssue,
  getALlIssues,
  getSingleIssue,
  updateIssue,
  removeIssue
};

// src/middelware/auth.ts
import jwt2 from "jsonwebtoken";
var authMiddelWare = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sedResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access!!"
        });
        return;
      }
      const decoded = jwt2.verify(
        token,
        configaration_default.secret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email=$1
      `,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        sedResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized!"
        });
        return;
      }
      if (!user.role) {
        sedResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "User can not see issues!"
        });
      }
      if (!roles.includes(userData.rows[0].role)) {
        sedResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden Access!"
        });
        return;
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = authMiddelWare;

// src/modules/issue/issue.route.ts
var router2 = Router2();
var authParamiter = {
  contributor: "contributor",
  maintainer: "maintainer"
};
router2.post(
  "/",
  auth_default(authParamiter.contributor, authParamiter.maintainer),
  issueController.createIssue
);
router2.get("/", issueController.getALlIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch(
  "/:id",
  auth_default(authParamiter.contributor, authParamiter.maintainer),
  issueController.updateIssue
);
router2.delete(
  "/:id",
  auth_default(authParamiter.maintainer),
  issueController.removeIssue
);
var issueRoute = router2;

// src/middelware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Invalid data provided";
  }
  res.status(statusCode).json({
    success: false,
    error: message
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
import cors from "cors";
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome To The Our Team!"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  try {
    initDB();
    app_default.listen(configaration_default.port, () => {
      console.log(`server is running! on port ${configaration_default.port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
main();
//# sourceMappingURL=server.js.map