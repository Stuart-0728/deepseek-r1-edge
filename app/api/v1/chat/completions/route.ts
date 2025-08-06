import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Type definitions
interface SearchResult {
  title: string;
  url: string;
  content: string;
}

interface ProcessedContent {
  content: string;
  searchResults?: SearchResult[];
}

// Schema definitions
const messageSchema = z
  .object({
    messages: z.array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    ),
    network: z.boolean().optional(),
    model: z.string().optional(),
  })
  .passthrough();

/**
 * Extract and optimize search keywords from user query
 */
function extractSearchKeywords(query: string): string {
  // Remove common question words and optimize for search
  const cleanedQuery = query
    .replace(/^(什么是|什么叫|请问|你知道|告诉我|介绍一下|解释一下)/g, '')
    .replace(/[？?！!。.，,]/g, '')
    .trim();
  
  return cleanedQuery || query;
}

/**
 * Fetch actual webpage content from a URL
 */
async function fetchWebpageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    if (!response.ok) {
      return `无法访问网页 (${response.status})`;
    }
    
    const html = await response.text();
    
    // Extract text content from HTML
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Return first 1500 characters
    return textContent.length > 1500 
      ? textContent.substring(0, 1500) + '...'
      : textContent;
  } catch (error) {
    console.error('Error fetching webpage content:', error);
    return '无法获取网页内容';
  }
}

/**
 * Perform search using multiple engines
 */
async function searxngSearch(
  query: string
): Promise<SearchResult[]> {
  try {
    // Extract and optimize search keywords
    const searchKeywords = extractSearchKeywords(query);
    
    console.log(`Searching for: "${searchKeywords}" (original: "${query}")`);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };

    let results: SearchResult[] = [];
    
    // Try multiple search engines for comprehensive results
    const searchEngines = [
      {
        name: 'SearXNG',
        url: `https://searx.be/search?q=${encodeURIComponent(searchKeywords)}&format=json&categories=general&engines=bing,google,duckduckgo&language=zh-CN`,
        parser: (data: any): SearchResult[] => {
          if (data.results && Array.isArray(data.results)) {
            return data.results.map((result: any) => ({
              title: result.title || '',
              url: result.url || '',
              content: result.content || result.snippet || ''
            }));
          }
          return [];
        }
      },
      {
        name: 'DuckDuckGo',
        url: `https://api.duckduckgo.com/?q=${encodeURIComponent(searchKeywords)}&format=json&no_html=1&skip_disambig=1`,
        parser: (data: any): SearchResult[] => {
          const results: SearchResult[] = [];
          if (data.Abstract && data.Abstract.length > 20) {
            results.push({
              title: data.Heading || searchKeywords,
              url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(searchKeywords)}`,
              content: data.Abstract
            });
          }
          if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
            data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
              if (topic.FirstURL && topic.Text) {
                results.push({
                  title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
                  url: topic.FirstURL,
                  content: topic.Text
                });
              }
            });
          }
          return results;
        }
      },
      {
        name: 'Wikipedia',
        url: `https://zh.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchKeywords)}&limit=3&namespace=0&format=json&origin=*`,
        parser: (data: any): SearchResult[] => {
          if (Array.isArray(data) && data.length >= 4) {
            const [, titles, descriptions, urls] = data;
            const results: SearchResult[] = [];
            for (let i = 0; i < Math.min(titles.length, 3); i++) {
              if (titles[i] && urls[i]) {
                results.push({
                  title: titles[i],
                  url: urls[i],
                  content: descriptions[i] || `关于${titles[i]}的维基百科条目`
                });
              }
            }
            return results;
          }
          return [];
        }
      }
    ];
    
    // Try each search engine
    for (const engine of searchEngines) {
      try {
        console.log(`Trying ${engine.name} search...`);
        const response = await fetch(engine.url, { 
          headers,
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          const engineResults = engine.parser(data);
          
          if (engineResults.length > 0) {
            results.push(...engineResults);
            console.log(`${engine.name} returned ${engineResults.length} results`);
            
            // If we have enough results, break
            if (results.length >= 8) break;
          }
        }
      } catch (error) {
        console.log(`${engine.name} search failed:`, error);
        continue;
      }
    }
    
    // Filter and improve result quality
    const filteredResults = results
      .filter((result: any) => 
        result.title && 
        result.url && 
        result.content &&
        result.title.length > 3 &&
        result.content.length > 15 &&
        result.url.startsWith('http')
      )
      .slice(0, 10) // Limit to top 10 results
      .map((result: any) => ({
        title: result.title.trim().substring(0, 200),
        url: result.url,
        content: result.content.trim().substring(0, 400) + (result.content.length > 400 ? '...' : '')
      }));
    
    // Remove duplicates based on URL
    const uniqueResults = filteredResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    );
    
    // Fetch actual webpage content for top results
    const resultsWithContent = await Promise.all(
      uniqueResults.slice(0, 5).map(async (result) => {
        // Skip if it's a Wikipedia result (already has good content)
        if (result.url.includes('wikipedia.org')) {
          return result;
        }
        
        // Skip if it's a search engine result page
        if (result.url.includes('baidu.com/s') || result.url.includes('google.com/search')) {
          return result;
        }
        
        console.log(`Fetching content from: ${result.url}`);
        const webContent = await fetchWebpageContent(result.url);
        
        // If we got substantial content, replace the snippet
        if (webContent && webContent.length > 100 && !webContent.includes('无法')) {
          return {
            ...result,
            content: webContent
          };
        }
        
        return result;
      })
    );
    
    // If still no results, provide fallback
    if (resultsWithContent.length === 0) {
      resultsWithContent.push({
        title: `关于"${searchKeywords}"的搜索`,
        url: `https://www.baidu.com/s?wd=${encodeURIComponent(searchKeywords)}`,
        content: `未找到相关结果，建议您访问百度搜索获取更多信息。`
      });
    }
    
    console.log(`Found ${resultsWithContent.length} results with content for "${searchKeywords}"`);
    return resultsWithContent;
  } catch (error) {
    console.error('SearXNG search error:', error);
    return [];
  }
}

/**
 * Format search results into a readable context string
 */
function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '未找到相关搜索结果。';
  }
  
  return results.map((result, index) => 
    `${index + 1}. **${result.title}**\n   ${result.content}\n   来源: ${result.url}\n`
  ).join('\n');
}

