import axios from 'axios'

const MCP_URL = 'http://localhost:18060/mcp'

// MCP请求封装
async function mcpRequest(method: string, params?: any) {
  try {
    const response = await axios.post(MCP_URL, {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    }, {
      timeout: 30000
    })
    return response.data
  } catch (error) {
    console.error('MCP请求失败:', error)
    throw error
  }
}

// 检查服务器状态
export async function checkServerStatus(): Promise<boolean> {
  try {
    // MCP服务器只接受POST请求，GET请求会返回400
    // 我们通过发送一个简单的POST请求来检查服务状态
    const response = await axios.post(MCP_URL, {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {},
      id: 1
    }, { timeout: 5000 })
    
    return response.status === 200
  } catch (error: any) {
    // 如果返回400，说明服务器在运行但请求格式不对，这也是正常的
    if (error.response && error.response.status === 400) {
      return true
    }
    
    // 网络连接错误
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('MCP服务器未运行，请先启动服务器')
      return false
    }
    
    console.error('MCP服务检查失败:', error)
    return false
  }
}

// 检查登录状态
export async function checkLoginStatus(): Promise<boolean> {
  try {
    const result = await mcpRequest('tools/call', {
      name: 'check_login_status',
      arguments: {}
    })
    
    if (result.result && result.result.content) {
      const content = result.result.content[0].text
      return content.includes('IsLoggedIn:true')
    }
    return false
  } catch {
    return false
  }
}

// 发布内容
export async function publishContent(data: {
  title: string
  content: string
  images: string[]
  tags: string[]
}) {
  const result = await mcpRequest('tools/call', {
    name: 'publish_content',
    arguments: data
  })
  return result
}

// 搜索内容
export async function searchFeeds(keyword: string) {
  const result = await mcpRequest('tools/call', {
    name: 'search_feeds',
    arguments: { keyword }
  })
  return result
}

// 获取推荐列表
export async function getFeeds() {
  const result = await mcpRequest('tools/call', {
    name: 'list_feeds',
    arguments: {}
  })
  return result
}

// 获取帖子详情
export async function getFeedDetail(feedId: string, xsecToken: string) {
  const result = await mcpRequest('tools/call', {
    name: 'get_feed_detail',
    arguments: { feed_id: feedId, xsec_token: xsecToken }
  })
  return result
}

// 发表评论
export async function postComment(feedId: string, xsecToken: string, content: string) {
  const result = await mcpRequest('tools/call', {
    name: 'post_comment_to_feed',
    arguments: { feed_id: feedId, xsec_token: xsecToken, content }
  })
  return result
}

// 启动MCP服务器
export async function startMCPServer() {
  try {
    const result = await mcpRequest('tools/call', {
      name: 'start_server',
      arguments: {}
    })
    return result
  } catch (error) {
    console.error('启动MCP服务器失败:', error)
    throw error
  }
}

// 启动浏览器并登录
export async function startBrowserAndLogin() {
  try {
    const result = await mcpRequest('tools/call', {
      name: 'start_browser_and_login',
      arguments: {}
    })
    return result
  } catch (error) {
    console.error('启动浏览器登录失败:', error)
    throw error
  }
}

// 一键连接和登录
export async function autoConnectAndLogin() {
  try {
    // 首先检查服务器状态
    const serverStatus = await checkServerStatus()
    if (!serverStatus) {
      // 如果服务器未运行，尝试启动
      await startMCPServer()
    }
    
    // 检查登录状态
    const loginStatus = await checkLoginStatus()
    if (!loginStatus) {
      // 如果未登录，启动浏览器登录
      await startBrowserAndLogin()
    }
    
    return {
      serverConnected: true,
      loginStatus: await checkLoginStatus()
    }
  } catch (error) {
    console.error('自动连接登录失败:', error)
    throw error
  }
}

// 获取系统状态
export async function getSystemStatus() {
  try {
    const serverStatus = await checkServerStatus()
    const loginStatus = await checkLoginStatus()
    
    return {
      serverStatus,
      loginStatus,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      serverStatus: false,
      loginStatus: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
