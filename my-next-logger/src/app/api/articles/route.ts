// src/app/api/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ArticleRepository } from "@/lib/repositories/article";
import { DBMetrics } from "@/lib/db";
import { recordLatency, recordMetric } from "@/lib/metrics/edge";
import {
  ArticleCreateLabels,
  ErrorLabels,
  PerformanceLabels
} from "@/lib/metrics/types";
import logger from "@/logger";
import { delay } from "@/utils/delay";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  logger.info(`Starting POST request ${requestId}`);

  try {
    const data = await request.json();
    logger.info(
      `Request ${requestId} parsed JSON data in ${
        performance.now() - startTime
      }ms`
    );

    if (!data.title || !data.content || !data.category) {
      logger.warn(
        `Request ${requestId} failed validation - missing required fields`
      );
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    logger.info(
      `Request ${requestId} starting DB operation for article creation`
    );
    const article = await DBMetrics.measureQuery("create_article", () =>
      ArticleRepository.create({
        title: data.title,
        content: data.content,
        category: data.category
      })
    );
    logger.info(
      `Request ${requestId} completed DB operation in ${
        performance.now() - startTime
      }ms`
    );

    logger.info(
      `Article ${article.id} created successfully in category ${article.category}`
    );

    // Metriky pro vytvoření článku
    recordMetric("blog_article_create_total", 1, {
      category: data.category
    } as ArticleCreateLabels);

    logger.info(
      `Request ${requestId} completed in ${performance.now() - startTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: article
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Request ${requestId} failed with error: ${errorMessage}`);

    recordMetric("blog_errors_total", 1, {
      type: "article_create_error",
      code: "500"
    } as ErrorLabels);

    return NextResponse.json(
      { success: false, error: "Failed to create article" },
      { status: 500 }
    );
  } finally {
    recordLatency("article_create", startTime);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  logger.info(`Starting GET request ${requestId}`);

  //   await delay(10000);

  try {
    logger.info(`Request ${requestId} starting DB fetch operation`);
    const articles = await DBMetrics.measureQuery("fetch_articles", () =>
      ArticleRepository.findAll()
    );
    logger.info(
      `Request ${requestId} fetched ${articles.length} articles in ${
        performance.now() - startTime
      }ms`
    );

    return NextResponse.json({
      success: true,
      data: articles
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(
      `Request ${requestId} failed to fetch articles: ${errorMessage}`
    );

    recordMetric("blog_errors_total", 1, {
      type: "articles_list_error"
    } as ErrorLabels);

    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  } finally {
    logger.info(
      `Request ${requestId} completed in ${performance.now() - startTime}ms`
    );
    recordLatency("articles_list", startTime);
  }
}
