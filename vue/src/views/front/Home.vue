<template>
  <div class="home-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-box">
        <h2>欢迎使用图书馆管理系统</h2>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图书名称、作者、ISBN等"
          clearable
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" size="large" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
        <div class="hot-search">
          <span class="label">热门搜索：</span>
          <el-tag
            v-for="keyword in hotKeywords"
            :key="keyword"
            size="small"
            @click="handleHotSearch(keyword)"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 热门借阅 -->
      <el-card shadow="hover" class="content-card">
        <template #header>
          <div class="card-header">
            <h3>热门借阅图书</h3>
            <router-link to="/front/search" class="more-link">更多 ></router-link>
          </div>
        </template>
        <div class="book-list">
          <div class="book-item" v-for="book in hotBooks" :key="book.id">
            <div class="book-cover">
              <img :src="book.coverUrl || defaultCover" alt="图书封面">
            </div>
            <div class="book-info">
              <h4>{{ book.bookName }}</h4>
              <p class="author">{{ book.author }}</p>
              <div class="book-status">
                <el-tag :type="book.availableCount > 0 ? 'success' : 'warning'">
                  {{ book.availableCount > 0 ? '可借' : '已借完' }}
                </el-tag>
                <span class="borrow-count">借阅次数：{{ book.borrowCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 新书上架 -->
      <el-card shadow="hover" class="content-card">
        <template #header>
          <div class="card-header">
            <h3>新书上架</h3>
            <router-link to="/front/search" class="more-link">更多 ></router-link>
          </div>
        </template>
        <div class="book-list">
          <div class="book-item" v-for="book in newBooks" :key="book.id">
            <div class="book-cover">
              <img :src="book.coverUrl || defaultCover" alt="图书封面">
            </div>
            <div class="book-info">
              <h4>{{ book.bookName }}</h4>
              <p class="author">{{ book.author }}</p>
              <div class="book-status">
                <el-tag :type="book.availableCount > 0 ? 'success' : 'warning'">
                  {{ book.availableCount > 0 ? '可借' : '已借完' }}
                </el-tag>
                <span class="publish-date">上架时间：{{ book.publishDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 公告和活动 -->
      <div class="bottom-section">
        <!-- 图书馆公告 -->
        <el-card shadow="hover" class="content-card announcement-card">
          <template #header>
            <div class="card-header">
              <h3>图书馆公告</h3>
            </div>
          </template>
          <div class="announcement-list">
            <div class="announcement-item" v-for="announcement in announcements" :key="announcement.id">
              <h4>{{ announcement.title }}</h4>
              <p class="date">{{ announcement.createTime }}</p>
              <p class="content">{{ announcement.content }}</p>
            </div>
          </div>
        </el-card>
        
        <!-- 读书活动 -->
        <el-card shadow="hover" class="content-card activity-card">
          <template #header>
            <div class="card-header">
              <h3>读书活动</h3>
            </div>
          </template>
          <div class="activity-list">
            <div class="activity-item" v-for="activity in activities" :key="activity.id">
              <div class="activity-cover">
                <img :src="activity.coverUrl || defaultActivityCover" alt="活动封面">
              </div>
              <div class="activity-info">
                <h4>{{ activity.title }}</h4>
                <p class="time">{{ activity.startTime }} - {{ activity.endTime }}</p>
                <p class="location">{{ activity.location }}</p>
                <el-button type="primary" size="small">查看详情</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue';

export default {
  name: 'Home',
  components: {
    Search
  },
  data() {
    return {
      searchKeyword: '',
      hotKeywords: ['Vue.js', 'JavaScript', 'Python', 'Java', '数据结构'],
      hotBooks: [
        { id: 1, bookName: 'Vue.js实战', author: '梁灏', coverUrl: '', availableCount: 3, borrowCount: 120 },
        { id: 2, bookName: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', coverUrl: '', availableCount: 2, borrowCount: 98 },
        { id: 3, bookName: 'Python编程：从入门到实践', author: 'Eric Matthes', coverUrl: '', availableCount: 5, borrowCount: 156 },
        { id: 4, bookName: 'Java核心技术', author: 'Cay S. Horstmann', coverUrl: '', availableCount: 1, borrowCount: 89 },
        { id: 5, bookName: '数据结构与算法分析', author: 'Mark Allen Weiss', coverUrl: '', availableCount: 4, borrowCount: 112 }
      ],
      newBooks: [
        { id: 6, bookName: '深度学习', author: 'Ian Goodfellow', coverUrl: '', availableCount: 6, publishDate: '2025-11-20' },
        { id: 7, bookName: '机器学习', author: '周志华', coverUrl: '', availableCount: 4, publishDate: '2025-11-18' },
        { id: 8, bookName: '人工智能导论', author: 'Stuart Russell', coverUrl: '', availableCount: 3, publishDate: '2025-11-15' },
        { id: 9, bookName: '计算机网络', author: '谢希仁', coverUrl: '', availableCount: 5, publishDate: '2025-11-12' },
        { id: 10, bookName: '操作系统', author: '汤小丹', coverUrl: '', availableCount: 2, publishDate: '2025-11-10' }
      ],
      announcements: [
        { id: 1, title: '图书馆开放时间调整通知', content: '自2025年12月1日起，图书馆开放时间调整为8:00-22:00。', createTime: '2025-11-25' },
        { id: 2, title: '新书上架通知', content: '近期新增图书500册，欢迎广大师生前来借阅。', createTime: '2025-11-20' }
      ],
      activities: [
        { id: 1, title: '读书分享会', coverUrl: '', startTime: '2025-12-01', endTime: '2025-12-01', location: '图书馆报告厅' },
        { id: 2, title: '图书漂流活动', coverUrl: '', startTime: '2025-12-05', endTime: '2025-12-15', location: '图书馆大厅' }
      ],
      defaultCover: '',
      defaultActivityCover: ''
    };
  },
  methods: {
    handleSearch() {
      if (this.searchKeyword) {
        this.$router.push({ path: '/front/search', query: { keyword: this.searchKeyword } });
      }
    },
    handleHotSearch(keyword) {
      this.searchKeyword = keyword;
      this.handleSearch();
    },
    handleHotSearch(keyword) {
      this.searchKeyword = keyword;
      this.handleSearch();
    }
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
}

.search-section {
  background-color: #409EFF;
  padding: 60px 0;
  margin-bottom: 20px;
}

.search-box {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.search-box h2 {
  color: white;
  margin-bottom: 20px;
  font-size: 32px;
}

.hot-search {
  margin-top: 15px;
  text-align: left;
}

.hot-search .label {
  color: white;
  margin-right: 10px;
}

.hot-search .el-tag {
  margin-right: 10px;
  cursor: pointer;
}

.content-section {
  width: 100%;
}

.content-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.more-link {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
}

.book-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.book-item {
  width: calc(20% - 16px);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.3s;
}

.book-item:hover {
  transform: translateY(-5px);
}

.book-cover {
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info .author {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.book-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.book-status .borrow-count {
  font-size: 14px;
  color: #606266;
}

.bottom-section {
  display: flex;
  gap: 20px;
}

.announcement-card {
  width: 40%;
}

.activity-card {
  width: 60%;
}

.announcement-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-item h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.announcement-item .date {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.announcement-item .content {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: transform 0.3s;
}

.activity-item:hover {
  transform: translateX(5px);
}

.activity-cover {
  width: 120px;
  height: 80px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-info {
  flex: 1;
}

.activity-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.activity-info .time,
.activity-info .location {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}
</style>