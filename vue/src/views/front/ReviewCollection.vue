<template>
  <div class="review-collection-container">
    <div class="header">
      <h2>书评与收藏</h2>
    </div>
    
    <el-tabs v-model="activeTab" type="card">
      <!-- 我的收藏 -->
      <el-tab-pane label="我的收藏" name="collections">
        <div class="collection-section">
          <div class="filter-bar">
            <el-input
              v-model="collectionSearch"
              placeholder="搜索收藏的图书"
              prefix-icon="el-icon-search"
              style="width: 300px;"
            />
            <el-select v-model="collectionStatus" placeholder="筛选状态" style="margin-left: 20px;">
              <el-option label="全部" value="" />
              <el-option label="可借" value="available" />
              <el-option label="已借出" value="borrowed" />
              <el-option label="下架" value="unavailable" />
            </el-select>
          </div>
          
          <div class="collection-list">
            <el-card
              v-for="book in filteredCollections"
              :key="book.id"
              class="collection-item"
              shadow="hover"
            >
              <div class="book-info">
                <div class="book-cover" :style="{ backgroundImage: `url(${book.coverUrl})` }"></div>
                <div class="book-details">
                  <h3>{{ book.title }}</h3>
                  <p class="author">作者：{{ book.author }}</p>
                  <p class="isbn">ISBN：{{ book.isbn }}</p>
                  <p class="status">
                    状态：
                    <el-tag
                      :type="book.status === 'available' ? 'success' : book.status === 'borrowed' ? 'warning' : 'danger'"
                    >
                      {{ book.status === 'available' ? '可借' : book.status === 'borrowed' ? '已借出' : '下架' }}
                    </el-tag>
                  </p>
                  <p class="collection-time">收藏时间：{{ book.collectionTime }}</p>
                </div>
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    :disabled="book.status !== 'available'"
                    @click="quickBorrow(book)"
                  >
                    快速借阅
                  </el-button>
                  <el-button
                    type="danger"
                    @click="cancelCollection(book)"
                  >
                    取消收藏
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
          
          <div v-if="filteredCollections.length === 0" class="empty-state">
            <el-empty description="暂无收藏图书" />
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 我的书评 -->
      <el-tab-pane label="我的书评" name="myReviews">
        <div class="review-section">
          <div class="my-reviews-list">
            <el-card
              v-for="review in myReviews"
              :key="review.id"
              class="review-item"
              shadow="hover"
            >
              <div class="review-header">
                <div class="book-title">{{ review.bookTitle }}</div>
                <div class="review-meta">
                  <span class="review-time">{{ review.reviewTime }}</span>
                  <el-rate
                    v-model="review.rating"
                    disabled
                    show-score
                    score-template="{value}星"
                    style="margin-left: 10px;"
                  />
                </div>
              </div>
              <div class="review-content">
                <p>{{ review.content }}</p>
                <div v-if="review.notesUrl" class="review-notes">
                  <el-link :href="review.notesUrl" target="_blank">
                    <el-icon><Document /></el-icon> 查看读书笔记
                  </el-link>
                </div>
              </div>
              <div class="review-stats">
                <el-button
                  type="text"
                  @click="likeReview(review)"
                  :class="{ 'liked': review.isLiked }"
                >
                  <el-icon><Star /></el-icon> {{ review.likeCount }} 点赞
                </el-button>
              </div>
            </el-card>
          </div>
          
          <div v-if="myReviews.length === 0" class="empty-state">
            <el-empty description="暂无发布的书评" />
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 图书书评 -->
      <el-tab-pane label="图书书评" name="bookReviews">
        <div class="book-reviews-section">
          <div class="book-search">
            <el-input
              v-model="bookSearch"
              placeholder="搜索图书查看书评"
              prefix-icon="el-icon-search"
              style="width: 400px;"
            />
            <el-button
              type="primary"
              @click="searchBooks"
              style="margin-left: 10px;"
            >
              搜索
            </el-button>
          </div>
          
          <div v-if="selectedBook" class="book-reviews-content">
            <div class="book-info-card">
              <div class="book-cover-large" :style="{ backgroundImage: `url(${selectedBook.coverUrl})` }"></div>
              <div class="book-details-large">
                <h3>{{ selectedBook.title }}</h3>
                <p class="author">作者：{{ selectedBook.author }}</p>
                <p class="publisher">出版社：{{ selectedBook.publisher }}</p>
                <p class="publish-date">出版日期：{{ selectedBook.publishDate }}</p>
                <div class="rating-summary">
                  <div class="avg-rating">
                    <span class="rating-value">{{ selectedBook.avgRating }}</span>
                    <el-rate
                      v-model="selectedBook.avgRating"
                      disabled
                      show-score
                      score-template="{value}"
                      style="margin-left: 10px;"
                    />
                  </div>
                  <div class="review-count">{{ selectedBook.reviewCount }} 条书评</div>
                </div>
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    :disabled="selectedBook.status !== 'available'"
                    @click="borrowThisBook(selectedBook)"
                  >
                    借阅
                  </el-button>
                  <el-button
                    :type="isCollected(selectedBook.id) ? 'warning' : 'default'"
                    @click="toggleCollection(selectedBook)"
                  >
                    {{ isCollected(selectedBook.id) ? '取消收藏' : '收藏' }}
                  </el-button>
                  <el-button
                    type="success"
                    @click="showReviewDialog = true"
                    :disabled="!canReview(selectedBook.id)"
                  >
                    写书评
                  </el-button>
                </div>
              </div>
            </div>
            
            <div class="reviews-list">
              <div class="review-filter">
                <span>排序方式：</span>
                <el-radio-group v-model="reviewSort">
                  <el-radio-button label="latest">最新</el-radio-button>
                  <el-radio-button label="highest">评分最高</el-radio-button>
                  <el-radio-button label="mostLiked">最多点赞</el-radio-button>
                </el-radio-group>
              </div>
              
              <el-card
                v-for="review in sortedReviews"
                :key="review.id"
                class="review-item"
                shadow="hover"
              >
                <div class="review-header">
                  <div class="reviewer-info">
                    <el-avatar :src="review.reviewerAvatar" size="small"></el-avatar>
                    <span class="reviewer-name">{{ review.reviewerName }}</span>
                    <span class="reviewer-type">{{ review.reviewerType }}</span>
                  </div>
                  <div class="review-meta">
                    <span class="review-time">{{ review.reviewTime }}</span>
                    <el-rate
                      v-model="review.rating"
                      disabled
                      show-score
                      score-template="{value}星"
                      style="margin-left: 10px;"
                    />
                  </div>
                </div>
                <div class="review-content">
                  <p>{{ review.content }}</p>
                  <div v-if="review.notesUrl" class="review-notes">
                    <el-link :href="review.notesUrl" target="_blank">
                      <el-icon><Document /></el-icon> 查看读书笔记
                    </el-link>
                  </div>
                </div>
                <div class="review-stats">
                  <el-button
                    type="text"
                    @click="likeReview(review)"
                    :class="{ 'liked': review.isLiked }"
                  >
                    <el-icon><Star /></el-icon> {{ review.likeCount }} 点赞
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
          
          <div v-else-if="searchedBooks.length > 0" class="search-results">
            <h3>搜索结果</h3>
            <div class="book-list">
              <el-card
                v-for="book in searchedBooks"
                :key="book.id"
                class="search-book-item"
                shadow="hover"
                @click="selectBook(book)"
              >
                <div class="book-info">
                  <div class="book-cover" :style="{ backgroundImage: `url(${book.coverUrl})` }"></div>
                  <div class="book-details">
                    <h4>{{ book.title }}</h4>
                    <p class="author">作者：{{ book.author }}</p>
                    <p class="publisher">出版社：{{ book.publisher }}</p>
                    <div class="rating-preview">
                      <el-rate
                        v-model="book.avgRating"
                        disabled
                        show-score
                        score-template="{value}"
                        style="margin-right: 5px;"
                      />
                      <span>{{ book.reviewCount }}条评论</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          
          <div v-else-if="searchedBooks.length === 0 && bookSearch" class="empty-state">
            <el-empty description="未找到相关图书" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 写书评对话框 -->
    <el-dialog
      v-model="showReviewDialog"
      title="写书评"
      width="600px"
    >
      <div class="review-form">
        <div class="form-item">
          <label>评分</label>
          <el-rate v-model="newReview.rating" />
        </div>
        
        <div class="form-item">
          <label>短评（150字以内）</label>
          <el-input
            v-model="newReview.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的书评..."
            maxlength="150"
            show-word-limit
          />
        </div>
        
        <div class="form-item">
          <label>上传读书笔记（可选，支持文本/PDF，20MB以内）</label>
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            accept=".txt,.pdf"
            :limit="1"
          >
            <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">
              支持上传.txt和.pdf格式文件，大小不超过20MB
            </div>
          </el-upload>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submittingReview">
          提交书评
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Star } from '@element-plus/icons-vue'

