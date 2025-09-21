import axios from 'axios'
import * as cheerio from 'cheerio'

// 蓝点网资讯爬虫服务
export class NewsCrawlerService {
  private static instance: NewsCrawlerService
  private readonly baseUrl = 'https://www.landiannews.com'
  private readonly industryUrl = '/api/news/tech/industry'
  private readonly aiUrl = '/api/news/tech/ai'
  private readonly cloudUrl = '/api/news/tech/cloud'
  
  static getInstance(): NewsCrawlerService {
    if (!NewsCrawlerService.instance) {
      NewsCrawlerService.instance = new NewsCrawlerService()
    }
    return NewsCrawlerService.instance
  }

  // 爬取行业资讯
  async crawlIndustryNews(): Promise<any[]> {
    try {
      console.log('开始爬取蓝点网行业资讯...', this.industryUrl)
      
      const response = await axios.get(this.industryUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        withCredentials: false
      })

      console.log('HTTP响应状态:', response.status)
      console.log('响应内容长度:', response.data.length)

      const $ = cheerio.load(response.data)
      const newsList: any[] = []
      
      // 检查页面是否包含预期的选择器
      const postElements = $('.post-list-main')
      console.log('找到的.post-list-main元素数量:', postElements.length)

      // 解析新闻列表 - 使用更灵活的选择器
      $('.post-list-main').each((index, element) => {
        try {
          const $item = $(element)
          
          // 尝试多种方式获取标题和链接
          let title = ''
          let link = ''
          
          // 方法1: 从a标签的title属性获取
          const titleLink = $item.find('a[title]').first()
          if (titleLink.length > 0) {
            title = titleLink.attr('title') || ''
            link = titleLink.attr('href') || ''
          }
          
          // 方法2: 从h5标签获取
          if (!title) {
            title = $item.find('h5 a').text().trim()
            link = $item.find('h5 a').attr('href') || ''
          }
          
          // 方法3: 从任何a标签获取
          if (!title) {
            const anyLink = $item.find('a').first()
            title = anyLink.text().trim()
            link = anyLink.attr('href') || ''
          }
          
          const summary = $item.find('.post-metas').text().trim()
          const time = $item.find('.post-metas .date').text().trim()
          const author = '蓝点网'
          const tags = ['科技资讯']
          const views = $item.find('.post-metas .view').text().trim()

          if (title && link && title.length > 5) {
            newsList.push({
              id: `landian_${Date.now()}_${index}`,
              title,
              link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
              summary: summary || '暂无摘要',
              publishTime: this.parseTime(time),
              author: author || '蓝点网',
              tags: tags.length > 0 ? tags : ['科技资讯'],
              views: this.parseViews(views),
              source: '蓝点网',
              category: '行业资讯',
              type: 'news'
            })
          }
        } catch (error) {
          console.error('解析新闻项失败:', error)
        }
      })

      // 如果没有找到标准格式，尝试其他选择器
      if (newsList.length === 0) {
        $('article, .post, .news, li').each((index, element) => {
          try {
            const $item = $(element)
            const title = $item.find('h1, h2, h3, h4, h5, .title a').text().trim()
            const link = $item.find('h1 a, h2 a, h3 a, h4 a, h5 a, .title a').attr('href')
            const summary = $item.find('p, .content, .excerpt, .summary').text().trim()

            if (title && link) {
              newsList.push({
                id: `landian_${Date.now()}_${index}`,
                title,
                link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
                summary: summary || '暂无摘要',
                publishTime: new Date(),
                author: '蓝点网',
                tags: ['科技资讯'],
                views: 0,
                source: '蓝点网',
                category: '行业资讯',
                type: 'news'
              })
            }
          } catch (error) {
            console.error('解析新闻项失败:', error)
          }
        })
      }

      console.log('成功解析到', newsList.length, '条资讯')
      return newsList.slice(0, 20) // 返回最新20条
    } catch (error) {
      console.error('爬取蓝点网资讯失败:', error)
      if (error.response) {
        console.error('HTTP错误状态:', error.response.status)
        console.error('HTTP错误数据:', error.response.data)
      } else if (error.request) {
        console.error('网络请求失败:', error.request)
      } else {
        console.error('其他错误:', error.message)
      }
      return []
    }
  }

  // 爬取AI相关资讯
  async crawlAINews(): Promise<any[]> {
    try {
      const response = await axios.get(this.aiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      const $ = cheerio.load(response.data)
      const newsList: any[] = []

      $('.post-list-main').each((index, element) => {
        try {
          const $item = $(element)
          
          // 从a标签的title属性获取标题，从href获取链接
          const titleLink = $item.find('a[title]').first()
          const title = titleLink.attr('title') || $item.find('h5 a').text().trim()
          const link = titleLink.attr('href') || $item.find('h5 a').attr('href')
          const summary = $item.find('.post-metas').text().trim()

          if (title && link) {
            newsList.push({
              id: `landian_ai_${Date.now()}_${index}`,
              title,
              link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
              summary: summary || '暂无摘要',
              publishTime: new Date(),
              author: '蓝点网',
              tags: ['AI', '人工智能', '科技资讯'],
              views: 0,
              source: '蓝点网',
              category: '人工智能',
              type: 'news'
            })
          }
        } catch (error) {
          console.error('解析AI新闻项失败:', error)
        }
      })

      return newsList.slice(0, 15)
    } catch (error) {
      console.error('爬取AI资讯失败:', error)
      return []
    }
  }

  // 爬取云计算资讯
  async crawlCloudNews(): Promise<any[]> {
    try {
      const response = await axios.get(this.cloudUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      const $ = cheerio.load(response.data)
      const newsList: any[] = []

      $('.post-list-main').each((index, element) => {
        try {
          const $item = $(element)
          
          // 从a标签的title属性获取标题，从href获取链接
          const titleLink = $item.find('a[title]').first()
          const title = titleLink.attr('title') || $item.find('h5 a').text().trim()
          const link = titleLink.attr('href') || $item.find('h5 a').attr('href')
          const summary = $item.find('.post-metas').text().trim()

          if (title && link) {
            newsList.push({
              id: `landian_cloud_${Date.now()}_${index}`,
              title,
              link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
              summary: summary || '暂无摘要',
              publishTime: new Date(),
              author: '蓝点网',
              tags: ['云计算', '科技资讯'],
              views: 0,
              source: '蓝点网',
              category: '云计算',
              type: 'news'
            })
          }
        } catch (error) {
          console.error('解析云计算新闻项失败:', error)
        }
      })

      return newsList.slice(0, 15)
    } catch (error) {
      console.error('爬取云计算资讯失败:', error)
      return []
    }
  }

  // 获取所有资讯
  async getAllNews(): Promise<any[]> {
    try {
      const [industryNews, aiNews, cloudNews] = await Promise.all([
        this.crawlIndustryNews(),
        this.crawlAINews(),
        this.crawlCloudNews()
      ])

      const allNews = [...industryNews, ...aiNews, ...cloudNews]
      
      // 按时间排序
      return allNews.sort((a, b) => 
        new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      )
    } catch (error) {
      console.error('获取所有资讯失败:', error)
      return []
    }
  }

  // 搜索资讯
  async searchNews(keyword: string): Promise<any[]> {
    try {
      const allNews = await this.getAllNews()
      return allNews.filter(news => 
        news.title.toLowerCase().includes(keyword.toLowerCase()) ||
        news.summary.toLowerCase().includes(keyword.toLowerCase()) ||
        news.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      )
    } catch (error) {
      console.error('搜索资讯失败:', error)
      return []
    }
  }

  // 解析时间
  private parseTime(timeStr: string): Date {
    if (!timeStr) return new Date()
    
    // 处理各种时间格式
    const now = new Date()
    const timeStrLower = timeStr.toLowerCase()
    
    if (timeStrLower.includes('今天')) {
      return now
    } else if (timeStrLower.includes('昨天')) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    } else if (timeStrLower.includes('小时前')) {
      const hours = parseInt(timeStr.match(/\d+/)?.[0] || '0')
      const time = new Date(now)
      time.setHours(time.getHours() - hours)
      return time
    } else if (timeStrLower.includes('分钟前')) {
      const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '0')
      const time = new Date(now)
      time.setMinutes(time.getMinutes() - minutes)
      return time
    } else {
      // 尝试解析标准日期格式
      const date = new Date(timeStr)
      return isNaN(date.getTime()) ? now : date
    }
  }

  // 解析浏览数
  private parseViews(viewsStr: string): number {
    if (!viewsStr) return 0
    
    const match = viewsStr.match(/(\d+(?:\.\d+)?)([KkMm]?)/)
    if (!match) return 0
    
    const num = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    
    switch (unit) {
      case 'k':
        return Math.floor(num * 1000)
      case 'm':
        return Math.floor(num * 1000000)
      default:
        return Math.floor(num)
    }
  }

  // 获取新闻详情
  async getNewsDetail(url: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      const $ = cheerio.load(response.data)
      
      return {
        title: $('h1, .title').text().trim(),
        content: $('.content, .article-content, .post-content').text().trim(),
        author: $('.author, .writer').text().trim(),
        publishTime: $('.time, .date, .publish-time').text().trim(),
        tags: $('.tags a, .tag').map((i, el) => $(el).text().trim()).get(),
        images: $('.content img, .article-content img').map((i, el) => $(el).attr('src')).get()
      }
    } catch (error) {
      console.error('获取新闻详情失败:', error)
      return null
    }
  }
}

// 导出单例实例
export const newsCrawlerService = NewsCrawlerService.getInstance()

// 便捷方法
export const crawlIndustryNews = () => newsCrawlerService.crawlIndustryNews()
export const crawlAINews = () => newsCrawlerService.crawlAINews()
export const crawlCloudNews = () => newsCrawlerService.crawlCloudNews()
export const getAllNews = () => newsCrawlerService.getAllNews()
export const searchNews = (keyword: string) => newsCrawlerService.searchNews(keyword)
export const getNewsDetail = (url: string) => newsCrawlerService.getNewsDetail(url)
