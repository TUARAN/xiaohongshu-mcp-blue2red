<template>
  <div class="ai-search">
    <el-card class="search-header">
      <template #header>
        <div class="card-header">
          <el-icon><Search /></el-icon>
          <span>AI智能搜索</span>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索AI相关内容，如：ChatGPT、机器学习、AI工具..."
          size="large"
          @keyup.enter="handleSearch"
          class="search-input"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch" :loading="searching">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 快速搜索标签 -->
      <div class="quick-tags">
        <h4>热门搜索：</h4>
        <div class="tag-list">
          <el-tag
            v-for="tag in hotTags"
            :key="tag"
            class="quick-tag"
            @click="searchByTag(tag)"
            :type="selectedTag === tag ? 'primary' : ''"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      
      <!-- 搜索历史 -->
      <div class="search-history" v-if="searchHistory.length > 0">
        <h4>搜索历史：</h4>
        <div class="history-list">
          <el-tag
            v-for="(history, index) in searchHistory.slice(0, 10)"
            :key="index"
            class="history-tag"
            @click="searchByTag(history)"
            closable
            @close="removeHistory(index)"
          >
            {{ history }}
          </el-tag>
          <el-button 
            size="small" 
            type="text" 
            @click="clearHistory"
            v-if="searchHistory.length > 0"
          >
            清除历史
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 搜索结果 -->
    <el-card v-if="searchResults.length > 0" class="search-results">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>搜索结果 ({{ searchResults.length }} 条)</span>
          <div class="result-actions">
            <el-button @click="exportResults" size="small">
              <el-icon><Download /></el-icon>
              导出结果
            </el-button>
            <el-button @click="clearResults" size="small">
              <el-icon><Delete /></el-icon>
              清空结果
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="results-grid">
        <div 
          v-for="(item, index) in searchResults" 
          :key="index"
          class="result-item"
          @click="viewDetail(item)"
        >
          <div class="result-header">
            <h3>{{ item.title || 'AI相关内容' }}</h3>
            <div class="result-meta">
              <el-tag size="small" type="info">{{ item.type || 'AI资讯' }}</el-tag>
              <span class="publish-time">{{ formatTime(item.publishTime) }}</span>
            </div>
          </div>
          
          <div class="result-content">
            <p>{{ item.content || '相关内容描述' }}</p>
          </div>
          
          <div class="result-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ item.views || Math.floor(Math.random() * 1000) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ item.comments || Math.floor(Math.random() * 100) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ item.likes || Math.floor(Math.random() * 500) }}</span>
            </div>
          </div>
          
          <div class="result-actions">
            <el-button size="small" @click.stop="viewDetail(item)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button size="small" type="primary" @click.stop="createSimilarContent(item)">
              <el-icon><Edit /></el-icon>
              创建相似内容
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="searchResults.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalResults"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 搜索建议 -->
    <el-card v-if="searchSuggestions.length > 0 && !searchResults.length" class="search-suggestions">
      <template #header>
        <div class="card-header">
          <el-icon><Lightbulb /></el-icon>
          <span>搜索建议</span>
        </div>
      </template>
      
      <div class="suggestions-list">
        <div 
          v-for="suggestion in searchSuggestions" 
          :key="suggestion"
          class="suggestion-item"
          @click="searchByTag(suggestion)"
        >
          <el-icon><Search /></el-icon>
          <span>{{ suggestion }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 内容详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="内容详情"
      width="70%"
    >
      <div v-if="selectedContent" class="content-detail">
        <div class="detail-header">
          <h2>{{ selectedContent.title }}</h2>
          <div class="detail-meta">
            <el-tag>{{ selectedContent.type }}</el-tag>
            <span>{{ formatTime(selectedContent.publishTime) }}</span>
          </div>
        </div>
        
        <div class="detail-body">
          <p>{{ selectedContent.content }}</p>
        </div>
        
        <div class="detail-stats">
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <span>浏览: {{ selectedContent.views }}</span>
          </div>
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>评论: {{ selectedContent.comments }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span>点赞: {{ selectedContent.likes }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 创建相似内容对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建相似内容"
      width="60%"
    >
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="标题">
          <el-input 
            v-model="createForm.title" 
            placeholder="请输入标题"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="内容">
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入内容"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="图片">
          <div class="image-inputs">
            <el-input
              v-for="(image, index) in createForm.images"
              :key="index"
              v-model="createForm.images[index]"
              placeholder="请输入图片URL"
              class="image-input"
            >
              <template #append>
                <el-button @click="removeImage(index)" :disabled="createForm.images.length <= 1">
                  删除
                </el-button>
              </template>
            </el-input>
            <el-button @click="addImage" type="primary" plain>
              <el-icon><Plus /></el-icon>
              添加图片
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="标签">
          <div class="tags-input">
            <el-tag
              v-for="(tag, index) in createForm.tags"
              :key="index"
              closable
              @close="removeTag(index)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInputValue"
              size="small"
              @keyup.enter="addTag"
              @blur="addTag"
              class="tag-input"
            />
            <el-button
              v-else
              @click="showTagInput"
              size="small"
              type="primary"
              plain
            >
              <el-icon><Plus /></el-icon>
              添加标签
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmCreate"
          :loading="creating"
        >
          创建内容
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchFeeds, getFeeds, publishContent } from '../api/mcp'
import { 
  smartSearch, 
  getHotKeywords, 
  getSearchSuggestions, 
  getSearchHistory,
  clearSearchHistory,
  getRelatedRecommendations,
  exportSearchResults
} from '../api/aiSearch'
import dayjs from 'dayjs'

// 响应式数据
const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref([])
const searchSuggestions = ref([])
const selectedTag = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const detailDialogVisible = ref(false)
const createDialogVisible = ref(false)
const selectedContent = ref(null)
const creating = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')

// 创建表单
const createForm = reactive({
  title: '',
  content: '',
  images: ['https://picsum.photos/800/600'],
  tags: ['AI', '人工智能']
})

// 热门标签
const hotTags = ref([])
const searchHistory = ref([])
const showHistory = ref(false)

// 方法
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  searching.value = true
  try {
    // 使用智能搜索API
    const result = await smartSearch(searchQuery.value, {
      type: 'all',
      sort: 'relevance',
      limit: 50
    })
    
    if (result.success && result.data.length > 0) {
      searchResults.value = result.data.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title || 'AI相关内容',
        content: item.content || '相关内容描述',
        type: '搜索结果',
        publishTime: new Date(),
        views: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 500)
      }))
      totalResults.value = searchResults.value.length
      ElMessage.success(`找到 ${searchResults.value.length} 条结果`)
    } else {
      searchResults.value = []
      totalResults.value = 0
      ElMessage.info('未找到相关结果')
    }
  } catch (error) {
    ElMessage.error('搜索失败')
    console.error('搜索错误:', error)
  } finally {
    searching.value = false
  }
}