export default {
  name: 'ReviewCollection',
  components: {
    Document,
    Star
  },
  setup() {
    // 标签页激活状态
    const activeTab = ref('collections')
    
    // 收藏相关
    const collectionSearch = ref('')
    const collectionStatus = ref('')
    const collections = ref([
      {
        id: 1,
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        isbn: '9787544270878',
        coverUrl: 'https://via.placeholder.com/120x180?text=Book+Cover',
        status: 'available',
        collectionTime: '2023-10-15 14:30:00'
      },
      {
        id: 2,
        title: '1984',
        author: '乔治·奥威尔',
        isbn: '9787532753607',
        coverUrl: 'https://via.placeholder.com/120x180?text=Book+Cover',
        status: 'borrowed',
        collectionTime: '2023-09-20 09:15:00'
      },
      {
        id: 3,
        title: '活着',
        author: '余华',
        isbn: '9787506365437',
        coverUrl: 'https://via.placeholder.com/120x180?text=Book+Cover',
        status: 'available',
        collectionTime: '2023-08-10 16:45:00'
      },
      {
        id: 4,
        title: '三体',
        author: '刘慈欣',
        isbn: '9787536692930',
        coverUrl: 'https://via.placeholder.com/120x180?text=Book+Cover',
        status: 'unavailable',
        collectionTime: '2023-07-05 11:20:00'
      }
    ])
    
    // 我的书评
    const myReviews = ref([
      {
        id: 1,
        bookTitle: '百年孤独',
        rating: 5,
        content: '这是一部震撼人心的史诗巨著，马尔克斯用魔幻现实主义的手法展现了布恩迪亚家族七代人的传奇故事。',
        reviewTime: '2023-10-20 15:30:00',
        likeCount: 12,
        isLiked: false,
        notesUrl: ''
      },
      {
        id: 2,
        bookTitle: '1984',
        rating: 4,
        content: '奥威尔的预言令人深思，这本书让我对权力和自由有了更深刻的理解。',
        reviewTime: '2023-09-25 10:15:00',
        likeCount: 8,
        isLiked: true,
        notesUrl: 'https://example.com/notes/1984.pdf'
      }
    ])
    
    // 图书搜索相关
    const bookSearch = ref('')
    const searchedBooks = ref([])
    const selectedBook = ref(null)
    const reviewSort = ref('latest')
    
    // 书评排序后的列表
    const sortedReviews = computed(() => {
      if (!selectedBook.value) return []
      
      const reviews = [...selectedBook.value.reviews]
      
      switch (reviewSort.value) {
        case 'highest':
          return reviews.sort((a, b) => b.rating - a.rating)
        case 'mostLiked':
          return reviews.sort((a, b) => b.likeCount - a.likeCount)
        case 'latest':
        default:
          return reviews.sort((a, b) => new Date(b.reviewTime) - new Date(a.reviewTime))
      }
    })
    
    // 筛选后的收藏列表
    const filteredCollections = computed(() => {
      return collections.value.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(collectionSearch.value.toLowerCase()) ||
                             book.author.toLowerCase().includes(collectionSearch.value.toLowerCase())
        const matchesStatus = !collectionStatus.value || book.status === collectionStatus.value
        return matchesSearch && matchesStatus
      })
    })
    
    // 搜索图书
    const searchBooks = () => {
      if (!bookSearch.value) {
        ElMessage.warning('请输入搜索关键词')
        return
      }
      
      // 模拟搜索结果
      searchedBooks.value = [
        {
          id: 1,
          title: '百年孤独',
          author: '加西亚·马尔克斯',
          publisher: '南海出版公司',
          publishDate: '2011-06',
          coverUrl: 'https://via.placeholder.com/120x180?text=Book+Cover',
          avgRating: 4.8,
          reviewCount: 156,
          status: 'available',
          reviews: [
            {
              id: 1,
              reviewerName: '张三',
              reviewerType: '学生',
              reviewerAvatar: 'https://via.placeholder.com/40x40?text=User',
              rating: 5,
              content: '这是一部震撼人心的史诗巨著，马尔克斯用魔幻现实主义的手法展现了布恩迪亚家族七代人的传奇故事。',
              reviewTime: '2023-10-20 15:30:00',
              likeCount: 12,
              isLiked: false,
              notesUrl: ''
            },
            {
              id: 2,
              reviewerName: '李四',
              reviewerType: '教师',
              reviewerAvatar: 'https://via.placeholder.com/40x40?text=User',
              rating: 4,
              content: '经典之作，值得反复阅读。',
              reviewTime: '2023-10-15 10:15:00',
              likeCount: 8,
              isLiked: true,
              notesUrl: ''
            }
          ]
        },
        {
          id: 2,
          title: '1984',
          author: '乔治·奥威尔',
          publisher: '上海译文出版社',
          publishDate: '2010-04',
          coverUrl: 'https://via.placeholder.com/120x180?text=Book+Cover',
          avgRating: 4.7,
          reviewCount: 234,
          status: 'borrowed',
          reviews: [
            {
              id: 3,
              reviewerName: '王五',
              reviewerType: '学生',
              reviewerAvatar: 'https://via.placeholder.com/40x40?text=User',
              rating: 5,
              content: '奥威尔的预言令人深思，这本书让我对权力和自由有了更深刻的理解。',
              reviewTime: '2023-09-25 10:15:00',
              likeCount: 15,
              isLiked: false,
              notesUrl: 'https://example.com/notes/1984.pdf'
            }
          ]
        }
      ]
      
      selectedBook.value = null
    }
    
    // 选择图书查看书评
    const selectBook = (book) => {
      selectedBook.value = book
      searchedBooks.value = []
    }
    
    // 检查图书是否已收藏
    const isCollected = (bookId) => {
      return collections.value.some(book => book.id === bookId)
    }
    
    // 切换收藏状态
    const toggleCollection = (book) => {
      if (isCollected(book.id)) {
        cancelCollection(book)
      } else {
        collections.value.push({
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn || '',
          coverUrl: book.coverUrl,
          status: book.status,
          collectionTime: new Date().toLocaleString()
        })
        ElMessage.success('收藏成功')
      }
    }
    
    // 取消收藏
    const cancelCollection = (book) => {
      const index = collections.value.findIndex(item => item.id === book.id)
      if (index > -1) {
        collections.value.splice(index, 1)
        ElMessage.success('取消收藏成功')
      }
    }
    
    // 快速借阅
    const quickBorrow = (book) => {
      ElMessage.success(`已提交《${book.title}》的借阅申请`)
    }
    
    // 借阅当前图书
    const borrowThisBook = (book) => {
      ElMessage.success(`已提交《${book.title}》的借阅申请`)
    }
    
    // 检查是否可以写书评（已借阅用户）
    const canReview = (bookId) => {
      // 模拟检查：假设用户已借阅过这本书
      return true
    }
    
    // 写书评相关
    const showReviewDialog = ref(false)
    const submittingReview = ref(false)
    const newReview = ref({
      rating: 0,
      content: ''
    })
    const fileList = ref([])
    
    // 处理文件上传
    const handleFileChange = (file, fileList) => {
      // 检查文件大小
      const maxSize = 20 * 1024 * 1024 // 20MB
      if (file.size > maxSize) {
        ElMessage.error('文件大小不能超过20MB')
        return false
      }
      return true
    }
    
    // 提交书评
    const submitReview = () => {
      if (newReview.value.rating === 0) {
        ElMessage.warning('请选择评分')
        return
      }
      
      if (!newReview.value.content.trim()) {
        ElMessage.warning('请输入书评内容')
        return
      }
      
      submittingReview.value = true
      
      // 模拟提交
      setTimeout(() => {
        myReviews.value.push({
          id: myReviews.value.length + 1,
          bookTitle: selectedBook.value.title,
          rating: newReview.value.rating,
          content: newReview.value.content,
          reviewTime: new Date().toLocaleString(),
          likeCount: 0,
          isLiked: false,
          notesUrl: fileList.value.length > 0 ? 'https://example.com/notes/' + Date.now() + '.pdf' : ''
        })
        
        // 更新选中图书的书评
        if (selectedBook.value) {
          selectedBook.value.reviews.push({
            id: selectedBook.value.reviews.length + 1,
            reviewerName: '我',
            reviewerType: '学生',
            reviewerAvatar: 'https://via.placeholder.com/40x40?text=Me',
            rating: newReview.value.rating,
            content: newReview.value.content,
            reviewTime: new Date().toLocaleString(),
            likeCount: 0,
            isLiked: false,
            notesUrl: fileList.value.length > 0 ? 'https://example.com/notes/' + Date.now() + '.pdf' : ''
          })
          
          // 更新平均评分
          const totalRating = selectedBook.value.reviews.reduce((sum, review) => sum + review.rating, 0)
          selectedBook.value.avgRating = parseFloat((totalRating / selectedBook.value.reviews.length).toFixed(1))
          selectedBook.value.reviewCount = selectedBook.value.reviews.length
        }
        
        ElMessage.success('书评提交成功')
        showReviewDialog.value = false
        submittingReview.value = false
        
        // 重置表单
        newReview.value = {
          rating: 0,
          content: ''
        }
        fileList.value = []
      }, 1000)
    }
    
    // 点赞书评
    const likeReview = (review) => {
      if (review.isLiked) {
        review.likeCount--
        review.isLiked = false
      } else {
        review.likeCount++
        review.isLiked = true
      }
    }
    
    return {
      activeTab,
      
      // 收藏相关
      collectionSearch,
      collectionStatus,
      collections,
      filteredCollections,
      cancelCollection,
      quickBorrow,
      
      // 我的书评
      myReviews,
      
      // 图书搜索相关
      bookSearch,
      searchedBooks,
      selectedBook,
      reviewSort,
      sortedReviews,
      searchBooks,
      selectBook,
      isCollected,
      toggleCollection,
      borrowThisBook,
      canReview,
      
      // 写书评相关
      showReviewDialog,
      submittingReview,
      newReview,
      fileList,
      handleFileChange,
      submitReview,
      
      // 点赞
      likeReview
    }
  }
}
</script>

