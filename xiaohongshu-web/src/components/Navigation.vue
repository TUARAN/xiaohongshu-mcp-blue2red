<template>
  <el-menu
    :default-active="activeIndex"
    class="navigation"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item index="/news">
      <el-icon><Bell /></el-icon>
      <span>蓝点网资讯</span>
    </el-menu-item>
    
    <el-menu-item index="/search">
      <el-icon><Search /></el-icon>
      <span>AI搜索</span>
    </el-menu-item>
    
    <el-menu-item index="/settings">
      <el-icon><Setting /></el-icon>
      <span>设置</span>
    </el-menu-item>
    
    <el-menu-item index="/test">
      <el-icon><Tools /></el-icon>
      <span>系统测试</span>
    </el-menu-item>
    
    <div class="nav-actions">
      <el-button type="primary" @click="refreshStatus">
        <el-icon><Refresh /></el-icon>
        刷新状态
      </el-button>
    </div>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Bell,
  Setting, 
  Tools, 
  Refresh 
} from '@element-plus/icons-vue'
import { checkServerStatus, checkLoginStatus } from '../api/mcp'

const router = useRouter()
const route = useRoute()
const activeIndex = ref('/news')

const handleSelect = (key: string) => {
  router.push(key)
}

const refreshStatus = async () => {
  try {
    const serverStatus = await checkServerStatus()
    const loginStatus = await checkLoginStatus()
    
    if (serverStatus && loginStatus) {
      ElMessage.success('系统状态正常')
    } else if (!serverStatus) {
      ElMessage.error('MCP服务器未运行')
    } else if (!loginStatus) {
      ElMessage.warning('请先登录小红书账号')
    }
  } catch (error) {
    ElMessage.error('状态检查失败')
  }
}

onMounted(() => {
  activeIndex.value = route.path
})
</script>

<style scoped>
.navigation {
  border-bottom: none;
  padding: 0 20px;
  background: #ffffff;
  height: 60px;
  line-height: 60px;
}

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.navigation .el-menu-item {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 60px;
  line-height: 60px;
  font-size: 14px;
  font-weight: 500;
  padding: 0 20px;
}

.navigation .el-menu-item:hover {
  background-color: #f0f9ff;
  color: #409eff;
}

.navigation .el-menu-item.is-active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.navigation .el-menu-item .el-icon {
  font-size: 16px;
}

.navigation .el-menu-item span {
  margin-left: 5px;
}

/* 响应式导航 */
@media (max-width: 768px) {
  .navigation {
    padding: 0 10px;
    height: 50px;
    line-height: 50px;
  }
  
  .navigation .el-menu-item {
    font-size: 12px;
    height: 50px;
    line-height: 50px;
    padding: 0 15px;
  }
  
  .navigation .el-menu-item .el-icon {
    font-size: 14px;
  }
}
</style>
