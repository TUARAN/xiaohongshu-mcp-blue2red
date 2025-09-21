<template>
  <div class="news-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>📰 蓝点网资讯</h1>
      <p>实时获取最新科技行业资讯，AI热点新闻，云计算动态</p>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索资讯内容..."
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch" :loading="searching">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 分类筛选 -->
      <div class="filter-section">
        <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="industry">行业资讯</el-radio-button>
          <el-radio-button label="ai">人工智能</el-radio-button>
          <el-radio-button label="cloud">云计算</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button @click="refreshNews" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新资讯
        </el-button>
        <el-button @click="exportNews" :disabled="newsList.length === 0">
          <el-icon><Download /></el-icon>
          导出资讯
        </el-button>
        <el-button @click="clearNews" :disabled="newsList.length === 0">
          <el-icon><Delete /></el-icon>
          清空列表
        </el-button>
        <el-button type="primary" @click="showPublishDialog = true">
          <el-icon><Edit /></el-icon>
          智能发布
        </el-button>
        <el-button type="success" @click="batchPublish" :loading="batchPublishing">
          <el-icon><Upload /></el-icon>
          批量发布
        </el-button>
      </div>
    </el-card>

    <!-- 资讯列表 -->
    <div class="news-list" v-loading="loading">
      <el-card 
        v-for="news in filteredNews" 
        :key="news.id" 
        class="news-item"
        shadow="hover"
      >
        <div class="news-content">
          <div class="news-header">
            <h3 class="news-title" @click="viewNewsDetail(news)">
              {{ news.title }}
            </h3>
            <div class="news-meta">
              <el-tag :type="getCategoryType(news.category)" size="small">
                {{ news.category }}
              </el-tag>
              <span class="news-time">{{ formatTime(news.publishTime) }}</span>
            </div>
          </div>
          
          <div class="news-summary">
            {{ news.summary }}
          </div>
          
          <div class="news-footer">
            <div class="news-tags">
              <el-tag 
                v-for="tag in news.tags" 
                :key="tag" 
                size="small" 
                class="news-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
            
            <div class="news-actions">
              <div class="news-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ news.views || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ news.author }}
                </span>
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="publishSingleNewsItem(news)"
                  :loading="publishingNews[news.id]"
                >
                  <el-icon><Upload /></el-icon>
                  发布
                </el-button>
              </div>
            </div>
          </div>
          
          <div class="news-actions">
            <el-button size="small" @click="viewNewsDetail(news)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button size="small" @click="createContentFromNews(news)">
              <el-icon><Edit /></el-icon>
              创建内容
            </el-button>
            <el-button size="small" @click="openNewsLink(news.link)">
              <el-icon><Link /></el-icon>
              原文链接
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalNews"
        layout="total, prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新闻详情对话框 -->
    <el-dialog
      v-model="showNewsDetail"
      :title="selectedNews?.title"
      width="80%"
      :before-close="closeNewsDetail"
    >
      <div v-if="selectedNews" class="news-detail">
        <div class="detail-meta">
          <el-tag :type="getCategoryType(selectedNews.category)">
            {{ selectedNews.category }}
          </el-tag>
          <span class="detail-time">{{ formatTime(selectedNews.publishTime) }}</span>
          <span class="detail-author">作者：{{ selectedNews.author }}</span>
        </div>
        
        <div class="detail-content">
          <p>{{ selectedNews.summary }}</p>
          <div v-if="selectedNews.content" class="detail-full-content">
            {{ selectedNews.content }}
          </div>
        </div>
        
        <div class="detail-tags">
          <el-tag 
            v-for="tag in selectedNews.tags" 
            :key="tag" 
            class="detail-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
        
        <div class="detail-actions">
          <el-button @click="createContentFromNews(selectedNews)">
            <el-icon><Edit /></el-icon>
            基于此资讯创建内容
          </el-button>
          <el-button @click="openNewsLink(selectedNews.link)">
            <el-icon><Link /></el-icon>
            查看原文
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 创建内容对话框 -->
    <el-dialog
      v-model="showCreateContent"
      title="基于资讯创建内容"
      width="70%"
    >
      <div v-if="selectedNews" class="create-content">
        <el-form :model="contentForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="contentForm.title" placeholder="请输入标题" />
          </el-form-item>
          
          <el-form-item label="内容">
            <el-input
              v-model="contentForm.content"
              type="textarea"
              :rows="8"
              placeholder="请输入内容"
            />
          </el-form-item>
          
          <el-form-item label="图片">
            <el-input v-model="contentForm.images[0]" placeholder="请输入图片URL" />
          </el-form-item>
          
          <el-form-item label="标签">
            <el-input v-model="contentForm.tags" placeholder="请输入标签，用逗号分隔" />
          </el-form-item>
        </el-form>
        
        <div class="create-actions">
          <el-button @click="showCreateContent = false">取消</el-button>
          <el-button type="primary" @click="publishContent" :loading="publishing">
            发布内容
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 智能发布对话框 -->
    <el-dialog
      v-model="showPublishDialog"
      title="🤖 智能发布设置"
      width="70%"
      :before-close="closePublishDialog"
    >
      <div class="publish-settings">
        <el-form :model="publishForm" label-width="120px">
          <el-form-item label="发布类型">
            <el-radio-group v-model="publishForm.type">
              <el-radio-button label="single">单篇发布</el-radio-button>
              <el-radio-button label="batch">批量发布</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="资讯分类" v-if="publishForm.type === 'single'">
            <el-select v-model="publishForm.category" placeholder="选择资讯分类">
              <el-option label="行业资讯" value="industry" />
              <el-option label="人工智能" value="ai" />
              <el-option label="云计算" value="cloud" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="发布数量" v-if="publishForm.type === 'batch'">
            <el-input-number 
              v-model="publishForm.count" 
              :min="1" 
              :max="5" 
              controls-position="right"
            />
            <span class="form-tip">建议不超过5篇，避免发布过于频繁</span>
          </el-form-item>
          
          <el-form-item label="内容模板">
            <el-select v-model="publishForm.template" placeholder="选择内容模板">
              <el-option label="技术突破型" value="tech_breakthrough" />
              <el-option label="AI前沿型" value="ai_news" />
              <el-option label="行业趋势型" value="industry_trend" />
              <el-option label="智能生成" value="auto" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="发布间隔" v-if="publishForm.type === 'batch'">
            <el-input-number 
              v-model="publishForm.interval" 
              :min="30" 
              :max="300" 
              controls-position="right"
            />
            <span class="form-tip">秒，建议30-60秒</span>
          </el-form-item>
        </el-form>
        
        <div class="publish-preview" v-if="previewContent">
          <h4>📝 内容预览</h4>
          <el-card class="preview-card">
            <h5>{{ previewContent.title }}</h5>
            <p class="preview-content">{{ previewContent.content.substring(0, 200) }}...</p>
            <div class="preview-tags">
              <el-tag 
                v-for="tag in previewContent.tags" 
                :key="tag" 
                size="small"
                class="preview-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>
        </div>
        
        <div class="publish-actions">
          <el-button @click="previewContent = null">取消</el-button>
          <el-button @click="previewPublish" :loading="previewing">
            <el-icon><View /></el-icon>
            预览内容
          </el-button>
          <el-button type="primary" @click="startPublish" :loading="publishing">
            <el-icon><Upload /></el-icon>
            开始发布
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 发布进度对话框 -->
    <el-dialog
      v-model="showProgressDialog"
      title="📊 发布进度"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="progress-content">
        <el-progress 
          :percentage="publishProgress" 
          :status="publishStatus"
          :stroke-width="8"
        />
        <div class="progress-info">
          <p>已发布: {{ publishedCount }} / {{ totalCount }}</p>
          <p v-if="currentNews">当前: {{ currentNews.title }}</p>
          <p v-if="publishLogs.length > 0" class="publish-logs">
            <strong>发布日志:</strong>
            <div v-for="log in publishLogs" :key="log.time" class="log-item">
              {{ log.time }}: {{ log.message }}
            </div>
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, Refresh, Download, Delete, View, Edit, Link, User, Upload 
} from '@element-plus/icons-vue'
import { 
  crawlIndustryNews, 
  crawlAINews, 
  crawlCloudNews, 
  getAllNews, 
  searchNews,
  getNewsDetail 
} from '../api/newsCrawler'
import { publishContent as publishToXHS } from '../api/mcp'
import { 
  realNewsPublisherService,
  getRealNews,
  publishContent as publishRealContent,
  batchPublish as batchPublishReal
} from '../api/realNewsPublisher'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const searching = ref(false)
const newsList = ref<any[]>([])
const searchKeyword = ref('')
const selectedCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const showNewsDetail = ref(false)
const selectedNews = ref<any>(null)
const showCreateContent = ref(false)
const publishing = ref(false)

