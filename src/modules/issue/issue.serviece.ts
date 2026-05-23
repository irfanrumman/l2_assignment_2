import { pool } from "../../db";
import type { ICreateIssue, IIssueQueryOptions } from "./issue.interface";

const createIssueToDB = async (payload: ICreateIssue) => {
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

const getSingleIssueFromDB = async (id: string) => {
  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
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
    [reporterId],
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
    updated_at: issue.updated_at,
  };

  return finalIssueReult;
};

const updateIssueIntoDB = async (
  id: string,
  userId: number,
  userRole: string,
  payload: any,
) => {
  const { title, description, type } = payload;

  const issueSelect = await pool.query(
    `
      SELECT reporter_id, status FROM issues WHERE id = $1
      `,
    [id],
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

  if (title === undefined && description === undefined && type === undefined) {
    throw new Error("Please provide at least one field to update");
  }

  const values = [
    title !== undefined ? title : null,
    description !== undefined ? description : null,
    type !== undefined ? type : null,
    id,
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
    values,
  );

  const result = updatedResult.rows[0];

  return result;
};

const deleteIssueFromDB = async (id: string) => {

  const checkIssue = await pool.query(`SELECT id FROM issues WHERE id = $1`, [
    id,
  ]);
  if (checkIssue.rows.length === 0) {
    throw new Error("Issue not found");
  }

  await pool.query(
    `DELETE FROM issues WHERE id = $1`,
    [id]
  );
};
export const issueServiece = {
  createIssueToDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};