<style scoped>
.review-collection-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

/* 收藏部分样式 */
.collection-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.collection-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 20px;
}

.collection-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.collection-item:hover {
  transform: translateY(-2px);
}

/* 图书信息样式 */
.book-info {
  display: flex;
  align-items: flex-start;
}

.book-cover {
  width: 100px;
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  margin-right: 20px;
}

.book-details {
  flex: 1;
}

.book-details h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.book-details .author,
.book-details .isbn,
.book-details .status,
.book-details .collection-time {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 我的书评样式 */
.review-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.my-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  margin-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reviewer-name {
  font-weight: bold;
  color: #333;
}

.reviewer-type {
  font-size: 12px;
  color: #999;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #999;
  font-size: 14px;
}

.review-content {
  margin-bottom: 15px;
  color: #333;
  line-height: 1.6;
}

.review-notes {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.review-stats {
  display: flex;
  justify-content: flex-end;
}

.review-stats .el-button.liked {
  color: #f7ba2a;
}

/* 图书书评样式 */
.book-reviews-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.book-search {
  margin-bottom: 20px;
}

.search-results h3 {
  margin-bottom: 20px;
  color: #333;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.search-book-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.search-book-item:hover {
  transform: translateY(-2px);
}

.rating-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
}

/* 图书详情和书评内容 */
.book-reviews-content {
  margin-top: 20px;
}

.book-info-card {
  display: flex;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.book-cover-large {
  width: 150px;
  height: 225px;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  margin-right: 30px;
}

.book-details-large {
  flex: 1;
}

.book-details-large h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 24px;
}

.book-details-large .author,
.book-details-large .publisher,
.book-details-large .publish-date {
  margin: 8px 0;
  color: #666;
  font-size: 16px;
}

.rating-summary {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 30px;
}

.avg-rating {
  display: flex;
  align-items: center;
}

.rating-value {
  font-size: 32px;
  font-weight: bold;
  color: #f7ba2a;
}

.review-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 书评表单样式 */
.review-form {
  padding: 20px 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .collection-list {
    grid-template-columns: 1fr;
  }
  
  .book-info {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: row;
    margin-top: 20px;
  }
  
  .book-list {
    grid-template-columns: 1fr;
  }
  
  .book-info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .book-cover-large {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .rating-summary {
    justify-content: center;
  }
}
</style>