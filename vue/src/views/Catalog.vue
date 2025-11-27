<template>
  <div class="catalog-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card">
      <!-- ISBN自动编目 -->
      <el-tab-pane label="ISBN自动编目" name="isbn">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>ISBN自动获取编目数据</span>
                <el-button type="success" size="small" @click="clearIsbnForm">清空</el-button>
              </div>
            </template>
            
            <el-form :model="isbnForm" label-width="100px" style="max-width: 600px">
              <el-form-item label="ISBN">
                <el-input v-model="isbnForm.isbn" placeholder="请输入ISBN" clearable @keyup.enter="fetchMarcData" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchMarcData">获取MARC数据</el-button>
                <el-button type="info" @click="showBatchIsbnDialog = true">批量编目</el-button>
              </el-form-item>
            </el-form>
            
            <div v-if="marcData" class="marc-data-container">
              <h4>MARC数据预览</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="图书名称">{{ marcData.bookName }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ marcData.author }}</el-descriptions-item>
                <el-descriptions-item label="出版社">{{ marcData.publisher }}</el-descriptions-item>
                <el-descriptions-item label="出版时间">{{ marcData.publishDate }}</el-descriptions-item>
                <el-descriptions-item label="ISBN">{{ marcData.isbn }}</el-descriptions-item>
                <el-descriptions-item label="分类号">{{ marcData.classNumber }}</el-descriptions-item>
                <el-descriptions-item label="主题词">{{ marcData.subject }}</el-descriptions-item>
                <el-descriptions-item label="定价">{{ marcData.price }} 元</el-descriptions-item>
              </el-descriptions>
              <div style="margin-top: 20px">
                <el-button type="primary" @click="saveCatalogData">保存编目数据</el-button>
                <el-button type="info" @click="editCatalogData">编辑后保存</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 手动编目 -->
      <el-tab-pane label="手动编目" name="manual">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>手动编目</span>
                <el-button type="success" size="small" @click="resetManualForm">重置</el-button>
              </div>
            </template>
            
            <el-form :model="manualForm" label-width="120px" style="max-width: 800px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="图书名称" required>
                    <el-input v-model="manualForm.bookName" placeholder="请输入图书名称" />
                  </el-form-item>
                  <el-form-item label="作者" required>
                    <el-input v-model="manualForm.author" placeholder="请输入作者" />
                  </el-form-item>
                  <el-form-item label="出版社" required>
                    <el-input v-model="manualForm.publisher" placeholder="请输入出版社" />
                  </el-form-item>
                  <el-form-item label="出版时间">
                    <el-date-picker v-model="manualForm.publishDate" type="date" placeholder="选择出版时间" format="YYYY-MM-DD" />
                  </el-form-item>
                  <el-form-item label="ISBN" required>
                    <el-input v-model="manualForm.isbn" placeholder="请输入ISBN" />
                  </el-form-item>
                  <el-form-item label="定价">
                    <el-input-number v-model="manualForm.price" :min="0" :step="0.1" placeholder="请输入定价" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="分类号" required>
                    <el-input v-model="manualForm.classNumber" placeholder="请输入分类号" @input="suggestClassNumber" />
                    <div v-if="classSuggestions.length > 0" class="suggestion-list">
                      <div v-for="(item, index) in classSuggestions" :key="index" class="suggestion-item" @click="selectClassNumber(item)">
                        {{ item }}
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="索书号">
                    <el-input v-model="manualForm.callNumber" placeholder="自动生成" readonly />
                  </el-form-item>
                  <el-form-item label="主题词">
                    <el-input v-model="manualForm.subject" type="textarea" rows="2" placeholder="请输入主题词，多个用分号分隔" />
                  </el-form-item>
                  <el-form-item label="内容简介">
                    <el-input v-model="manualForm.description" type="textarea" rows="3" placeholder="请输入内容简介" />
                  </el-form-item>
                  <el-form-item label="OCR识别">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :on-change="handleOcrUpload"
                      accept="image/*"
                      :show-file-list="false"
                    >
                      <el-button type="info">上传图书封面识别</el-button>
                    </el-upload>
                  </el-form-item>
                  <el-form-item label="AI推荐分类号">
                    <el-button type="info" @click="recommendClassNumber">AI推荐</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" @click="saveManualCatalog">保存编目</el-button>
                <el-button @click="resetManualForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 编目数据管理 -->
      <el-tab-pane label="编目数据管理" name="manage">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>编目数据列表</span>
                <div>
                  <el-button type="primary" size="small" @click="refreshCatalogList">刷新</el-button>
                  <el-button type="warning" size="small" @click="batchEditCatalog">批量修改</el-button>
                  <el-button type="success" size="small" @click="batchPrintLabel">批量打印标签</el-button>
                </div>
              </div>
            </template>
            
            <el-input v-model="catalogQuery" placeholder="搜索图书名称、ISBN或作者" clearable style="margin-bottom: 15px" />
            
            <el-table :data="filteredCatalogList" stripe border @selection-change="handleCatalogSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="编目ID" width="100" sortable />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column prop="classNumber" label="分类号" width="120" />
              <el-table-column prop="callNumber" label="索书号" width="150" />
              <el-table-column prop="createTime" label="创建时间" width="180" sortable />
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-button type="primary" size="mini" @click="editCatalog(scope.row)">编辑</el-button>
                  <el-button type="danger" size="mini" @click="deleteCatalog(scope.row)">删除</el-button>
                  <el-button type="info" size="mini" @click="printLabel(scope.row)">打印标签</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="catalogPage.currentPage"
                v-model:page-size="catalogPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="catalogList.length"
                @size-change="handleCatalogSizeChange"
                @current-change="handleCatalogCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 批量ISBN编目对话框 -->
    <el-dialog v-model="showBatchIsbnDialog" title="批量ISBN编目" width="500px">
      <el-form :model="batchIsbnForm" label-width="80px">
        <el-form-item label="ISBN列表">
          <el-input v-model="batchIsbnForm.isbnList" type="textarea" rows="6" placeholder="请输入多个ISBN，每行一个" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchIsbnDialog = false">取消</el-button>
          <el-button type="primary" @click="batchFetchMarcData">开始批量编目</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编目编辑对话框 -->
    <el-dialog v-model="showEditDialog" :title="editDialogTitle" width="800px">
      <el-form :model="editForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图书名称" required>
              <el-input v-model="editForm.bookName" />
            </el-form-item>
            <el-form-item label="作者" required>
              <el-input v-model="editForm.author" />
            </el-form-item>
            <el-form-item label="出版社" required>
              <el-input v-model="editForm.publisher" />
            </el-form-item>
            <el-form-item label="出版时间">
              <el-date-picker v-model="editForm.publishDate" type="date" format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="ISBN" required>
              <el-input v-model="editForm.isbn" />
            </el-form-item>
            <el-form-item label="定价">
              <el-input-number v-model="editForm.price" :min="0" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类号" required>
              <el-input v-model="editForm.classNumber" @input="updateCallNumber" />
            </el-form-item>
            <el-form-item label="索书号">
              <el-input v-model="editForm.callNumber" readonly />
            </el-form-item>
            <el-form-item label="主题词">
              <el-input v-model="editForm.subject" type="textarea" rows="2" />
            </el-form-item>
            <el-form-item label="内容简介">
              <el-input v-model="editForm.description" type="textarea" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveEditCatalog">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import api from '../api'

