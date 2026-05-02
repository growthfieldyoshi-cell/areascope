import type { MetadataRoute } from 'next'

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Bytespider',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'cohere-ai',
  'Diffbot',
  'Omgilibot',
  'FacebookBot',
  'Meta-ExternalAgent',
  'Amazonbot',
  'DuckAssistBot',
  'PetalBot',
  'YouBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_BOTS.map((bot) => ({ userAgent: bot, disallow: '/' })),
    ],
    sitemap: 'https://areascope.jp/sitemap.xml',
    host: 'https://areascope.jp',
  }
}
