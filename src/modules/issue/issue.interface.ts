type issueSort = "newest" | "oldest";
type issueType = "bug" | "feature_request";
type issueStatus = "open" | "in_progress" | "resolved";

export interface IIssueQueryOptions {
  sort?: issueSort;
  type?: issueType;
  status?: issueStatus;
}
