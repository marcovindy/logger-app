// src/lib/metrics/types.ts
export interface MetricValue {
  value: number;
  timestamp: number;
}

interface BaseArticleLabels {
  article_id: string;
}

export interface ArticleViewLabels extends BaseArticleLabels {
  category: string;
}

export interface CommentLabels extends BaseArticleLabels {
  status: string;
}

export interface ErrorLabels {
  type: string;
  article_id?: string;
  code?: string;
}

export interface PerformanceLabels {
  operation:
    | "articles_list"
    | "article_create"
    | "article_detail"
    | "comments_list"
    | "comment_create"
    | string;
  le?: string;
}

export interface ArticleCreateLabels {
  category: string;
}

export interface DBQueryLabels {
  operation: string;
  status?: "success" | "error";
  le?: string;
}

export type MetricLabels =
  | ArticleViewLabels
  | CommentLabels
  | ErrorLabels
  | PerformanceLabels
  | ArticleCreateLabels
  | DBQueryLabels;

// Base metric names
export type BaseMetricName =
  | "blog_article_views_total"
  | "blog_comments_total"
  | "blog_errors_total"
  | "blog_performance_seconds"
  | "blog_article_create_total"
  | "blog_db_query_duration_seconds"
  | "blog_db_queries_total"
  | "blog_db_operations_count";

// Histogram suffixes
export type HistogramSuffix = "" | "_bucket" | "_sum" | "_count";

// Full metric name type
export type MetricName = BaseMetricName | `${BaseMetricName}${HistogramSuffix}`;

export interface MetricData {
  [key: string]: MetricValue;
}
