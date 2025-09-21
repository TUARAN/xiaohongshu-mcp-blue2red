<template>
  <div id="app">
    <el-container>
      <el-header class="app-header">
        <div class="header">
          <h1>🚀 蓝2红（技术咨询自动发布小红书系统）</h1>
          <div class="status">
            <el-tag :type="serverStatus ? 'success' : 'danger'">
              {{ serverStatus ? 'MCP服务正常' : 'MCP服务异常' }}
            </el-tag>
            <el-tag :type="loginStatus ? 'success' : 'warning'">
              {{ loginStatus ? '已登录' : '未登录' }}
            </el-tag>
          </div>
        </div>
      </el-header>
      
      <div class="navigation-container">
        <Navigation />
      </div>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { checkServerStatus, checkLoginStatus } from './api/mcp'
import Navigation from './components/Navigation.vue'

const serverStatus = ref(false)
const loginStatus = ref(false)

onMounted(async () => {
  // 检查服务状态
  serverStatus.value = await checkServerStatus()
  loginStatus.value = await checkLoginStatus()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header h1 {
  margin: 0;
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
}

.status {
  display: flex;
  gap: 10px;
}

#app {
  height: 100vh;
  width: 100vw;
}

.el-container {
  height: 100%;
  width: 100%;
}

.app-header {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 60px !important;
  line-height: 60px;
}

.navigation-container {
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-main {
  padding: 0;
  background: #f5f7fa;
  overflow-y: auto;
  min-height: calc(100vh - 120px);
}
</style>