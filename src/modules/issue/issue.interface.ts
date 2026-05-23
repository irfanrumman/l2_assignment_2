type issueSort = "newest" | "oldest";
type issueType = "bug" | "feature_request";
type issueStatus = "open" | "in_progress" | "resolved";

export interface IIssueQueryOptions {
  sort?: issueSort;
  type?: issueType;
  status?: issueStatus;
}

export interface ICreateIssue {
  title: string;
  description: string;
  type: issueType;
  status: issueStatus;
  reporter_id: number;
}