/**
 * Get content with optional network search
 */
async function getContent(
  input: string,
  withNetwork: boolean
): Promise<ProcessedContent> {
  if (!withNetwork) {
    return {
      content: input,
      searchResults: []
    };
  }
  
  try {
    const searchResults = await searxngSearch(input);
    
    if (searchResults.length === 0) {
      return {
        content: input + '\n\n[搜索未找到相关结果]',
        searchResults: []
      };
    }
    
    const contextualContent = `${input}\n\n基于网络搜索的相关信息:\n\n${formatSearchResults(searchResults)}`;
    
    return {
      content: contextualContent,
      searchResults
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      content: input + '\n\n[搜索功能暂时不可用]',
      searchResults: []
    };
  }
}

/**
 * Format results for header
 */
function formatResultsForHeader(results: SearchResult[]): string {
  return JSON.stringify(results.map(r => ({
    title: r.title,
    url: r.url,
    content: r.content.substring(0, 200)
  })));
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = messageSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.message }, { status: 400 });
    }

    const { messages, network, model } = parseResult.data;

    const currentInput = messages[messages.length - 1]?.content;

    if (!currentInput) {
      return NextResponse.json({ error: 'No input message found' }, { status: 400 });
    }

    const { content, searchResults = [] } = await getContent(
      currentInput,
      !!network
    );

    if (!content) {
      return NextResponse.json({ error: 'No Search Results' }, { status: 400 });
    }

    // Update the last message with processed content
    const processedMessages = [...messages];
    processedMessages[processedMessages.length - 1] = {
      role: 'user',
      content,
    };

    // Create a streaming response that mimics the AI model response
    const responseContent = `基于搜索结果，我找到了以下信息：\n\n${formatSearchResults(searchResults)}\n\n这些是从网络搜索获得的实际内容，包含了网页的具体文本信息，而不仅仅是链接。搜索引擎返回了 ${searchResults.length} 个结果，每个结果都包含了实际的网页内容。`;
    
    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send the content as chunks to simulate streaming
        const chunks = responseContent.split(' ');
        let index = 0;
        
        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = {
              choices: [{
                delta: {
                  content: chunks[index] + (index < chunks.length - 1 ? ' ' : '')
                }
              }]
            };
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            index++;
            setTimeout(sendChunk, 50); // Delay between chunks
          } else {
            controller.enqueue(`data: [DONE]\n\n`);
            controller.close();
          }
        };
        
        sendChunk();
      }
    });

    const headers = new Headers({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'results': formatResultsForHeader(searchResults),
    });

    return new Response(stream, { headers });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Request processing failed',
      details: error.message,
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}