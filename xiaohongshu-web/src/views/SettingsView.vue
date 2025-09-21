<template>
  <div class="settings">
    <el-row :gutter="20">
      <!-- 左侧：系统设置 -->
      <el-col :span="12">
        <el-card class="system-settings">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </div>
          </template>
          
          <el-form :model="systemSettings" label-width="120px">
            <el-form-item label="MCP服务器地址">
              <el-input v-model="systemSettings.mcpUrl" placeholder="http://localhost:18060/mcp" />
            </el-form-item>
            
            <el-form-item label="请求超时时间">
              <el-input-number 
                v-model="systemSettings.timeout" 
                :min="5" 
                :max="60" 
                :step="5"
              />
              <span class="unit">秒</span>
            </el-form-item>
            
            <el-form-item label="重试次数">
              <el-input-number 
                v-model="systemSettings.retryCount" 
                :min="1" 
                :max="5"
              />
            </el-form-item>
            
            <el-form-item label="自动刷新">
              <el-switch v-model="systemSettings.autoRefresh" />
            </el-form-item>
            
            <el-form-item label="刷新间隔">
              <el-input-number 
                v-model="systemSettings.refreshInterval" 
                :min="30" 
                :max="300" 
                :step="30"
                :disabled="!systemSettings.autoRefresh"
              />
              <span class="unit">秒</span>
            </el-form-item>
          </el-form>
          
          <div class="form-actions">
            <el-button type="primary" @click="saveSystemSettings">
              <el-icon><Check /></el-icon>
              保存设置
            </el-button>
            <el-button @click="resetSystemSettings">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>
          
          <!-- 连接状态和操作 -->
          <el-divider content-position="left">连接状态</el-divider>
          
          <div class="connection-status">
            <div class="status-item">
              <span>MCP服务器:</span>
              <el-tag :type="connectionStatus.serverStatus ? 'success' : 'danger'">
                {{ connectionStatus.serverStatus ? '已连接' : '未连接' }}
              </el-tag>
            </div>
            <div class="status-item">
              <span>登录状态:</span>
              <el-tag :type="connectionStatus.loginStatus ? 'success' : 'warning'">
                {{ connectionStatus.loginStatus ? '已登录' : '未登录' }}
              </el-tag>
            </div>
            <div class="status-item">
              <span>最后检查:</span>
              <span class="timestamp">{{ formatTime(connectionStatus.timestamp) }}</span>
            </div>
          </div>
          
          <div class="connection-actions">
            <el-button 
              type="success" 
              @click="autoConnect"
              :loading="connecting"
              :disabled="connectionStatus.serverStatus && connectionStatus.loginStatus"
            >
              <el-icon><Connection /></el-icon>
              一键连接登录
            </el-button>
            <el-button 
              type="primary" 
              @click="checkStatus"
              :loading="checking"
            >
              <el-icon><Refresh /></el-icon>
              刷新状态
            </el-button>
            <el-button 
              type="warning" 
              @click="startBrowser"
              :loading="browserStarting"
            >
              <el-icon><Monitor /></el-icon>
              启动浏览器
            </el-button>
          </div>
          
          <!-- MCP服务器启动说明 -->
          <el-alert
            v-if="!connectionStatus.serverStatus"
            title="MCP服务器未运行"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>请先启动MCP服务器：</p>
              <ol>
                <li>打开终端</li>
                <li>进入项目目录：<code>cd /Users/tuaran/Documents/GitHub/xiaohongshu/xiaohongshu-mcp</code></li>
                <li>编译并启动服务器：<code>go build -o xiaohongshu-mcp . && ./xiaohongshu-mcp</code></li>
                <li>或者直接运行：<code>go run main.go</code></li>
              </ol>
            </template>
          </el-alert>
        </el-card>
      </el-col>
      
      <!-- 右侧：发布设置 -->
      <el-col :span="12">
        <el-card class="publish-settings">
          <template #header>
            <div class="card-header">
              <el-icon><Edit /></el-icon>
              <span>发布设置</span>
            </div>
          </template>
          
          <el-form :model="publishSettings" label-width="120px">
            <el-form-item label="每日最大发布数">
              <el-input-number 
                v-model="publishSettings.maxDailyPosts" 
                :min="1" 
                :max="20"
              />
            </el-form-item>
            
            <el-form-item label="标题最大长度">
              <el-input-number 
                v-model="publishSettings.titleMaxLength" 
                :min="10" 
                :max="50"
              />
            </el-form-item>
            
            <el-form-item label="内容最大长度">
              <el-input-number 
                v-model="publishSettings.contentMaxLength" 
                :min="100" 
                :max="2000"
              />
            </el-form-item>
            
            <el-form-item label="最少图片数量">
              <el-input-number 
                v-model="publishSettings.minImages" 
                :min="1" 
                :max="5"
              />
            </el-form-item>
            
            <el-form-item label="最多图片数量">
              <el-input-number 
                v-model="publishSettings.maxImages" 
                :min="1" 
                :max="9"
              />
            </el-form-item>
            
            <el-form-item label="最多标签数量">
              <el-input-number 
                v-model="publishSettings.maxTags" 
                :min="1" 
                :max="10"
              />
            </el-form-item>
            
            <el-form-item label="自动添加标签">
              <el-switch v-model="publishSettings.autoAddTags" />
            </el-form-item>
          </el-form>
          
          <div class="form-actions">
            <el-button type="primary" @click="savePublishSettings">
              <el-icon><Check /></el-icon>
              保存设置
            </el-button>
            <el-button @click="resetPublishSettings">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 定时发布设置 -->
    <el-card class="schedule-settings">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>定时发布设置</span>
        </div>
      </template>
      
      <el-form :model="scheduleSettings" label-width="120px">
        <el-form-item label="启用定时发布">
          <el-switch v-model="scheduleSettings.enabled" />
        </el-form-item>
        
        <div v-if="scheduleSettings.enabled" class="schedule-config">
          <el-form-item label="发布时间">
            <div class="time-slots">
              <div v-for="(slot, index) in scheduleSettings.timeSlots" :key="index" class="time-slot">
                <el-time-picker
                  v-model="slot.time"
                  format="HH:mm"
                  placeholder="选择时间"
                />
                <el-select v-model="slot.type" placeholder="选择类型">
                  <el-option label="AI技术突破" value="ai_breakthrough" />
                  <el-option label="AI工具推荐" value="ai_tools" />
                  <el-option label="AI行业动态" value="ai_industry" />
                  <el-option label="AI学习指南" value="ai_education" />
                </el-select>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeTimeSlot(index)"
                  :disabled="scheduleSettings.timeSlots.length <= 1"
                >
                  删除
                </el-button>
              </div>
              <el-button type="primary" plain @click="addTimeSlot">
                <el-icon><Plus /></el-icon>
                添加时间
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item label="发布间隔">
            <el-input-number 
              v-model="scheduleSettings.interval" 
              :min="30" 
              :max="300" 
              :step="30"
            />
            <span class="unit">分钟</span>
          </el-form-item>
        </div>
      </el-form>
      
      <div class="form-actions">
        <el-button type="primary" @click="saveScheduleSettings">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
        <el-button @click="resetScheduleSettings">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </el-card>
    
    <!-- 关键词管理 -->
    <el-card class="keywords-settings">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>关键词管理</span>
        </div>
      </template>
      
      <div class="keywords-section">
        <div class="keywords-list">
          <el-tag
            v-for="(keyword, index) in keywordsSettings.keywords"
            :key="index"
            closable
            @close="removeKeyword(index)"
            class="keyword-tag"
          >
            {{ keyword }}
          </el-tag>
        </div>
        
        <div class="keyword-input">
          <el-input
            v-model="newKeyword"
            placeholder="输入新关键词"
            @keyup.enter="addKeyword"
          >
            <template #append>
              <el-button @click="addKeyword">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <div class="form-actions">
        <el-button type="primary" @click="saveKeywordsSettings">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
        <el-button @click="resetKeywordsSettings">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  autoConnectAndLogin, 
  getSystemStatus, 
  startMCPServer, 
  startBrowserAndLogin 
} from '../api/mcp'

