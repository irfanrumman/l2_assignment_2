import { pool } from "../../db";

const createIssueToDB = async (payload: any) => {
  const { title, description, type, reporter_id } = payload;

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
    INSERT INTO issues(title, description, type, reporter_id) VALUES($1, $2, $3, $4)  RETURNING *
    `,
    [title, description, type, reporter_id],
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

export const issueServiece = {
  createIssueToDB,
};
