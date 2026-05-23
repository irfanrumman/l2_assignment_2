import { pool } from "../../db";
import type { IIssueQueryOptions } from "./issue.interface";

const createIssueToDB = async (payload: any) => {
  const { title, description, type, status, reporter_id } = payload;

  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id],
  );

  if (user.rows.length === 0) {
    throw new Error("User Not Exists");
  }

  const insetIssueIntoDB = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, COALESCE($4, 'open'), $5)  RETURNING *
    `,
    [title, description, type, status, reporter_id],
  );
  if (!insetIssueIntoDB.rows || insetIssueIntoDB.rows.length === 0) {
    throw new Error("Issue Creation Failed");
  }
  const result = insetIssueIntoDB.rows[0];

  return result;

  /*
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
  */
};

const getAllIssuesFromDB = async (payload: IIssueQueryOptions) => {
  const { sort = "newest", type, status } = payload;

  let queryText = `SELECT * FROM issues`;
  const queryValues: string[] = [];
  const whereConditions: string[] = [];

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

  const dynamicPlaceHolder = allReporterId
    .map((_, index) => `$${(index += 1)}`)
    .join(",");

  const usersResult = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id IN (${dynamicPlaceHolder})`,
    allReporterId,
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
      updated_at: issue.updated_at,
    };
  });

  return finalIssueFormat;
};

export const issueServiece = {
  createIssueToDB,
  getAllIssuesFromDB,
};