// 智能发布相关
const showPublishDialog = ref(false)
const showProgressDialog = ref(false)
const batchPublishing = ref(false)
const previewing = ref(false)
const previewContent = ref<any>(null)

// 发布表单
const publishForm = reactive({
  type: 'single',
  category: 'industry',
  count: 3,
  template: 'auto',
  interval: 30
})

// 发布进度
const publishProgress = ref(0)
const publishStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const publishedCount = ref(0)
const totalCount = ref(0)
const currentNews = ref<any>(null)
const publishLogs = ref<Array<{time: string, message: string}>>([])

// 单个资讯发布状态
const publishingNews = ref<{[key: string]: boolean}>({})

// 内容表单
const contentForm = reactive({
  title: '',
  content: '',
  images: ['https://picsum.photos/800/600'],
  tags: ''
})

// 计算属性
const filteredNews = computed(() => {
  let filtered = newsList.value
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(news => news.category === selectedCategory.value)
  }
  
  if (searchKeyword.value) {
    filtered = filtered.filter(news => 
      news.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      news.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }
  
  return filtered
})

const totalNews = computed(() => filteredNews.value.length)
const totalPages = computed(() => Math.ceil(totalNews.value / pageSize.value))

// 方法
const loadNews = async () => {
  loading.value = true
  try {
    const news = await getAllNews()
    newsList.value = news
    ElMessage.success(`成功加载 ${news.length} 条资讯`)
  } catch (error) {
    ElMessage.error('加载资讯失败')
    console.error('加载资讯失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshNews = async () => {
  await loadNews()
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    await loadNews()
    return
  }
  
  searching.value = true
  try {
    const results = await searchNews(searchKeyword.value)
    newsList.value = results
    ElMessage.success(`找到 ${results.length} 条相关资讯`)
  } catch (error) {
    ElMessage.error('搜索失败')
    console.error('搜索失败:', error)
  } finally {
    searching.value = false
  }
}

const handleCategoryChange = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const viewNewsDetail = async (news: any) => {
  selectedNews.value = news
  showNewsDetail.value = true
  
  // 如果还没有详细内容，尝试获取
  if (!news.content) {
    try {
      const detail = await getNewsDetail(news.link)
      if (detail) {
        selectedNews.value = { ...news, ...detail }
      }
    } catch (error) {
      console.error('获取新闻详情失败:', error)
    }
  }
}

const closeNewsDetail = () => {
  showNewsDetail.value = false
  selectedNews.value = null
}

const createContentFromNews = (news: any) => {
  selectedNews.value = news
  contentForm.title = news.title
  contentForm.content = news.summary
  contentForm.tags = news.tags.join(', ')
  showCreateContent.value = true
}

const publishContent = async () => {
  if (!contentForm.title || !contentForm.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  
  publishing.value = true
  try {
    const result = await publishToXHS({
      title: contentForm.title,
      content: contentForm.content,
      images: contentForm.images,
      tags: contentForm.tags.split(',').map(tag => tag.trim())
    })
    
    if (result.success) {
      ElMessage.success('内容发布成功')
      showCreateContent.value = false
    } else {
      ElMessage.error('内容发布失败')
    }
  } catch (error) {
    ElMessage.error('内容发布失败')
    console.error('发布失败:', error)
  } finally {
    publishing.value = false
  }
}

const openNewsLink = (url: string) => {
  window.open(url, '_blank')
}

const exportNews = () => {
  const data = filteredNews.value.map(news => ({
    标题: news.title,
    摘要: news.summary,
    分类: news.category,
    作者: news.author,
    发布时间: formatTime(news.publishTime),
    标签: news.tags.join(', '),
    浏览数: news.views,
    链接: news.link
  }))
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `蓝点网资讯_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('资讯已导出')
}

const clearNews = () => {
  newsList.value = []
  searchKeyword.value = ''
  selectedCategory.value = 'all'
  currentPage.value = 1
}

const getCategoryType = (category: string) => {
  switch (category) {
    case '行业资讯': return 'primary'
    case '人工智能': return 'success'
    case '云计算': return 'info'
    default: return 'default'
  }
}

const formatTime = (time: Date) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 智能发布相关方法
const closePublishDialog = () => {
  showPublishDialog.value = false
  previewContent.value = null
}

const previewPublish = async () => {
  previewing.value = true
  try {
    // 获取真实资讯
    const newsList = await getRealNews(publishForm.category)
    if (newsList.length === 0) {
      ElMessage.warning('未能获取到资讯，请稍后重试')
      return
    }
    
    // 选择第一条资讯进行预览
    const news = newsList[0]
    
    // 根据模板生成内容
    const content = realNewsPublisherService.generateContentFromNews(news, publishForm.template)
    previewContent.value = content
    
    ElMessage.success('内容预览生成成功')
  } catch (error) {
    ElMessage.error('预览生成失败')
    console.error('预览失败:', error)
  } finally {
    previewing.value = false
  }
}

const generateContentFromNews = (news: any, template: string) => {
  const templates = {
    tech_breakthrough: {
      title: `🔥 ${news.title}`,
      content: `🔥 ${news.title}\n\n💡 最新科技动态分享！\n\n📰 ${news.summary}\n\n🎯 技术要点：\n• 技术创新突破\n• 应用场景广泛\n• 未来发展潜力巨大\n\n🌟 这个技术将如何改变我们的生活？\n\n#科技资讯 #技术突破 #创新科技`,
      tags: ['科技资讯', '技术突破', '创新科技']
    },
    ai_news: {
      title: `🤖 ${news.title}`,
      content: `🤖 ${news.title}\n\n💡 AI领域最新动态！\n\n📰 ${news.summary}\n\n🎯 AI技术亮点：\n• AI算法优化\n• 模型性能提升\n• 应用领域扩展\n\n🚀 AI正在重塑我们的世界，你准备好了吗？\n\n#人工智能 #AI技术 #机器学习 #深度学习`,
      tags: ['人工智能', 'AI技术', '机器学习', '深度学习']
    },
    industry_trend: {
      title: `📈 ${news.title}`,
      content: `📈 ${news.title}\n\n💡 科技行业深度观察！\n\n📰 ${news.summary}\n\n🎯 行业影响：\n• 行业标准重塑\n• 商业模式创新\n• 用户体验升级\n\n🌍 这个趋势将如何影响整个行业？\n\n#科技趋势 #行业分析 #创新科技 #数字化转型`,
      tags: ['科技趋势', '行业分析', '创新科技', '数字化转型']
    },
    auto: {
      title: `💡 ${news.title}`,
      content: `💡 ${news.title}\n\n📰 ${news.summary}\n\n🎯 这个技术/趋势将如何影响我们的生活和工作？\n\n#科技资讯 #创新科技`,
      tags: ['科技资讯', '创新科技']
    }
  }
  
  return templates[template as keyof typeof templates] || templates.auto
}

