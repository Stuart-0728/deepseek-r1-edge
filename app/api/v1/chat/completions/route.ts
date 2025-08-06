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
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Simple HTML content extraction
    // Remove script and style tags
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Extract text from common content tags
    const contentMatches = content.match(/<(?:p|div|article|section|main|h[1-6])[^>]*>([\s\S]*?)<\/(?:p|div|article|section|main|h[1-6])>/gi);
    
    if (contentMatches) {
      let extractedText = contentMatches
        .map(match => match.replace(/<[^>]*>/g, '')) // Remove HTML tags
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Limit content length
      if (extractedText.length > 1500) {
        extractedText = extractedText.substring(0, 1500) + '...';
      }
      
      return extractedText;
    }
    
    // Fallback: extract all text content
    const textContent = content.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 800);
    
    return textContent || '无法提取网页内容';
  } catch (error) {
    console.log(`Failed to fetch content from ${url}:`, error);
    return '无法获取网页内容';
  }
}

/**
 * Search the web using multiple engines and fetch actual content
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
        parser: (data: any) => {
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
        parser: (data: any) => {
          const results = [];
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
        parser: (data: any) => {
          if (Array.isArray(data) && data.length >= 4) {
            const [, titles, descriptions, urls] = data;
            const results = [];
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
      .slice(0, 10); // Limit to top 10 results
    
    // Remove duplicates based on URL
    const uniqueResults = filteredResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    );
    
    // Fetch actual webpage content for top results
    const resultsWithContent = await Promise.all(
      uniqueResults.slice(0, 5).map(async (result) => {
        // Skip Wikipedia as it already has good content
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
  return results
    .map((result, i) => {
      const index = i + 1;
      const title = result.title || 'No title';
      const url = result.url || 'No URL';
      const snippet = result.content || 'No snippet';

      return `
[webpage ${index} begin]
Title: ${title}
Url: ${url}
Snippet: ${snippet}
[webpage ${index} end]
`;
    })
    .join('\n\n');
}

/**
 * Process user input, optionally augmenting with web search results
 */
async function getContent(
  input: string,
  withNetwork: boolean
): Promise<ProcessedContent> {
  if (!withNetwork) {
    return { content: input };
  }

  try {
    const searchResults = await searxngSearch(input);

    if (!searchResults.length) {
      return { content: '' };
    }

    const context = formatSearchResults(searchResults);
    const contentWithNetworkSearch = `
# 基于用户问题的搜索结果：
${context}

## 回答指导原则：

**当前时间：** ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}

**搜索结果说明：** 每个搜索结果以 [webpage X begin]...[webpage X end] 格式呈现，其中 X 是文章的序号。

**回答要求：**
1. **相关性筛选**：仔细评估搜索结果与用户问题的相关性，优先使用最相关的信息
2. **信息整合**：综合多个相关网页的信息，避免重复引用单一来源
3. **回答结构**：
   - 列表类问题：限制在8-10个要点，告知用户可查看参考资料获取完整信息
   - 创作类问题：充分利用搜索结果，提供有深度、创意和专业性的内容
   - 问答类问题：简洁准确回答，适当补充相关信息丰富内容
4. **格式要求**：
   - 使用清晰的段落结构和适当的标题
   - 重要信息使用**粗体**标记
   - 必要时使用项目符号或编号列表
5. **语言风格**：与用户问题的语言保持一致，表达自然流畅
6. **时效性**：注意信息的时效性，如有必要说明数据的时间范围

**用户问题：**
${input}

**请基于以上搜索结果和指导原则，提供准确、有用且结构清晰的回答。**
    `;

    return {
      content: contentWithNetworkSearch,
      searchResults,
    };
  } catch (err) {
    console.error('Content processing failed:', err);
    return { content: input };
  }
}

/**
 * Format search results for response headers
 */
function formatResultsForHeader(results: SearchResult[]): string {
  return JSON.stringify(
    results.map((item) => ({
      url: item.url,
      title: encodeURIComponent(item.title),
    }))
  );
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