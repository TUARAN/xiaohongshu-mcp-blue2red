import axios from 'axios'
import { searchNews as searchNewsFromCrawler } from './newsCrawler'

const MCP_URL = 'http://localhost:18060/mcp'

// AI搜索相关API
export class AISearchService {
  private static instance: AISearchService
  private searchHistory: string[] = []
  private hotKeywords: string[] = [
    'ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'Sora', 'Midjourney',
    '机器学习', '深度学习', '神经网络', '大模型', 'AI绘画',
    'AI写作', 'AI编程', 'AI医疗', 'AI教育', '自动驾驶',
    'OpenAI', 'Google AI', 'Microsoft AI', 'Meta AI', '百度AI'
  ]

  static getInstance(): AISearchService {
    if (!AISearchService.instance) {
      AISearchService.instance = new AISearchService()
    }
    return AISearchService.instance
  }

  // 智能搜索
  async smartSearch(query: string, options: {
    type?: 'all' | 'posts' | 'users' | 'topics' | 'news'
    sort?: 'relevance' | 'time' | 'popularity'
    limit?: number
  } = {}) {
    try {
      let results: any[] = []
      
      // 如果包含新闻搜索，同时搜索新闻
      if (options.type === 'all' || options.type === 'news') {
        try {
          const newsResults = await searchNewsFromCrawler(query)
          results = [...results, ...newsResults.map(news => ({
            ...news,
            type: 'news',
            source: '蓝点网'
          }))]
        } catch (error) {
          console.error('搜索新闻失败:', error)
        }
      }
      
      // 搜索小红书内容
      if (options.type === 'all' || options.type === 'posts' || options.type === 'users' || options.type === 'topics') {
        try {
          const result = await axios.post(MCP_URL, {
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
              name: 'search_feeds',
              arguments: {
                keyword: query,
                ...options
              }
            },
            id: Date.now()
          }, { timeout: 30000 })

          const xhsResults = result.data.result || []
          results = [...results, ...xhsResults.map((item: any) => ({
            ...item,
            type: 'xhs',
            source: '小红书'
          }))]
        } catch (error) {
          console.error('搜索小红书内容失败:', error)
        }
      }

      // 保存搜索历史
      this.addToHistory(query)

      return {
        success: true,
        data: results,
        query,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('智能搜索失败:', error)
      return {
        success: false,
        data: [],
        error: error.message,
        query,
        timestamp: new Date()
      }
    }
  }

  // 获取热门关键词
  async getHotKeywords(): Promise<string[]> {
    try {
      // 这里可以从服务器获取实时热门关键词
      // 暂时返回预设的关键词
      return this.hotKeywords
    } catch (error) {
      console.error('获取热门关键词失败:', error)
      return this.hotKeywords
    }
  }