const startPublish = async () => {
  if (publishForm.type === 'single') {
    await publishSingleNews()
  } else {
    await batchPublish()
  }
}

const publishSingleNews = async () => {
  publishing.value = true
  try {
    // 获取真实资讯
    const newsList = await getRealNews(publishForm.category)
    if (newsList.length === 0) {
      ElMessage.warning('未能获取到资讯，请稍后重试')
      return
    }
    
    // 选择第一条资讯
    const news = newsList[0]
    const content = realNewsPublisherService.generateContentFromNews(news, publishForm.template)
    
    // 发布内容
    const result = await publishRealContent({
      title: content.title,
      content: content.content,
      images: ['https://picsum.photos/800/600'],
      tags: content.tags
    })
    
    if (result.success) {
      ElMessage.success('内容发布成功')
      showPublishDialog.value = false
    } else {
      ElMessage.error(`内容发布失败: ${result.message}`)
    }
  } catch (error) {
    ElMessage.error('发布失败')
    console.error('发布失败:', error)
  } finally {
    publishing.value = false
  }
}

// 发布单个资讯（从资讯列表直接发布）
const publishSingleNewsItem = async (news: any) => {
  if (publishingNews.value[news.id]) {
    return // 如果正在发布，直接返回
  }
  
  publishingNews.value[news.id] = true
  
  try {
    // 生成内容，使用智能模板
    const content = realNewsPublisherService.generateContentFromNews(news, 'auto')
    
    // 处理标题长度限制（小红书标题限制20字符）
    const maxTitleLength = 20
    let finalTitle = content.title
    if (finalTitle.length > maxTitleLength) {
      // 如果标题过长，截取并添加省略号
      finalTitle = finalTitle.substring(0, maxTitleLength - 3) + '...'
    }
    
    // 发布内容
    const result = await publishRealContent({
      title: finalTitle,
      content: content.content,
      images: content.images,
      tags: content.tags
    })
    
    if (result.success) {
      ElMessage.success(`资讯"${news.title}"发布成功`)
    } else {
      ElMessage.error(`资讯发布失败: ${result.message}`)
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请稍后重试')
  } finally {
    publishingNews.value[news.id] = false
  }
}

const batchPublish = async () => {
  batchPublishing.value = true
  showProgressDialog.value = true
  
  // 重置进度
  publishProgress.value = 0
  publishStatus.value = ''
  publishedCount.value = 0
  totalCount.value = publishForm.count
  publishLogs.value = []
  
  try {
    // 使用真实的批量发布API
    const result = await batchPublishReal({
      count: publishForm.count,
      category: publishForm.category,
      template: publishForm.template,
      interval: publishForm.interval,
      onProgress: (progress: number, current: any, logs: any[]) => {
        publishProgress.value = progress
        currentNews.value = current
        publishLogs.value = [...logs]
        publishedCount.value = Math.floor((progress / 100) * publishForm.count)
      }
    })
    
    if (result.success) {
      publishStatus.value = 'success'
      ElMessage.success(`批量发布完成！成功发布 ${result.published} 篇内容`)
    } else {
      publishStatus.value = 'exception'
      ElMessage.error('批量发布失败')
    }
    
  } catch (error) {
    publishStatus.value = 'exception'
    ElMessage.error('批量发布失败')
    console.error('批量发布失败:', error)
  } finally {
    batchPublishing.value = false
    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

// 初始化
onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.search-card {
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.action-section {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.news-list {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.news-item {
  transition: all 0.3s;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-content {
  padding: 20px;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.news-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.3s;
  margin: 0;
  flex: 1;
  margin-right: 15px;
}

.news-title:hover {
  color: #409eff;
}

.news-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.news-time {
  font-size: 12px;
  color: #999;
}

.news-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.news-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.news-tag {
  font-size: 12px;
}

.news-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.news-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.news-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-time, .detail-author {
  font-size: 14px;
  color: #666;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content p {
  line-height: 1.8;
  color: #333;
  margin-bottom: 15px;
}

.detail-full-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  line-height: 1.6;
  color: #555;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.detail-tag {
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.create-content {
  max-height: 60vh;
  overflow-y: auto;
}

.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .news-container {
    padding: 10px;
  }
  
  .news-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .news-meta {
    align-items: flex-start;
    margin-top: 10px;
  }
  
  .news-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .news-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

/* 智能发布相关样式 */
.publish-settings {
  max-height: 60vh;
  overflow-y: auto;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.publish-preview {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.publish-preview h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.preview-card {
  margin-top: 10px;
}

.preview-card h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.preview-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.preview-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.preview-tag {
  font-size: 12px;
}

.publish-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.progress-content {
  text-align: center;
}

.progress-info {
  margin-top: 20px;
  text-align: left;
}

.progress-info p {
  margin: 5px 0;
  color: #666;
}

.publish-logs {
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
}

.log-item {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
  padding: 2px 0;
  border-bottom: 1px solid #eee;
}

.log-item:last-child {
  border-bottom: none;
}

/* 单个资讯发布按钮样式 */
.news-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .el-button {
  font-size: 12px;
  padding: 6px 12px;
}
</style>