const searchByTag = (tag: string) => {
  searchQuery.value = tag
  selectedTag.value = tag
  handleSearch()
}

const viewDetail = (item: any) => {
  selectedContent.value = item
  detailDialogVisible.value = true
}

const createSimilarContent = (item: any) => {
  selectedContent.value = item
  createForm.title = `基于"${item.title}"的AI内容`
  createForm.content = `这是基于"${item.title}"创建的相似内容。\n\n💡 灵感来源：${item.title}\n🎯 内容类型：AI相关\n\n#AI #人工智能 #内容创作`
  createForm.tags = ['AI', '人工智能', '内容创作']
  createDialogVisible.value = true
}

const addImage = () => {
  createForm.images.push('https://picsum.photos/800/600')
}

const removeImage = (index: number) => {
  if (createForm.images.length > 1) {
    createForm.images.splice(index, 1)
  }
}

const showTagInput = () => {
  tagInputVisible.value = true
}

const addTag = () => {
  if (tagInputValue.value.trim() && !createForm.tags.includes(tagInputValue.value.trim())) {
    createForm.tags.push(tagInputValue.value.trim())
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

const removeTag = (index: number) => {
  createForm.tags.splice(index, 1)
}

const confirmCreate = async () => {
  if (!createForm.title.trim() || !createForm.content.trim()) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  
  creating.value = true
  try {
    const result = await publishContent({
      title: createForm.title,
      content: createForm.content,
      images: createForm.images,
      tags: createForm.tags
    })
    
    if (result.result) {
      ElMessage.success('内容创建成功！')
      createDialogVisible.value = false
    } else {
      ElMessage.error('内容创建失败')
    }
  } catch (error) {
    ElMessage.error('内容创建失败：' + error)
  } finally {
    creating.value = false
  }
}

const exportResults = () => {
  exportSearchResults(searchResults.value, 'json')
  ElMessage.success('搜索结果已导出')
}

const clearResults = () => {
  searchResults.value = []
  totalResults.value = 0
  searchQuery.value = ''
  selectedTag.value = ''
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const formatTime = (time: Date) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 生成搜索建议
const generateSuggestions = async () => {
  try {
    const suggestions = await getSearchSuggestions(searchQuery.value)
    searchSuggestions.value = suggestions
  } catch (error) {
    console.error('获取搜索建议失败:', error)
  }
}

// 加载热门关键词
const loadHotKeywords = async () => {
  try {
    const keywords = await getHotKeywords()
    hotTags.value = keywords
  } catch (error) {
    console.error('获取热门关键词失败:', error)
  }
}

// 加载搜索历史
const loadSearchHistory = () => {
  searchHistory.value = getSearchHistory()
}

// 清除搜索历史
const clearHistory = () => {
  clearSearchHistory()
  searchHistory.value = []
  ElMessage.success('搜索历史已清除')
}

// 删除单个搜索历史
const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  // 更新本地存储
  localStorage.setItem('ai_search_history', JSON.stringify(searchHistory.value))
}

// 初始化
onMounted(async () => {
  await loadHotKeywords()
  loadSearchHistory()
  await generateSuggestions()
})
</script>

<style scoped>
.ai-search {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.search-header {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  max-width: 600px;
}

.quick-tags h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-tag:hover {
  transform: scale(1.05);
}

.search-history {
  margin-top: 20px;
}

.search-history h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.history-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.history-tag:hover {
  transform: scale(1.05);
}

.search-results {
  margin-bottom: 20px;
}

.result-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.result-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.result-header {
  margin-bottom: 15px;
}

.result-header h3 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-size: 16px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #666;
}

.result-content {
  margin-bottom: 15px;
}

.result-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.search-suggestions {
  margin-bottom: 20px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.content-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-header h2 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.detail-body {
  margin-bottom: 20px;
  line-height: 1.8;
}

.detail-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.image-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-input {
  margin-bottom: 10px;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-item {
  margin-right: 8px;
}

.tag-input {
  width: 100px;
}
</style>