  // 获取搜索建议
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      // 基于查询内容生成建议
      const suggestions = this.generateSuggestions(query)
      return suggestions
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return []
    }
  }

  // 生成搜索建议
  private generateSuggestions(query: string): string[] {
    const baseSuggestions = [
      `${query}最新动态`,
      `${query}技术解析`,
      `${query}应用案例`,
      `${query}发展趋势`,
      `${query}工具推荐`,
      `${query}学习资源`,
      `${query}行业分析`,
      `${query}未来展望`
    ]

    // 基于查询内容智能生成建议
    if (query.includes('AI') || query.includes('人工智能')) {
      return [
        ...baseSuggestions,
        'AI技术突破',
        'AI工具推荐',
        'AI应用场景',
        'AI发展趋势'
      ]
    }

    if (query.includes('ChatGPT') || query.includes('GPT')) {
      return [
        ...baseSuggestions,
        'ChatGPT使用技巧',
        'GPT-4新功能',
        'ChatGPT应用案例',
        'GPT技术原理'
      ]
    }

    if (query.includes('机器学习') || query.includes('深度学习')) {
      return [
        ...baseSuggestions,
        '机器学习算法',
        '深度学习框架',
        '神经网络原理',
        'AI模型训练'
      ]
    }

    return baseSuggestions
  }

  // 添加搜索历史
  private addToHistory(query: string) {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query)
      if (this.searchHistory.length > 20) {
        this.searchHistory = this.searchHistory.slice(0, 20)
      }
      // 保存到本地存储
      localStorage.setItem('ai_search_history', JSON.stringify(this.searchHistory))
    }
  }

  // 获取搜索历史
  getSearchHistory(): string[] {
    try {
      const history = localStorage.getItem('ai_search_history')
      if (history) {
        this.searchHistory = JSON.parse(history)
      }
    } catch (error) {
      console.error('获取搜索历史失败:', error)
    }
    return this.searchHistory
  }

  // 清除搜索历史
  clearSearchHistory() {
    this.searchHistory = []
    localStorage.removeItem('ai_search_history')
  }

  // 获取相关推荐
  async getRelatedRecommendations(query: string): Promise<any[]> {
    try {
      const result = await axios.post(MCP_URL, {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'list_feeds',
          arguments: {}
        },
        id: Date.now()
      }, { timeout: 30000 })

      // 基于查询内容过滤和排序推荐
      const recommendations = result.data.result || []
      return this.filterAndSortRecommendations(recommendations, query)
    } catch (error) {
      console.error('获取相关推荐失败:', error)
      return []
    }
  }

  // 过滤和排序推荐内容
  private filterAndSortRecommendations(recommendations: any[], query: string): any[] {
    return recommendations
      .filter(item => {
        const title = item.title || ''
        const content = item.content || ''
        const searchText = `${title} ${content}`.toLowerCase()
        return searchText.includes(query.toLowerCase())
      })
      .sort((a, b) => {
        // 根据相关性排序
        const scoreA = this.calculateRelevanceScore(a, query)
        const scoreB = this.calculateRelevanceScore(b, query)
        return scoreB - scoreA
      })
      .slice(0, 10) // 返回前10个最相关的结果
  }

  // 计算相关性分数
  private calculateRelevanceScore(item: any, query: string): number {
    const title = item.title || ''
    const content = item.content || ''
    const searchText = `${title} ${content}`.toLowerCase()
    const queryLower = query.toLowerCase()
    
    let score = 0
    
    // 标题匹配权重更高
    if (title.toLowerCase().includes(queryLower)) {
      score += 10
    }
    
    // 内容匹配
    if (content.toLowerCase().includes(queryLower)) {
      score += 5
    }
    
    // 关键词匹配
    const keywords = queryLower.split(' ')
    keywords.forEach(keyword => {
      if (searchText.includes(keyword)) {
        score += 2
      }
    })
    
    return score
  }

  // 导出搜索结果
  exportSearchResults(results: any[], format: 'json' | 'csv' = 'json'): void {
    if (format === 'json') {
      const data = JSON.stringify(results, null, 2)
      this.downloadFile(data, 'ai_search_results.json', 'application/json')
    } else if (format === 'csv') {
      const csv = this.convertToCSV(results)
      this.downloadFile(csv, 'ai_search_results.csv', 'text/csv')
    }
  }

  // 转换为CSV格式
  private convertToCSV(results: any[]): string {
    if (results.length === 0) return ''
    
    const headers = ['标题', '内容', '类型', '发布时间', '浏览数', '评论数', '点赞数']
    const rows = results.map(item => [
      item.title || '',
      item.content || '',
      item.type || '',
      item.publishTime || '',
      item.views || 0,
      item.comments || 0,
      item.likes || 0
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  // 下载文件
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

// 导出单例实例
export const aiSearchService = AISearchService.getInstance()

// 便捷方法
export const smartSearch = (query: string, options?: any) => 
  aiSearchService.smartSearch(query, options)

export const getHotKeywords = () => 
  aiSearchService.getHotKeywords()

export const getSearchSuggestions = (query: string) => 
  aiSearchService.getSearchSuggestions(query)

export const getSearchHistory = () => 
  aiSearchService.getSearchHistory()

export const clearSearchHistory = () => 
  aiSearchService.clearSearchHistory()

export const getRelatedRecommendations = (query: string) => 
  aiSearchService.getRelatedRecommendations(query)

export const exportSearchResults = (results: any[], format?: 'json' | 'csv') => 
  aiSearchService.exportSearchResults(results, format)