export default {
  name: 'Catalog',
  data() {
    return {
      activeTab: 'isbn',
      
      // ISBN自动编目
      isbnForm: {
        isbn: ''
      },
      marcData: null,
      showBatchIsbnDialog: false,
      batchIsbnForm: {
        isbnList: ''
      },
      
      // 手动编目
      manualForm: {
        bookName: '',
        author: '',
        publisher: '',
        publishDate: '',
        isbn: '',
        price: 0,
        classNumber: '',
        callNumber: '',
        subject: '',
        description: ''
      },
      classSuggestions: [],
      
      // 编目数据管理
      catalogList: [],
      catalogPage: {
        currentPage: 1,
        pageSize: 10
      },
      catalogQuery: '',
      selectedCatalogItems: [],
      
      // 编辑对话框
      showEditDialog: false,
      editDialogTitle: '',
      editForm: {}
    }
  },
  created() {
    this.refreshCatalogList()
  },
  computed: {
    filteredCatalogList() {
      if (!this.catalogQuery) {
        return this.catalogList
      }
      const query = this.catalogQuery.toLowerCase()
      return this.catalogList.filter(item => 
        item.bookName.toLowerCase().includes(query) ||
        item.isbn.includes(query) ||
        item.author.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    // ISBN自动编目
    fetchMarcData() {
      if (!this.isbnForm.isbn) {
        ElMessage.warning('请输入ISBN')
        return
      }
      
      // 模拟API调用，实际应调用国家图书馆MARC数据接口
      ElMessage.success('正在获取MARC数据...')
      setTimeout(() => {
        this.marcData = {
          bookName: 'Vue.js实战（第2版）',
          author: '梁灏',
          publisher: '人民邮电出版社',
          publishDate: '2020-07',
          isbn: this.isbnForm.isbn,
          classNumber: 'TP312.8',
          subject: 'Vue.js;前端开发;JavaScript框架',
          price: 89.00
        }
        ElMessage.success('MARC数据获取成功')
      }, 1000)
    },
    clearIsbnForm() {
      this.isbnForm.isbn = ''
      this.marcData = null
    },
    saveCatalogData() {
      if (!this.marcData) {
        ElMessage.warning('请先获取MARC数据')
        return
      }
      
      // 保存编目数据
      const catalogItem = {
        ...this.marcData,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        callNumber: this.generateCallNumber(this.marcData.classNumber)
      }
      
      this.catalogList.unshift(catalogItem)
      ElMessage.success('编目数据保存成功')
      this.marcData = null
      this.isbnForm.isbn = ''
    },
    editCatalogData() {
      if (!this.marcData) {
        ElMessage.warning('请先获取MARC数据')
        return
      }
      
      this.editDialogTitle = '编辑编目数据'
      this.editForm = {
        ...this.marcData,
        callNumber: this.generateCallNumber(this.marcData.classNumber)
      }
      this.showEditDialog = true
    },
    batchFetchMarcData() {
      if (!this.batchIsbnForm.isbnList) {
        ElMessage.warning('请输入ISBN列表')
        return
      }
      
      const isbnList = this.batchIsbnForm.isbnList.split('\n').filter(isbn => isbn.trim())
      if (isbnList.length === 0) {
        ElMessage.warning('请输入有效的ISBN列表')
        return
      }
      
      ElMessage.success(`开始批量编目，共${isbnList.length}条数据`)
      this.showBatchIsbnDialog = false
      
      // 模拟批量编目
      setTimeout(() => {
        ElMessage.success(`批量编目完成，成功${isbnList.length}条`)
        this.batchIsbnForm.isbnList = ''
        this.refreshCatalogList()
      }, 2000)
    },
    
    // 手动编目
    resetManualForm() {
      this.manualForm = {
        bookName: '',
        author: '',
        publisher: '',
        publishDate: '',
        isbn: '',
        price: 0,
        classNumber: '',
        callNumber: '',
        subject: '',
        description: ''
      }
      this.classSuggestions = []
    },
    suggestClassNumber() {
      if (!this.manualForm.classNumber) {
        this.classSuggestions = []
        return
      }
      
      // 模拟分类号联想
      const suggestions = [
        'TP312.8',
        'TP312.8 V92',
        'TP312.8 V',
        'TP312'
      ]
      
      this.classSuggestions = suggestions.filter(item => 
        item.includes(this.manualForm.classNumber)
      )
    },
    selectClassNumber(item) {
      this.manualForm.classNumber = item
      this.manualForm.callNumber = this.generateCallNumber(item)
      this.classSuggestions = []
    },
    generateCallNumber(classNumber) {
      // 简单的索书号生成逻辑，实际应遵循GB/T 12451-2023标准
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `${classNumber}/${random}`
    },
    updateCallNumber() {
      if (this.manualForm.classNumber) {
        this.manualForm.callNumber = this.generateCallNumber(this.manualForm.classNumber)
      }
    },
    handleOcrUpload(file) {
      // 模拟OCR识别
      ElMessage.info('OCR识别功能开发中')
    },
    recommendClassNumber() {
      // 模拟AI推荐分类号
      ElMessage.info('AI推荐分类号功能开发中')
      // 模拟推荐结果
      setTimeout(() => {
        this.manualForm.classNumber = 'TP312.8'
        this.manualForm.callNumber = this.generateCallNumber('TP312.8')
        ElMessage.success('AI推荐分类号完成')
      }, 1000)
    },
    saveManualCatalog() {
      // 验证表单
      if (!this.manualForm.bookName || !this.manualForm.author || !this.manualForm.publisher || !this.manualForm.isbn || !this.manualForm.classNumber) {
        ElMessage.warning('请填写必填字段')
        return
      }
      
      // 生成索书号
      if (!this.manualForm.callNumber) {
        this.manualForm.callNumber = this.generateCallNumber(this.manualForm.classNumber)
      }
      
      const catalogItem = {
        ...this.manualForm,
        id: Date.now(),
        createTime: new Date().toLocaleString()
      }
      
      this.catalogList.unshift(catalogItem)
      ElMessage.success('手动编目保存成功')
      this.resetManualForm()
    },
    
    // 编目数据管理
    refreshCatalogList() {
      // 模拟数据，实际应调用API
      this.catalogList = [
        {
          id: 1,
          bookName: 'Vue.js实战',
          author: '梁灏',
          publisher: '人民邮电出版社',
          publishDate: '2020-07',
          isbn: '9787115537558',
          price: 89.00,
          classNumber: 'TP312.8',
          callNumber: 'TP312.8/123',
          subject: 'Vue.js;前端开发;JavaScript框架',
          description: '本书全面介绍Vue.js框架的核心概念和实战技巧',
          createTime: '2025-11-20 14:30:00'
        },
        {
          id: 2,
          bookName: 'Java核心技术',
          author: '凯S.霍斯特曼',
          publisher: '机械工业出版社',
          publishDate: '2019-09',
          isbn: '9787111641247',
          price: 199.00,
          classNumber: 'TP312.8',
          callNumber: 'TP312.8/456',
          subject: 'Java;程序设计;面向对象',
          description: 'Java领域的经典著作，全面覆盖Java核心技术',
          createTime: '2025-11-21 09:15:00'
        }
      ]
    },
    handleCatalogSizeChange(size) {
      this.catalogPage.pageSize = size
    },
    handleCatalogCurrentChange(current) {
      this.catalogPage.currentPage = current
    },
    handleCatalogSelectionChange(val) {
      this.selectedCatalogItems = val
    },
    editCatalog(row) {
      this.editDialogTitle = '编辑编目数据'
      this.editForm = { ...row }
      this.showEditDialog = true
    },
    deleteCatalog(row) {
      const index = this.catalogList.indexOf(row)
      if (index > -1) {
        this.catalogList.splice(index, 1)
        ElMessage.success('编目数据已删除')
      }
    },
    printLabel(row) {
      ElMessage.info('打印标签功能开发中')
    },
    batchEditCatalog() {
      if (this.selectedCatalogItems.length === 0) {
        ElMessage.warning('请选择要修改的编目数据')
        return
      }
      ElMessage.info('批量修改功能开发中')
    },
    batchPrintLabel() {
      if (this.selectedCatalogItems.length === 0) {
        ElMessage.warning('请选择要打印标签的编目数据')
        return
      }
      ElMessage.info('批量打印标签功能开发中')
    },
    saveEditCatalog() {
      // 验证表单
      if (!this.editForm.bookName || !this.editForm.author || !this.editForm.publisher || !this.editForm.isbn || !this.editForm.classNumber) {
        ElMessage.warning('请填写必填字段')
        return
      }
      
      // 更新编目数据
      const index = this.catalogList.findIndex(item => item.id === this.editForm.id)
      if (index > -1) {
        this.catalogList[index] = { ...this.editForm }
        ElMessage.success('编目数据更新成功')
        this.showEditDialog = false
      }
    }
  }
}
</script>

<style scoped>
.catalog-container {
  height: 100%;
  overflow: hidden;
}

.tab-content {
  height: calc(100% - 40px);
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.marc-data-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.marc-data-container h4 {
  margin-bottom: 15px;
}

.suggestion-list {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: -1px;
  background-color: #fff;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>