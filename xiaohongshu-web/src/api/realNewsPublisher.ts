import axios from 'axios'

const MCP_URL = 'http://localhost:18060/mcp'

// 真实资讯发布服务
export class RealNewsPublisherService {
  private static instance: RealNewsPublisherService
  private requestId = 1

  static getInstance(): RealNewsPublisherService {
    if (!RealNewsPublisherService.instance) {
      RealNewsPublisherService.instance = new RealNewsPublisherService()
    }
    return RealNewsPublisherService.instance
  }

  private async makeRequest(method: string, params?: any) {
    const payload = {
      jsonrpc: '2.0',
      method: method,
      id: this.requestId++
    }
    if (params) {
      payload.params = params
    }

    try {
      const response = await axios.post(MCP_URL, payload, { timeout: 30000 })
      return response.data
    } catch (error) {
      console.error('MCP请求失败:', error)
      throw error
    }
  }

  // 检查登录状态
  async checkLoginStatus(): Promise<boolean> {
    try {
      const result = await this.makeRequest('tools/call', {
        name: 'check_login_status',
        arguments: {}
      })

      if (result.result && result.result.content) {
        const content = result.result.content[0].text
        return content.includes('IsLoggedIn:true')
      }
      return false
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  // 获取真实资讯
  async getRealNews(category: string = 'industry'): Promise<any[]> {
    try {
      // 这里应该调用后端的真实资讯获取接口
      // 暂时返回模拟数据
      const mockNews = [
        {
          title: "英伟达宣布向英特尔投资50亿美元获取4%的股份",
          summary: "英伟达宣布向英特尔投资50亿美元获取4%的股份，合作开发数据中心和PC芯片",
          link: "https://www.landiannews.com/archives/110751.html",
          category: category,
          source: '蓝点网',
          publishTime: new Date()
        },
        {
          title: "常见的图片格式JPG与JPEG有啥区别？",
          summary: "常见的图片格式JPG与JPEG有啥区别？没想到这还是微软在90年代造成的问题",
          link: "https://www.landiannews.com/archives/110727.html",
          category: category,
          source: '蓝点网',
          publishTime: new Date()
        },
        {
          title: "开放媒体联盟将在2025年年底推出视频编解码器AV2",
          summary: "开放媒体联盟将在2025年年底推出视频编解码器AV2，新版继续提升压缩性能",
          link: "https://www.landiannews.com/archives/110700.html",
          category: category,
          source: '蓝点网',
          publishTime: new Date()
        }
      ]

      return mockNews
    } catch (error) {
      console.error('获取真实资讯失败:', error)
      return []
    }
  }

  // 生成内容
  generateContentFromNews(news: any, template: string) {
    // 可靠的科技感图片库 - 使用多种稳定源
    const techImages = [
      // Pexels科技图片
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 科技网络
      'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 数据分析
      'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 云计算
      'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 人工智能
      'https://images.pexels.com/photos/1181678/pexels-photo-1181678.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 未来科技
      
      // 更多Pexels科技图片
      'https://images.pexels.com/photos/1181679/pexels-photo-1181679.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 区块链
      'https://images.pexels.com/photos/1181680/pexels-photo-1181680.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 物联网
      'https://images.pexels.com/photos/1181681/pexels-photo-1181681.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 量子计算
      'https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 机器学习
      'https://images.pexels.com/photos/1181683/pexels-photo-1181683.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', // 深度学习
      
      // 备用图片源
      'https://picsum.photos/800/600?random=1', // 随机图片1
      'https://picsum.photos/800/600?random=2', // 随机图片2
      'https://picsum.photos/800/600?random=3', // 随机图片3
      'https://picsum.photos/800/600?random=4', // 随机图片4
      'https://picsum.photos/800/600?random=5'   // 随机图片5
    ]
    
    // 随机选择一张科技感图片
    const randomImage = techImages[Math.floor(Math.random() * techImages.length)]
    
    const templates = {
      tech_breakthrough: {
        title: `🔥 ${news.title}`,
        content: `🔥 ${news.title}\n\n💡 最新科技动态分享！\n\n📰 ${news.summary}\n\n🎯 技术要点：\n• 技术创新突破\n• 应用场景广泛\n• 未来发展潜力巨大\n\n🌟 这个技术将如何改变我们的生活？\n\n#科技资讯 #技术突破 #创新科技`,
        tags: ['科技资讯', '技术突破', '创新科技'],
        images: [randomImage]
      },
      ai_news: {
        title: `🤖 ${news.title}`,
        content: `🤖 ${news.title}\n\n💡 AI领域最新动态！\n\n📰 ${news.summary}\n\n🎯 AI技术亮点：\n• AI算法优化\n• 模型性能提升\n• 应用领域扩展\n\n🚀 AI正在重塑我们的世界，你准备好了吗？\n\n#人工智能 #AI技术 #机器学习 #深度学习`,
        tags: ['人工智能', 'AI技术', '机器学习', '深度学习'],
        images: [randomImage]
      },
      industry_trend: {
        title: `📈 ${news.title}`,
        content: `📈 ${news.title}\n\n💡 科技行业深度观察！\n\n📰 ${news.summary}\n\n🎯 行业影响：\n• 行业标准重塑\n• 商业模式创新\n• 用户体验升级\n\n🌍 这个趋势将如何影响整个行业？\n\n#科技趋势 #行业分析 #创新科技 #数字化转型`,
        tags: ['科技趋势', '行业分析', '创新科技', '数字化转型'],
        images: [randomImage]
      },
      auto: {
        title: `💡 ${news.title}`,
        content: `💡 ${news.title}\n\n📰 ${news.summary}\n\n🎯 这个技术/趋势将如何影响我们的生活和工作？\n\n#科技资讯 #创新科技`,
        tags: ['科技资讯', '创新科技'],
        images: [randomImage]
      }
    }
    
    return templates[template as keyof typeof templates] || templates.auto
  }

  // 发布内容
  async publishContent(content: {
    title: string
    content: string
    images: string[]
    tags: string[]
  }): Promise<{ success: boolean; message?: string }> {
    try {
      // 调用MCP的浏览器发布功能
      const result = await this.makeRequest('tools/call', {
        name: 'publish_content',
        arguments: {
          title: content.title,
          content: content.content,
          images: content.images,
          tags: content.tags
        }
      })

      if (result.result && result.result.content) {
        const responseText = result.result.content[0].text
        console.log('MCP发布响应:', responseText)
        
        if (responseText.includes('发布成功') || responseText.includes('Status:发布完成')) {
          return { success: true, message: '发布成功' }
        } else if (responseText.includes('发布失败') || responseText.includes('error')) {
          return { success: false, message: responseText }
        } else {
          // 如果响应包含其他信息，也认为是成功
          return { success: true, message: responseText }
        }
      } else {
        return { success: false, message: '发布失败，未收到有效响应' }
      }
    } catch (error) {
      console.error('发布内容失败:', error)
      return { success: false, message: `发布失败: ${error.message}` }
    }
  }

  // 批量发布
  async batchPublish(options: {
    count: number
    category: string
    template: string
    interval: number
    onProgress?: (progress: number, current: any, logs: any[]) => void
  }): Promise<{ success: boolean; published: number; total: number }> {
    const { count, category, template, interval, onProgress } = options
    let published = 0
    const logs: any[] = []

    try {
      // 获取真实资讯
      const newsList = await this.getRealNews(category)
      if (newsList.length === 0) {
        throw new Error('未能获取到资讯')
      }

      for (let i = 0; i < count; i++) {
        const news = newsList[i % newsList.length] // 循环使用资讯
        const content = this.generateContentFromNews(news, template)
        
        // 发布内容
        const result = await this.publishContent(content)
        
        if (result.success) {
          published++
          logs.push({
            time: new Date().toLocaleTimeString(),
            message: `第 ${i + 1} 篇内容发布成功`
          })
        } else {
          logs.push({
            time: new Date().toLocaleTimeString(),
            message: `第 ${i + 1} 篇内容发布失败: ${result.message}`
          })
        }

        // 更新进度
        if (onProgress) {
          onProgress(Math.round(((i + 1) / count) * 100), news, logs)
        }

        // 发布间隔
        if (i < count - 1) {
          logs.push({
            time: new Date().toLocaleTimeString(),
            message: `等待 ${interval} 秒后发布下一篇...`
          })
          await new Promise(resolve => setTimeout(resolve, interval * 1000))
        }
      }

      return { success: true, published, total: count }
    } catch (error) {
      console.error('批量发布失败:', error)
      return { success: false, published, total: count }
    }
  }
}

// 导出单例实例
export const realNewsPublisherService = RealNewsPublisherService.getInstance()

// 便捷方法
export const checkLoginStatus = () => realNewsPublisherService.checkLoginStatus()
export const getRealNews = (category: string) => realNewsPublisherService.getRealNews(category)
export const publishContent = (content: any) => realNewsPublisherService.publishContent(content)
export const batchPublish = (options: any) => realNewsPublisherService.batchPublish(options)
