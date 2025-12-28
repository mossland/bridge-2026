import { RawSignal, NormalizedSignal, SignalSource } from "@oracle/core";
import { BaseAdapter } from "./base.js";

export interface SocialAdapterConfig {
  mediumRssUrl?: string;
  twitterBearerToken?: string;
  twitterUsername?: string;
}

const DEFAULT_MEDIUM_RSS = "https://medium.com/feed/mossland-blog";
const DEFAULT_TWITTER_USER = "TheMossland";
const TWITTER_API = "https://api.twitter.com/2";

interface MediumItem {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  categories: string[];
  content: string;
  guid: string;
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  author_id?: string;
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface RssResponse {
  status: string;
  items: MediumItem[];
}

interface TwitterUserResponse {
  data: TwitterUser;
}

interface TwitterTweetsResponse {
  data: Tweet[];
}

export class SocialAdapter extends BaseAdapter {
  readonly name = "SocialAdapter";
  readonly source: SignalSource = "api";

  private config: SocialAdapterConfig;
  private lastMediumGuid: string = "";
  private lastTweetId: string = "";

  constructor(config: SocialAdapterConfig = {}) {
    super();
    this.config = {
      mediumRssUrl: config.mediumRssUrl || DEFAULT_MEDIUM_RSS,
      twitterBearerToken: config.twitterBearerToken,
      twitterUsername: config.twitterUsername || DEFAULT_TWITTER_USER,
    };
  }

  async fetch(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // 1. Fetch Medium RSS
      const mediumSignals = await this.fetchMediumRss();
      signals.push(...mediumSignals);

      // 2. Fetch Twitter (if token available)
      if (this.config.twitterBearerToken) {
        const twitterSignals = await this.fetchTwitter();
        signals.push(...twitterSignals);
      }

    } catch (error) {
      console.error("[SocialAdapter] Error fetching data:", error);
    }

    return signals;
  }

