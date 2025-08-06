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
 * Extract search keywords from user query
 */
function extractSearchKeywords(query: string): string {
  // Remove common question words and extract key terms
  const stopWords = ['什么', '怎么', '如何', '为什么', '哪里', '谁', '什么时候', '多少', '请', '帮我', '告诉我', '解释', '说明'];
  const words = query.split(/[\s，。！？；：、]+/).filter(word => 
    word.length > 1 && !stopWords.includes(word)
  );
  
  // Take the most relevant keywords (limit to 3-5 words)
  return words.slice(0, 5).join(' ');
}

/**
 * Search the web using SearXNG with improved query processing
 */
async function searxngSearch(
  query: string,
  SEARXNG_URL = 'https://proxy.edgeone.app/search'
): Promise<SearchResult[]> {
  try {
    // Extract and optimize search keywords
    const searchKeywords = extractSearchKeywords(query);
    
    const params = new URLSearchParams({
      q: searchKeywords,
      format: 'json',
      engines: 'bing,google',
      categories: 'general',
      language: 'zh-CN',
      time_range: '',
      safesearch: '1'
    });

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': 'https://proxy.edgeone.app/',
      'Origin': 'https://proxy.edgeone.app',
    };

    console.log(`Searching for: "${searchKeywords}" (original: "${query}")`);
    
    const response = await fetch(`${SEARXNG_URL}?${params}`, { 
      headers,
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search API error: ${response.status} - ${errorText}`);
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results = data?.results || [];
    
    // Filter and improve result quality
    const filteredResults = results
      .filter((result: any) => 
        result.title && 
        result.url && 
        result.content &&
        result.title.length > 5 &&
        result.content.length > 20
      )
      .slice(0, 8) // Limit to top 8 results
      .map((result: any) => ({
        title: result.title.trim(),
        url: result.url,
        content: result.content.trim().substring(0, 300) + (result.content.length > 300 ? '...' : '')
      }));
    
    console.log(`Found ${filteredResults.length} relevant results`);
    return filteredResults;
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

/**
 * Create standardized response with CORS headers
 */
function createResponse(body: any, status = 200, extraHeaders = {}): Response {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders,
  };

  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptionsRequest(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequest({ request, env }: any) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  // Remove encoding header to avoid compression issues
  request.headers.delete('accept-encoding');

  try {
    const json = await request.clone().json();
    const parseResult = messageSchema.safeParse(json);

    if (!parseResult.success) {
      return createResponse({ error: parseResult.error.message });
    }

    const { messages, network, model } = parseResult.data;

    const currentInput = messages[messages.length - 1]?.content;

    if (!currentInput) {
      return createResponse({ error: 'No input message found' });
    }

    const { content, searchResults = [] } = await getContent(
      currentInput,
      !!network
    );

    if (!content) {
      return createResponse({ error: 'No Search Results' });
    }

    // Update the last message with processed content
    const processedMessages = [...messages];
    processedMessages[processedMessages.length - 1] = {
      role: 'user',
      content,
    };

    try {
      // Define allowed models
      const allowedModels = [
        '@tx/deepseek-ai/deepseek-r1-distill-qwen-32b',
        '@tx/deepseek-ai/deepseek-r1-0528',
        '@tx/deepseek-ai/deepseek-v3-0324',
      ];

      // Use the model parameter, fallback to default if not provided
      const selectedModel =
        model || '@tx/deepseek-ai/deepseek-r1-distill-qwen-32b';

      // Validate the model
      if (!allowedModels.includes(selectedModel)) {
        return createResponse({
          error: `Invalid model: ${selectedModel}. Allowed models: ${allowedModels.join(
            ', '
          )}`,
        });
      }

      // @ts-ignore-next-line
      const aiStream = await AI.chatCompletions({
        model: selectedModel,
        messages: processedMessages,
        stream: true,
      });

      return new Response(aiStream, {
        headers: {
          results: formatResultsForHeader(searchResults),
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error: any) {
      return createResponse({ error: error.message });
    }
  } catch (error: any) {
    return createResponse({
      error: 'Request processing failed',
      details: error.message,
    });
  }
}