// 响应式数据
const newKeyword = ref('')

// 连接状态
const connectionStatus = reactive({
  serverStatus: false,
  loginStatus: false,
  timestamp: new Date().toISOString()
})

// 加载状态
const connecting = ref(false)
const checking = ref(false)
const browserStarting = ref(false)

// 系统设置
const systemSettings = reactive({
  mcpUrl: 'http://localhost:18060/mcp',
  timeout: 30,
  retryCount: 3,
  autoRefresh: true,
  refreshInterval: 60
})

// 发布设置
const publishSettings = reactive({
  maxDailyPosts: 5,
  titleMaxLength: 20,
  contentMaxLength: 1000,
  minImages: 1,
  maxImages: 9,
  maxTags: 5,
  autoAddTags: true
})

// 定时发布设置
const scheduleSettings = reactive({
  enabled: false,
  timeSlots: [
    { time: '08:00', type: 'ai_breakthrough' },
    { time: '12:00', type: 'ai_tools' },
    { time: '18:00', type: 'ai_industry' }
  ],
  interval: 60
})

// 关键词设置
const keywordsSettings = reactive({
  keywords: [
    'ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'Sora', 'Midjourney',
    '自动驾驶', '机器学习', '深度学习', '神经网络', '大模型',
    'AI绘画', 'AI写作', 'AI编程', 'AI医疗', 'AI教育'
  ]
})

// 方法
const saveSystemSettings = () => {
  localStorage.setItem('systemSettings', JSON.stringify(systemSettings))
  ElMessage.success('系统设置已保存')
}

const resetSystemSettings = () => {
  Object.assign(systemSettings, {
    mcpUrl: 'http://localhost:18060/mcp',
    timeout: 30,
    retryCount: 3,
    autoRefresh: true,
    refreshInterval: 60
  })
  ElMessage.info('系统设置已重置')
}

const savePublishSettings = () => {
  localStorage.setItem('publishSettings', JSON.stringify(publishSettings))
  ElMessage.success('发布设置已保存')
}