  private async fetchMediumRss(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // Use RSS2JSON API for parsing (free tier available)
      const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.config.mediumRssUrl!)}`;
      const response = await fetch(rssUrl);
      const data = await response.json() as RssResponse;

      if (data.status === "ok" && data.items) {
        const items = data.items;

        // Check for new posts
        if (items.length > 0) {
          const latestGuid = items[0].guid;

          if (latestGuid !== this.lastMediumGuid) {
            this.lastMediumGuid = latestGuid;

            // New blog post signal
            const latest = items[0];
            signals.push(this.createRawSignal(
              `medium-post-${Date.now()}`,
              {
                type: "new_blog_post",
                title: latest.title,
                link: latest.link,
                pubDate: latest.pubDate,
                author: latest.creator,
                categories: latest.categories || [],
                contentPreview: this.stripHtml(latest.content).slice(0, 300),
                isNew: true,
              },
              {
                apiEndpoint: this.config.mediumRssUrl!,
              }
            ));
          }

          // Blog activity summary
          const oneWeekAgo = Date.now() - 7 * 24 * 3600000;
          const recentPosts = items.filter(
            item => new Date(item.pubDate).getTime() > oneWeekAgo
          );

          signals.push(this.createRawSignal(
            `medium-activity-${Date.now()}`,
            {
              type: "blog_activity",
              totalPosts: items.length,
              recentPosts: recentPosts.length,
              latestPost: {
                title: items[0].title,
                link: items[0].link,
                pubDate: items[0].pubDate,
              },
              recentTitles: items.slice(0, 3).map(i => i.title),
            },
            {
              apiEndpoint: this.config.mediumRssUrl!,
            }
          ));
        }
      }
    } catch (error) {
      console.error("[SocialAdapter] Medium RSS fetch error:", error);
    }

    return signals;
  }

  private async fetchTwitter(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      const headers = {
        Authorization: `Bearer ${this.config.twitterBearerToken}`,
      };

      // Get user info
      const userUrl = `${TWITTER_API}/users/by/username/${this.config.twitterUsername}?user.fields=public_metrics`;
      const userResponse = await fetch(userUrl, { headers });

      if (!userResponse.ok) {
        console.error("[SocialAdapter] Twitter user fetch failed:", userResponse.status);
        return signals;
      }

      const userData = await userResponse.json() as TwitterUserResponse;
      const user = userData.data;

      if (user) {
        // User stats signal
        signals.push(this.createRawSignal(
          `twitter-user-${Date.now()}`,
          {
            type: "twitter_profile",
            username: user.username,
            name: user.name,
            followers: user.public_metrics?.followers_count || 0,
            following: user.public_metrics?.following_count || 0,
            tweetCount: user.public_metrics?.tweet_count || 0,
          },
          {
            apiEndpoint: `https://twitter.com/${user.username}`,
          }
        ));

        // Get recent tweets
        const tweetsUrl = `${TWITTER_API}/users/${user.id}/tweets?max_results=10&tweet.fields=created_at,public_metrics`;
        const tweetsResponse = await fetch(tweetsUrl, { headers });

        if (tweetsResponse.ok) {
          const tweetsData = await tweetsResponse.json() as TwitterTweetsResponse;
          const tweets = tweetsData.data;

          if (tweets && tweets.length > 0) {
            const latestTweet = tweets[0];

            // Check for new tweet
            if (latestTweet.id !== this.lastTweetId) {
              this.lastTweetId = latestTweet.id;

              signals.push(this.createRawSignal(
                `twitter-tweet-${latestTweet.id}`,
                {
                  type: "new_tweet",
                  tweetId: latestTweet.id,
                  text: latestTweet.text,
                  createdAt: latestTweet.created_at,
                  likes: latestTweet.public_metrics?.like_count || 0,
                  retweets: latestTweet.public_metrics?.retweet_count || 0,
                  replies: latestTweet.public_metrics?.reply_count || 0,
                  url: `https://twitter.com/${user.username}/status/${latestTweet.id}`,
                  isNew: true,
                },
                {
                  apiEndpoint: `https://twitter.com/${user.username}`,
                }
              ));
            }

            // Engagement summary
            const totalEngagement = tweets.reduce((sum, t) => {
              const metrics = t.public_metrics || { like_count: 0, retweet_count: 0, reply_count: 0 };
              return sum + metrics.like_count + metrics.retweet_count + metrics.reply_count;
            }, 0);

            signals.push(this.createRawSignal(
              `twitter-engagement-${Date.now()}`,
              {
                type: "twitter_engagement",
                recentTweets: tweets.length,
                totalEngagement,
                avgEngagement: totalEngagement / tweets.length,
                topTweet: {
                  text: tweets.sort((a, b) =>
                    ((b.public_metrics?.like_count || 0) - (a.public_metrics?.like_count || 0))
                  )[0]?.text,
                  likes: tweets[0]?.public_metrics?.like_count || 0,
                },
              },
              {
                apiEndpoint: `https://twitter.com/${user.username}`,
              }
            ));
          }
        }
      }
    } catch (error) {
      console.error("[SocialAdapter] Twitter fetch error:", error);
    }

    return signals;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }

  normalize(signal: RawSignal): NormalizedSignal {
    const data = signal.data as {
      type: string;
      title?: string;
      link?: string;
      pubDate?: string;
      author?: string;
      contentPreview?: string;
      isNew?: boolean;
      totalPosts?: number;
      recentPosts?: number;
      username?: string;
      followers?: number;
      text?: string;
      likes?: number;
      retweets?: number;
      totalEngagement?: number;
      avgEngagement?: number;
      url?: string;
    };

    let category: string;
    let severity: NormalizedSignal["severity"];
    let value: number;
    let unit: string;
    let description: string;

    switch (data.type) {
      case "new_blog_post":
        category = "medium_post";
        severity = "high";
        value = 1;
        unit = "post";
        description = `새 블로그: ${data.title}`;
        break;

      case "blog_activity":
        category = "medium_activity";
        severity = (data.recentPosts || 0) > 2 ? "medium" : "low";
        value = data.recentPosts || 0;
        unit = "posts/week";
        description = `Medium 블로그: 최근 1주 ${data.recentPosts}건 게시`;
        break;

      case "twitter_profile":
        category = "twitter_profile";
        severity = "low";
        value = data.followers || 0;
        unit = "followers";
        description = `@${data.username}: ${this.formatNumber(data.followers || 0)} 팔로워`;
        break;

      case "new_tweet":
        category = "twitter_tweet";
        severity = (data.likes || 0) > 100 ? "high" : "medium";
        value = (data.likes || 0) + (data.retweets || 0);
        unit = "engagement";
        description = `새 트윗: "${data.text?.slice(0, 50)}..." (${data.likes} likes)`;
        break;

      case "twitter_engagement":
        category = "twitter_engagement";
        severity = (data.avgEngagement || 0) > 50 ? "medium" : "low";
        value = data.totalEngagement || 0;
        unit = "engagements";
        description = `Twitter 참여도: 최근 ${data.totalEngagement}회 상호작용 (평균 ${(data.avgEngagement || 0).toFixed(1)}/tweet)`;
        break;

      default:
        category = "social_unknown";
        severity = "low";
        value = 0;
        unit = "";
        description = "Unknown social signal";
    }

    return this.createNormalizedSignal(signal, category, severity, value, unit, description);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }
}
