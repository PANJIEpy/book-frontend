<template>
  <div class="search-container">
    <h2>图书搜索</h2>
    
    <!-- 搜索条件 -->
    <el-card shadow="hover" class="search-card">
      <el-form :model="searchForm" ref="searchForm" label-width="100px" inline>
        <el-form-item label="图书名称">
          <el-input v-model="searchForm.bookName" placeholder="请输入图书名称" clearable></el-input>
        </el-form-item>
        
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" clearable></el-input>
        </el-form-item>
        
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入ISBN" clearable></el-input>
        </el-form-item>
        
        <el-form-item label="出版社">
          <el-input v-model="searchForm.publisher" placeholder="请输入出版社" clearable></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 搜索历史 -->
      <div class="search-history" v-if="searchHistory.length > 0">
        <span class="label">搜索历史：</span>
        <el-tag
          v-for="(keyword, index) in searchHistory"
          :key="index"
          size="small"
          closable
          @click="handleHistorySearch(keyword)"
          @close="handleDeleteHistory(index)"
        >
          {{ keyword }}
        </el-tag>
      </div>
    </el-card>
    
    <!-- 搜索结果 -->
    <el-card shadow="hover" class="result-card">
      <template #header>
        <div class="card-header">
          <h3>搜索结果</h3>
          <span class="result-count">共找到 {{ searchResults.length }} 条记录</span>
        </div>
      </template>
      
      <div class="result-list">
        <div class="result-item" v-for="book in searchResults" :key="book.id" @click="showBookDetail(book)">
          <div class="book-cover">
            <img :src="book.coverUrl || defaultCover" alt="图书封面">
          </div>
          <div class="book-info">
            <h4>{{ book.bookName }}</h4>
            <p class="author">{{ book.author }}</p>
            <p class="publisher">{{ book.publisher }}</p>
            <div class="book-meta">
              <span class="isbn">ISBN: {{ book.isbn }}</span>
              <span class="call-number">索书号: {{ book.callNumber }}</span>
            </div>
            <div class="book-status">
              <el-tag :type="book.availableCount > 0 ? 'success' : 'warning'">
                {{ book.availableCount > 0 ? `可借: ${book.availableCount} 本` : '已借完' }}
              </el-tag>
              <el-tag type="info">
                总馆藏: {{ book.totalCount }} 本
              </el-tag>
            </div>
            <div class="book-actions">
              <el-button type="primary" size="small" @click.stop="handleBorrow(book)" :disabled="book.availableCount <= 0">
                立即借阅
              </el-button>
              <el-button type="success" size="small" @click.stop="handleReservation(book)" :disabled="book.availableCount > 0">
                预约
              </el-button>
              <el-button type="info" size="small" @click.stop="handleCollection(book)">
                收藏
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="searchResults.length > 0">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchTotal"
          :page-size="searchPageSize"
          :current-page="searchCurrentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 图书详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="图书详情" width="800px">
      <div class="book-detail">
        <div class="detail-left">
          <div class="detail-cover">
            <img :src="currentBook.coverUrl || defaultCover" alt="图书封面">
          </div>
          <div class="detail-actions">
            <el-button type="primary" size="large" @click="handleBorrow(currentBook)" :disabled="currentBook.availableCount <= 0">
              立即借阅
            </el-button>
            <el-button type="success" size="large" @click="handleReservation(currentBook)" :disabled="currentBook.availableCount > 0">
              预约
            </el-button>
            <el-button type="info" size="large" @click="handleCollection(currentBook)">
              收藏
            </el-button>
          </div>
        </div>
        
        <div class="detail-right">
          <h3>{{ currentBook.bookName }}</h3>
          <p class="detail-author">{{ currentBook.author }}</p>
          
          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">ISBN:</span>
              <span class="meta-value">{{ currentBook.isbn }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">出版社:</span>
              <span class="meta-value">{{ currentBook.publisher }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">出版时间:</span>
              <span class="meta-value">{{ currentBook.publishDate }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">分类号:</span>
              <span class="meta-value">{{ currentBook.classification }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">索书号:</span>
              <span class="meta-value">{{ currentBook.callNumber }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">定价:</span>
              <span class="meta-value">{{ currentBook.price }} 元</span>
            </div>
          </div>
          
          <div class="detail-status">
            <h4>馆藏状态</h4>
            <el-table :data="currentBook.inventoryList" style="width: 100%" size="small">
              <el-table-column prop="location" label="馆藏位置"></el-table-column>
              <el-table-column prop="callNumber" label="索书号"></el-table-column>
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '可借' ? 'success' : 'warning'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div class="detail-rules">
            <h4>借阅规则</h4>
            <ul>
              <li>借阅期限：30天</li>
              <li>续借次数：2次</li>
              <li>续借期限：每次15天</li>
              <li>逾期罚款：0.5元/天，上限20元</li>
              <li>跨校区借阅：支持</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 相关推荐 -->
      <div class="related-books" v-if="relatedBooks.length > 0">
        <h4>相关推荐</h4>
        <div class="related-list">
          <div class="related-item" v-for="book in relatedBooks" :key="book.id" @click="showBookDetail(book)">
            <div class="related-cover">
              <img :src="book.coverUrl || defaultCover" alt="图书封面">
            </div>
            <div class="related-info">
              <h5>{{ book.bookName }}</h5>
              <p>{{ book.author }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'Search',
  data() {
    return {
      searchForm: {
        bookName: '',
        author: '',
        isbn: '',
        publisher: ''
      },
      searchHistory: ['Vue.js', 'JavaScript', 'Python', 'Java', '数据结构'],
      searchResults: [
        { 
          id: 1, 
          bookName: 'Vue.js实战', 
          author: '梁灏', 
          publisher: '人民邮电出版社',
          isbn: '9787115428028',
          classification: 'TP312',
          callNumber: 'TP312/V81',
          price: 59.00,
          coverUrl: '',
          availableCount: 3,
          totalCount: 5,
          inventoryList: [
            { location: '一楼社科区', callNumber: 'TP312/V81', status: '可借' },
            { location: '一楼社科区', callNumber: 'TP312/V81', status: '可借' },
            { location: '一楼社科区', callNumber: 'TP312/V81', status: '可借' },
            { location: '一楼社科区', callNumber: 'TP312/V81', status: '在借' },
            { location: '一楼社科区', callNumber: 'TP312/V81', status: '在借' }
          ]
        },
        { 
          id: 2, 
          bookName: 'JavaScript高级程序设计', 
          author: 'Nicholas C. Zakas', 
          publisher: '人民邮电出版社',
          isbn: '9787115407641',
          classification: 'TP312',
          callNumber: 'TP312/J33',
          price: 99.00,
          coverUrl: '',
          availableCount: 2,
          totalCount: 4,
          inventoryList: [
            { location: '一楼社科区', callNumber: 'TP312/J33', status: '可借' },
            { location: '一楼社科区', callNumber: 'TP312/J33', status: '可借' },
            { location: '一楼社科区', callNumber: 'TP312/J33', status: '在借' },
            { location: '一楼社科区', callNumber: 'TP312/J33', status: '在借' }
          ]
        }
      ],
      searchTotal: 2,
      searchCurrentPage: 1,
      searchPageSize: 10,
      defaultCover: '',
      
      // 图书详情
      showDetailDialog: false,
      currentBook: {},
      relatedBooks: [
        { id: 3, bookName: 'Python编程：从入门到实践', author: 'Eric Matthes', coverUrl: '' },
        { id: 4, bookName: 'Java核心技术', author: 'Cay S. Horstmann', coverUrl: '' }
      ]
    };
  },
  created() {
    // 从URL参数获取搜索关键词
    if (this.$route.query.keyword) {
      this.searchForm.bookName = this.$route.query.keyword;
      this.handleSearch();
    }
  },
  methods: {
    // 搜索
    handleSearch() {
      // 保存搜索历史
      if (this.searchForm.bookName && !this.searchHistory.includes(this.searchForm.bookName)) {
        this.searchHistory.unshift(this.searchForm.bookName);
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop();
        }
      }
      // 模拟搜索
      ElMessage.success('搜索成功');
    },
    
    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        bookName: '',
        author: '',
        isbn: '',
        publisher: ''
      };
    },
    
    // 搜索历史点击
    handleHistorySearch(keyword) {
      this.searchForm.bookName = keyword;
      this.handleSearch();
    },
    
    // 删除搜索历史
    handleDeleteHistory(index) {
      this.searchHistory.splice(index, 1);
    },
    
    // 显示图书详情
    showBookDetail(book) {
      this.currentBook = { ...book };
      this.showDetailDialog = true;
    },
    
    // 立即借阅
    handleBorrow(book) {
      ElMessage.success('借阅申请已提交，正在审核中');
    },
    
    // 预约
    handleReservation(book) {
      ElMessage.success('预约成功');
    },
    
    // 收藏
    handleCollection(book) {
      ElMessage.success('收藏成功');
    },
    
    // 分页
    handleSizeChange(size) {
      this.searchPageSize = size;
    },
    handleCurrentChange(current) {
      this.searchCurrentPage = current;
    }
  }
};
</script>

<style scoped>
.search-container {
  width: 100%;
}

.search-card {
  margin-bottom: 20px;
}

.search-history {
  margin-top: 15px;
}

.search-history .label {
  margin-right: 10px;
  color: #606266;
}

.result-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-count {
  color: #409EFF;
  font-size: 14px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.book-cover {
  width: 120px;
  height: 160px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  flex: 1;
}

.book-info h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.book-info .author {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #606266;
}

.book-info .publisher {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.book-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.book-status {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.book-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 图书详情 */
.book-detail {
  display: flex;
  gap: 30px;
}

.detail-left {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-cover {
  width: 200px;
  height: 280px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-right {
  flex: 1;
}

.detail-right h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.detail-author {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #606266;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  gap: 10px;
}

.meta-label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
}

.detail-status {
  margin-bottom: 20px;
}

.detail-status h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-rules {
  margin-bottom: 20px;
}

.detail-rules h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-rules ul {
  margin: 0;
  padding-left: 20px;
}

.detail-rules li {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

/* 相关推荐 */
.related-books {
  margin-top: 30px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.related-books h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.related-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.related-item {
  width: 120px;
  cursor: pointer;
  transition: transform 0.3s;
}

.related-item:hover {
  transform: translateY(-5px);
}

.related-cover {
  width: 120px;
  height: 160px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-info p {
  margin: 0;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>