const resetPublishSettings = () => {
  Object.assign(publishSettings, {
    maxDailyPosts: 5,
    titleMaxLength: 20,
    contentMaxLength: 1000,
    minImages: 1,
    maxImages: 9,
    maxTags: 5,
    autoAddTags: true
  })
  ElMessage.info('发布设置已重置')
}

const saveScheduleSettings = () => {
  localStorage.setItem('scheduleSettings', JSON.stringify(scheduleSettings))
  ElMessage.success('定时发布设置已保存')
}

const resetScheduleSettings = () => {
  Object.assign(scheduleSettings, {
    enabled: false,
    timeSlots: [
      { time: '08:00', type: 'ai_breakthrough' },
      { time: '12:00', type: 'ai_tools' },
      { time: '18:00', type: 'ai_industry' }
    ],
    interval: 60
  })
  ElMessage.info('定时发布设置已重置')
}

const addTimeSlot = () => {
  scheduleSettings.timeSlots.push({
    time: '09:00',
    type: 'ai_breakthrough'
  })
}

const removeTimeSlot = (index: number) => {
  if (scheduleSettings.timeSlots.length > 1) {
    scheduleSettings.timeSlots.splice(index, 1)
  }
}

const addKeyword = () => {
  if (newKeyword.value.trim() && !keywordsSettings.keywords.includes(newKeyword.value.trim())) {
    keywordsSettings.keywords.push(newKeyword.value.trim())
    newKeyword.value = ''
  }
}

const removeKeyword = (index: number) => {
  keywordsSettings.keywords.splice(index, 1)
}

const saveKeywordsSettings = () => {
  localStorage.setItem('keywordsSettings', JSON.stringify(keywordsSettings))
  ElMessage.success('关键词设置已保存')
}

const resetKeywordsSettings = () => {
  Object.assign(keywordsSettings, {
    keywords: [
      'ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'Sora', 'Midjourney',
      '自动驾驶', '机器学习', '深度学习', '神经网络', '大模型',
      'AI绘画', 'AI写作', 'AI编程', 'AI医疗', 'AI教育'
    ]
  })
  ElMessage.info('关键词设置已重置')
}

// 连接和登录方法
const autoConnect = async () => {
  connecting.value = true
  try {
    const result = await autoConnectAndLogin()
    if (result.serverConnected && result.loginStatus) {
      ElMessage.success('连接和登录成功！')
      await checkStatus()
    } else {
      ElMessage.warning('连接成功，但登录状态异常')
    }
  } catch (error: any) {
    let errorMessage = '自动连接失败'
    
    if (error.message && error.message.includes('Network Error')) {
      errorMessage = 'MCP服务器未运行，请先启动服务器'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = '无法连接到MCP服务器，请检查服务器是否启动'
    } else if (error.message) {
      errorMessage = '自动连接失败：' + error.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    connecting.value = false
  }
}

const checkStatus = async () => {
  checking.value = true
  try {
    const status = await getSystemStatus()
    Object.assign(connectionStatus, status)
    ElMessage.success('状态检查完成')
  } catch (error: any) {
    ElMessage.error('状态检查失败：' + (error.message || '未知错误'))
  } finally {
    checking.value = false
  }
}

const startBrowser = async () => {
  browserStarting.value = true
  try {
    await startBrowserAndLogin()
    ElMessage.success('浏览器启动成功，请完成登录')
    await checkStatus()
  } catch (error: any) {
    ElMessage.error('启动浏览器失败：' + (error.message || '未知错误'))
  } finally {
    browserStarting.value = false
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

// 初始化
onMounted(async () => {
  // 加载保存的设置
  const savedSystemSettings = localStorage.getItem('systemSettings')
  if (savedSystemSettings) {
    Object.assign(systemSettings, JSON.parse(savedSystemSettings))
  }
  
  const savedPublishSettings = localStorage.getItem('publishSettings')
  if (savedPublishSettings) {
    Object.assign(publishSettings, JSON.parse(savedPublishSettings))
  }
  
  const savedScheduleSettings = localStorage.getItem('scheduleSettings')
  if (savedScheduleSettings) {
    Object.assign(scheduleSettings, JSON.parse(savedScheduleSettings))
  }
  
  const savedKeywordsSettings = localStorage.getItem('keywordsSettings')
  if (savedKeywordsSettings) {
    Object.assign(keywordsSettings, JSON.parse(savedKeywordsSettings))
  }
  
  // 检查连接状态
  await checkStatus()
})
</script>

<style scoped>
.settings {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.system-settings,
.publish-settings {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 20px;
  text-align: right;
}

.unit {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

.schedule-config {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 10px;
}

.keywords-section {
  margin-bottom: 20px;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  min-height: 40px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.keyword-tag {
  margin: 2px;
}

.keyword-input {
  max-width: 300px;
}

/* 连接状态样式 */
.connection-status {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.connection-status .status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.connection-status .status-item:last-child {
  margin-bottom: 0;
}

.connection-status .timestamp {
  color: #666;
  font-size: 12px;
}

.connection-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.connection-actions .el-button {
  flex: 1;
  min-width: 120px;
}
</style>
