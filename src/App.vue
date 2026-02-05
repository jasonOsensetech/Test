<template>
  <div class="container">
    <h1>會員來源識別實驗</h1>

    <!-- 未完成流程狀態：顯示導向按鈕 -->
    <div v-if="!isFlowCompleted" class="initial-state">
      <div class="status-card pending">
        <h2>尚未完成識別流程</h2>
        <p>請點擊下方按鈕進行來源識別</p>
        <button @click="redirectToDetection" class="redirect-btn">
          前往識別頁面
        </button>
      </div>
    </div>

    <!-- 已完成流程狀態 -->
    <div v-else class="completed-state">
      <div class="status-card success">
        <h2>識別流程已完成</h2>

        <div class="info-grid">
          <div class="info-item">
            <label>會員序號 (memberSeq)</label>
            <span class="value">{{ memberSeq }}</span>
          </div>

          <div class="info-item">
            <label>來源平台 (from)</label>
            <span class="value" :class="sourceClass">{{ sourceDisplay }}</span>
          </div>
        </div>

        <!-- 根據來源顯示不同畫面 -->
        <div class="source-specific-content">
          <div v-if="from === 'line'" class="line-content">
            <div class="platform-icon line">LINE</div>
            <p>您是透過 <strong>LINE App Browser</strong> 進入</p>
            <p class="hint">可在此顯示 LINE 專屬功能或內容</p>
          </div>

          <div v-else-if="from === 'fb'" class="fb-content">
            <div class="platform-icon fb">FB</div>
            <p>您是透過 <strong>Facebook App Browser</strong> 進入</p>
            <p class="hint">可在此顯示 FB 專屬功能或內容</p>
          </div>

          <div v-else-if="from === 'ig'" class="ig-content">
            <div class="platform-icon ig">IG</div>
            <p>您是透過 <strong>Instagram App Browser</strong> 進入</p>
            <p class="hint">可在此顯示 IG 專屬功能或內容</p>
          </div>

          <div v-else class="default-content">
            <div class="platform-icon default">WEB</div>
            <p>您是透過 <strong>一般瀏覽器</strong> 進入</p>
            <p class="hint">顯示預設畫面內容</p>
          </div>
        </div>

        <!-- API 呼叫狀態 -->
        <div class="api-status">
          <h3>初始化 API 狀態</h3>
          <div v-if="apiLoading" class="loading">呼叫中...</div>
          <div v-else-if="apiResult" class="api-result success">
            <p>API 呼叫成功</p>
            <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
          </div>
          <div v-else-if="apiError" class="api-result error">
            <p>API 呼叫失敗</p>
            <pre>{{ apiError }}</pre>
          </div>
        </div>

        <!-- 重設按鈕（測試用） -->
        <button @click="resetFlow" class="reset-btn">
          重設流程（測試用）
        </button>
      </div>
    </div>

    <!-- Debug 資訊 -->
    <div class="debug-panel">
      <h3>Debug 資訊</h3>
      <div class="debug-content">
        <p><strong>目前 URL:</strong> {{ currentUrl }}</p>
        <p><strong>Query String:</strong></p>
        <pre>{{ queryParams }}</pre>
        <p><strong>isFlowCompleted:</strong> {{ isFlowCompleted }}</p>
        <p><strong>memberSeq:</strong> {{ memberSeq || '(無)' }}</p>
        <p><strong>from:</strong> {{ from || '(無)' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 狀態
const memberSeq = ref(null)
const from = ref(null)
const apiLoading = ref(false)
const apiResult = ref(null)
const apiError = ref(null)

// Redirect HTML 頁面的 URL（請依實際部署調整）
const REDIRECT_HTML_URL = '/redirect.html'

// 計算屬性
const isFlowCompleted = computed(() => {
  return !!memberSeq.value
})

const currentUrl = computed(() => {
  return window.location.href
})

const queryParams = computed(() => {
  const params = new URLSearchParams(window.location.search)
  const obj = {}
  for (const [key, value] of params) {
    obj[key] = value
  }
  return JSON.stringify(obj, null, 2)
})

const sourceDisplay = computed(() => {
  switch (from.value) {
    case 'line':
      return 'LINE App Browser'
    case 'fb':
      return 'Facebook App Browser'
    case 'ig':
      return 'Instagram App Browser'
    default:
      return from.value || '一般瀏覽器'
  }
})

const sourceClass = computed(() => {
  return from.value || 'default'
})

// 方法
function parseQueryString() {
  const params = new URLSearchParams(window.location.search)
  memberSeq.value = params.get('memberSeq')
  from.value = params.get('from')
}

function redirectToDetection() {
  // 導向 redirect HTML 頁面
  // 可以帶入當前頁面 URL 作為 callback
  const callbackUrl = encodeURIComponent(window.location.origin + window.location.pathname)
  window.location.href = `${REDIRECT_HTML_URL}?callback=${callbackUrl}`
}

async function callInitApi() {
  if (!memberSeq.value) return

  apiLoading.value = true
  apiError.value = null
  apiResult.value = null

  try {
    // 模擬 API 呼叫（實際使用時請替換為真實 API）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模擬成功回應
    apiResult.value = {
      success: true,
      message: '初始化成功',
      data: {
        memberSeq: memberSeq.value,
        from: from.value,
        timestamp: new Date().toISOString()
      }
    }

    /* 實際 API 呼叫範例：
    const response = await fetch('/api/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberSeq: memberSeq.value,
        from: from.value
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    apiResult.value = await response.json()
    */
  } catch (error) {
    apiError.value = error.message || '未知錯誤'
  } finally {
    apiLoading.value = false
  }
}

function resetFlow() {
  // 清除 URL 參數並重新載入
  window.location.href = window.location.origin + window.location.pathname
}

// 生命週期
onMounted(() => {
  // 解析 URL query string
  parseQueryString()

  // 若 memberSeq 存在，呼叫初始化 API
  if (memberSeq.value) {
    callInitApi()
  }
})
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.status-card.pending {
  border-left: 4px solid #f0ad4e;
}

.status-card.success {
  border-left: 4px solid #5cb85c;
}

.status-card h2 {
  margin: 0 0 16px 0;
  color: #333;
}

.redirect-btn {
  display: block;
  width: 100%;
  padding: 16px 24px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.redirect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.redirect-btn:active {
  transform: translateY(0);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-item .value.line {
  color: #00B900;
}

.info-item .value.fb {
  color: #1877F2;
}

.info-item .value.ig {
  color: #E4405F;
}

.source-specific-content {
  text-align: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.platform-icon {
  display: inline-block;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.platform-icon.line {
  background: #00B900;
}

.platform-icon.fb {
  background: #1877F2;
}

.platform-icon.ig {
  background: linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%);
}

.platform-icon.default {
  background: #6c757d;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.api-status {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.api-status h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.loading {
  color: #666;
  font-style: italic;
}

.api-result {
  padding: 12px;
  border-radius: 8px;
}

.api-result.success {
  background: #d4edda;
  color: #155724;
}

.api-result.error {
  background: #f8d7da;
  color: #721c24;
}

.api-result pre {
  margin: 8px 0 0 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.reset-btn {
  display: block;
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  font-size: 14px;
  color: #666;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #e9ecef;
}

.debug-panel {
  margin-top: 40px;
  padding: 16px;
  background: #2d2d2d;
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
}

.debug-panel h3 {
  margin: 0 0 12px 0;
  color: #ffc107;
}

.debug-content {
  font-family: 'Monaco', 'Consolas', monospace;
}

.debug-content p {
  margin: 4px 0;
}

.debug-content pre {
  background: #1a1a1a;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
  overflow-x: auto;
}
</style>
