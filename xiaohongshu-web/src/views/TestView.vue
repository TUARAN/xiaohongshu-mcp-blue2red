<template>
  <div class="test-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Tools /></el-icon>
          <span>系统测试</span>
        </div>
      </template>
      
      <div class="test-section">
        <h3>连接测试</h3>
        <el-button @click="testMCPConnection" :loading="testing">
          <el-icon><Connection /></el-icon>
          测试MCP连接
        </el-button>
        <el-button @click="testLoginStatus" :loading="testing">
          <el-icon><User /></el-icon>
          测试登录状态
        </el-button>
        <el-button @click="testPublish" :loading="testing">
          <el-icon><Edit /></el-icon>
          测试发布功能
        </el-button>
      </div>
      
      <div class="test-results" v-if="testResults.length > 0">
        <h3>测试结果</h3>
        <div v-for="(result, index) in testResults" :key="index" class="result-item">
          <el-tag :type="result.success ? 'success' : 'danger'">
            {{ result.success ? '成功' : '失败' }}
          </el-tag>
          <span class="result-text">{{ result.message }}</span>
          <span class="result-time">{{ result.time }}</span>
        </div>
      </div>
      
      <div class="debug-info" v-if="debugInfo">
        <h3>调试信息</h3>
        <el-input
          v-model="debugInfo"
          type="textarea"
          :rows="10"
          readonly
          placeholder="调试信息将显示在这里"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { checkServerStatus, checkLoginStatus, publishContent } from '../api/mcp'

const testing = ref(false)
const testResults = ref<Array<{
  success: boolean
  message: string
  time: string
}>>([])
const debugInfo = ref('')

const addTestResult = (success: boolean, message: string) => {
  testResults.value.unshift({
    success,
    message,
    time: new Date().toLocaleTimeString()
  })
}

const testMCPConnection = async () => {
  testing.value = true
  try {
    const result = await checkServerStatus()
    if (result) {
      addTestResult(true, 'MCP服务连接正常')
      ElMessage.success('MCP服务连接正常')
    } else {
      addTestResult(false, 'MCP服务连接失败')
      ElMessage.error('MCP服务连接失败')
    }
  } catch (error) {
    addTestResult(false, `MCP服务连接错误: ${error}`)
    ElMessage.error('MCP服务连接错误')
    debugInfo.value = JSON.stringify(error, null, 2)
  } finally {
    testing.value = false
  }
}

const testLoginStatus = async () => {
  testing.value = true
  try {
    const result = await checkLoginStatus()
    if (result) {
      addTestResult(true, '登录状态正常')
      ElMessage.success('登录状态正常')
    } else {
      addTestResult(false, '未登录或登录状态异常')
      ElMessage.warning('未登录或登录状态异常')
    }
  } catch (error) {
    addTestResult(false, `登录状态检查错误: ${error}`)
    ElMessage.error('登录状态检查错误')
    debugInfo.value = JSON.stringify(error, null, 2)
  } finally {
    testing.value = false
  }
}

const testPublish = async () => {
  testing.value = true
  try {
    const testData = {
      title: '测试发布',
      content: '这是一个测试发布内容',
      images: ['https://picsum.photos/800/600'],
      tags: ['测试', 'AI']
    }
    
    const result = await publishContent(testData)
    if (result.result) {
      addTestResult(true, '发布功能正常')
      ElMessage.success('发布功能正常')
    } else {
      addTestResult(false, '发布功能异常')
      ElMessage.error('发布功能异常')
    }
  } catch (error) {
    addTestResult(false, `发布功能错误: ${error}`)
    ElMessage.error('发布功能错误')
    debugInfo.value = JSON.stringify(error, null, 2)
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.test-section {
  margin-bottom: 30px;
}

.test-section h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.test-section .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.test-results {
  margin-bottom: 30px;
}

.test-results h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.result-text {
  flex: 1;
  font-size: 14px;
}

.result-time {
  font-size: 12px;
  color: #666;
}

.debug-info h3 {
  margin-bottom: 15px;
  color: #409eff;
}
</style>
