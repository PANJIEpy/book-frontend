# 图书馆管理系统后端API接口设计文档

## 1. 认证与授权模块

### 1.1 登录接口
- **接口路径**: `/admin/login`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "username": "string", // 用户名/学号/工号
    "password": "string", // 密码
    "captchaCode": "string", // 验证码
    "captchaKey": "string" // 验证码key
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "登录成功",
    "data": "string" // JWT Token
  }
  ```

### 1.2 获取验证码接口
- **接口路径**: `/admin/login/captcha`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取验证码成功",
    "data": {
      "image": "string", // 验证码图片Base64
      "key": "string" // 验证码key
    }
  }
  ```

### 1.3 获取用户信息接口
- **接口路径**: `/admin/info`
- **请求方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取用户信息成功",
    "data": {
      "userId": "number",
      "username": "string",
      "realName": "string",
      "userType": "string", // STUDENT, TEACHER, ADMIN
      "roleKey": "string", // SUPER, PURCHASE, BORROW, DATA
      "deptName": "string",
      "phone": "string",
      "maxBorrowQuota": "number",
      "status": "number", // 1-正常, 0-禁用
      "avatarUrl": "string"
    }
  }
  ```

## 2. 用户管理模块

### 2.1 获取用户列表接口
- **接口路径**: `/admin/user/page`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "username": "string", // 用户名（可选）
    "realName": "string", // 真实姓名（可选）
    "userType": "string" // 用户类型（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取用户列表成功",
    "data": {
      "total": "number",
      "list": [
        {
          "userId": "number",
          "username": "string",
          "realName": "string",
          "userType": "string",
          "roleKey": "string",
          "deptName": "string",
          "phone": "string",
          "maxBorrowQuota": "number",
          "status": "number",
          "avatarUrl": "string"
        }
      ]
    }
  }
  ```

### 2.2 添加用户接口
- **接口路径**: `/admin/user`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "username": "string",
    "password": "string",
    "realName": "string",
    "userType": "string",
    "roleKey": "string",
    "deptName": "string",
    "phone": "string",
    "maxBorrowQuota": "number",
    "status": "number",
    "avatarUrl": "string"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "添加用户成功",
    "data": null
  }
  ```

### 2.3 更新用户接口
- **接口路径**: `/admin/user/{userId}`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "username": "string",
    "realName": "string",
    "userType": "string",
    "roleKey": "string",
    "deptName": "string",
    "phone": "string",
    "maxBorrowQuota": "number",
    "status": "number",
    "avatarUrl": "string"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "更新用户成功",
    "data": null
  }
  ```

### 2.4 删除用户接口
- **接口路径**: `/admin/user/{userId}`
- **请求方法**: `DELETE`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "删除用户成功",
    "data": null
  }
  ```

### 2.5 批量删除用户接口
- **接口路径**: `/admin/user/batch`
- **请求方法**: `DELETE`
- **请求参数**:
  ```json
  [1, 2, 3] // 用户ID数组
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "批量删除用户成功",
    "data": null
  }
  ```

### 2.6 更改用户状态接口
- **接口路径**: `/admin/user/status`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "userId": "number",
    "status": "number" // 1-正常, 0-禁用
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "更改用户状态成功",
    "data": null
  }
  ```

## 3. 图书管理模块

### 3.1 获取图书列表接口
- **接口路径**: `/book`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "title": "string", // 图书名称（可选）
    "author": "string", // 作者（可选）
    "isbn": "string", // ISBN（可选）
    "categoryCode": "string" // 分类号（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取图书列表成功",
    "data": {
      "total": "number",
      "list": [
        {
          "bookId": "number",
          "isbn": "string",
          "title": "string",
          "author": "string",
          "publisher": "string",
          "publishDate": "string",
          "categoryCode": "string",
          "price": "number",
          "summary": "string",
          "coverImg": "string",
          "totalStock": "number",
          "availableStock": "number"
        }
      ]
    }
  }
  ```

### 3.2 添加图书接口
- **接口路径**: `/book`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "isbn": "string",
    "title": "string",
    "author": "string",
    "publisher": "string",
    "publishDate": "string",
    "categoryCode": "string",
    "price": "number",
    "summary": "string",
    "coverImg": "string",
    "totalStock": "number",
    "availableStock": "number"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "添加图书成功",
    "data": null
  }
  ```

### 3.3 更新图书接口
- **接口路径**: `/book`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "bookId": "number",
    "isbn": "string",
    "title": "string",
    "author": "string",
    "publisher": "string",
    "publishDate": "string",
    "categoryCode": "string",
    "price": "number",
    "summary": "string",
    "coverImg": "string",
    "totalStock": "number",
    "availableStock": "number"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "更新图书成功",
    "data": null
  }
  ```

### 3.4 删除图书接口
- **接口路径**: `/book/{id}`
- **请求方法**: `DELETE`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "删除图书成功",
    "data": null
  }
  ```

### 3.5 批量删除图书接口
- **接口路径**: `/book/deleteBatch`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  [1, 2, 3] // 图书ID数组
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "批量删除图书成功",
    "data": null
  }
  ```

## 4. 借阅管理模块

### 4.1 获取借阅申请列表接口
- **接口路径**: `/borrow/apply/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "userId": "number", // 用户ID（可选）
    "bookName": "string", // 图书名称（可选）
    "status": "number" // 状态（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取借阅申请列表成功",
    "data": {
      "total": "number",
      "list": [
        {
          "recordId": "number",
          "userId": "number",
          "username": "string",
          "bookId": "number",
          "bookName": "string",
          "applyTime": "string",
          "status": "number", // 0-申请, 1-在借, 2-归还, 3-逾期, 4-拒绝
          "reason": "string" // 拒绝原因
        }
      ]
    }
  }
  ```

### 4.2 审核借阅申请接口
- **接口路径**: `/borrow/apply/audit`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "recordId": "number",
    "status": "number", // 1-通过, 4-拒绝
    "reason": "string" // 拒绝原因（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "审核借阅申请成功",
    "data": null
  }
  ```

### 4.3 获取用户借阅记录接口
- **接口路径**: `/borrow/user/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "status": "number" // 状态（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取用户借阅记录成功",
    "data": {
      "total": "number",
      "list": [
        {
          "recordId": "number",
          "bookId": "number",
          "bookName": "string",
          "author": "string",
          "borrowDate": "string",
          "dueDate": "string",
          "returnDate": "string",
          "status": "number",
          "renewCount": "number"
        }
      ]
    }
  }
  ```

### 4.4 提交借阅申请接口
- **接口路径**: `/borrow/apply/submit`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "bookId": "number"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "提交借阅申请成功",
    "data": null
  }
  ```

### 4.5 续借图书接口
- **接口路径**: `/borrow/renew`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "recordId": "number"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "续借图书成功",
    "data": {
      "newDueDate": "string"
    }
  }
  ```

### 4.6 归还图书接口
- **接口路径**: `/borrow/return`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "recordId": "number",
    "returnMethod": "string" // 线下还书点, 自助还书机
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "归还图书成功",
    "data": null
  }
  ```

## 5. 预约管理模块

### 5.1 获取预约列表接口
- **接口路径**: `/reservation/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "bookId": "number", // 图书ID（可选）
    "status": "number" // 状态（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取预约列表成功",
    "data": {
      "total": "number",
      "list": [
        {
          "reserveId": "number",
          "userId": "number",
          "username": "string",
          "bookId": "number",
          "bookName": "string",
          "status": "number", // 0-排队, 1-到书, 2-完成, 3-取消, 4-失效
          "queuePosition": "number",
          "notifyTime": "string",
          "createdAt": "string"
        }
      ]
    }
  }
  ```

### 5.2 提交预约申请接口
- **接口路径**: `/reservation/submit`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "bookId": "number"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "提交预约申请成功",
    "data": {
      "queuePosition": "number"
    }
  }
  ```

### 5.3 取消预约接口
- **接口路径**: `/reservation/cancel/{reserveId}`
- **请求方法**: `PUT`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "取消预约成功",
    "data": null
  }
  ```

### 5.4 获取用户预约记录接口
- **接口路径**: `/reservation/user/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number" // 每页条数
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取用户预约记录成功",
    "data": {
      "total": "number",
      "list": [
        {
          "reserveId": "number",
          "bookId": "number",
          "bookName": "string",
          "author": "string",
          "status": "number",
          "queuePosition": "number",
          "notifyTime": "string",
          "createdAt": "string"
        }
      ]
    }
  }
  ```

## 6. 归还与罚款模块

### 6.1 获取待归还图书接口
- **接口路径**: `/return/pending`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取待归还图书成功",
    "data": [
      {
        "recordId": "number",
        "bookId": "number",
        "bookName": "string",
        "author": "string",
        "borrowDate": "string",
        "dueDate": "string",
        "daysOverdue": "number", // 逾期天数
        "fineAmount": "number" // 罚款金额
      }
    ]
  }
  ```

### 6.2 获取归还位置接口
- **接口路径**: `/return/locations`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取归还位置成功",
    "data": {
      "offlineLocations": [
        {
          "id": "number",
          "name": "string",
          "location": "string",
          "openTime": "string"
        }
      ],
      "selfServiceMachines": [
        {
          "id": "number",
          "location": "string",
          "status": "string"
        }
      ]
    }
  }
  ```

### 6.3 获取罚款记录接口
- **接口路径**: `/fine/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number" // 每页条数
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取罚款记录成功",
    "data": {
      "total": "number",
      "list": [
        {
          "fineId": "number",
          "borrowId": "number",
          "bookName": "string",
          "amount": "number",
          "type": "number", // 1-逾期, 2-破损, 3-丢失
          "status": "number", // 0-未缴, 1-已缴
          "payTime": "string",
          "payMethod": "string"
        }
      ]
    }
  }
  ```

### 6.4 缴纳罚款接口
- **接口路径**: `/fine/pay`
- **请求方法**: `PUT`
- **请求参数**:
  ```json
  {
    "fineId": "number",
    "payMethod": "string" // 微信支付, 支付宝, 校园一卡通
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "缴纳罚款成功",
    "data": null
  }
  ```

## 7. 书评与收藏模块

### 7.1 获取图书收藏列表接口
- **接口路径**: `/collection/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "bookName": "string" // 图书名称（可选）
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取图书收藏列表成功",
    "data": {
      "total": "number",
      "list": [
        {
          "collectionId": "number",
          "bookId": "number",
          "title": "string",
          "author": "string",
          "isbn": "string",
          "coverImg": "string",
          "status": "string", // available, borrowed, unavailable
          "collectionTime": "string"
        }
      ]
    }
  }
  ```

### 7.2 收藏图书接口
- **接口路径**: `/collection/add`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "bookId": "number"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "收藏图书成功",
    "data": null
  }
  ```

### 7.3 取消收藏接口
- **接口路径**: `/collection/cancel/{bookId}`
- **请求方法**: `DELETE`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "取消收藏成功",
    "data": null
  }
  ```

### 7.4 获取图书书评接口
- **接口路径**: `/review/book/{bookId}`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "sortBy": "string" // latest, highest, mostLiked
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取图书书评成功",
    "data": {
      "total": "number",
      "avgRating": "number",
      "list": [
        {
          "reviewId": "number",
          "userId": "number",
          "username": "string",
          "realName": "string",
          "avatarUrl": "string",
          "rating": "number",
          "content": "string",
          "notesUrl": "string",
          "likeCount": "number",
          "isLiked": "boolean",
          "createdAt": "string"
        }
      ]
    }
  }
  ```

### 7.5 获取用户书评接口
- **接口路径**: `/review/user/list`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "pageNum": "number", // 页码
    "pageSize": "number" // 每页条数
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取用户书评成功",
    "data": {
      "total": "number",
      "list": [
        {
          "reviewId": "number",
          "bookId": "number",
          "bookName": "string",
          "author": "string",
          "rating": "number",
          "content": "string",
          "notesUrl": "string",
          "likeCount": "number",
          "createdAt": "string"
        }
      ]
    }
  }
  ```

### 7.6 发布书评接口
- **接口路径**: `/review/publish`
- **请求方法**: `POST`
- **请求参数**:
  ```json
  {
    "bookId": "number",
    "rating": "number",
    "content": "string",
    "notesUrl": "string" // 可选
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "发布书评成功",
    "data": null
  }
  ```

### 7.7 点赞书评接口
- **接口路径**: `/review/like/{reviewId}`
- **请求方法**: `POST`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "点赞书评成功",
    "data": null
  }
  ```

### 7.8 取消点赞书评接口
- **接口路径**: `/review/unlike/{reviewId}`
- **请求方法**: `DELETE`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "取消点赞书评成功",
    "data": null
  }
  ```

## 8. 首页展示模块

### 8.1 获取首页数据接口
- **接口路径**: `/front/home/data`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取首页数据成功",
    "data": {
      "hotKeywords": ["Vue.js", "JavaScript", "Python", "Java", "数据结构"],
      "hotBooks": [
        {
          "bookId": "number",
          "title": "string",
          "author": "string",
          "coverImg": "string",
          "borrowCount": "number"
        }
      ],
      "newBooks": [
        {
          "bookId": "number",
          "title": "string",
          "author": "string",
          "coverImg": "string",
          "publishDate": "string"
        }
      ],
      "announcements": [
        {
          "id": "number",
          "title": "string",
          "content": "string",
          "type": "number",
          "isPinned": "boolean",
          "createdAt": "string"
        }
      ],
      "activities": [
        {
          "id": "number",
          "title": "string",
          "content": "string",
          "startTime": "string",
          "endTime": "string",
          "createdAt": "string"
        }
      ]
    }
  }
  ```

## 9. 图书搜索模块

### 9.1 搜索图书接口
- **接口路径**: `/front/search`
- **请求方法**: `GET`
- **请求参数**:
  ```json
  {
    "keyword": "string", // 搜索关键词
    "pageNum": "number", // 页码
    "pageSize": "number", // 每页条数
    "filters": {
      "author": "string", // 作者（可选）
      "publisher": "string", // 出版社（可选）
      "categoryCode": "string" // 分类号（可选）
    }
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "搜索图书成功",
    "data": {
      "total": "number",
      "list": [
        {
          "bookId": "number",
          "title": "string",
          "author": "string",
          "publisher": "string",
          "publishDate": "string",
          "coverImg": "string",
          "availableStock": "number",
          "avgRating": "number",
          "reviewCount": "number"
        }
      ]
    }
  }
  ```

### 9.2 获取图书详情接口
- **接口路径**: `/front/book/{bookId}`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取图书详情成功",
    "data": {
      "bookId": "number",
      "isbn": "string",
      "title": "string",
      "author": "string",
      "publisher": "string",
      "publishDate": "string",
      "categoryCode": "string",
      "price": "number",
      "summary": "string",
      "coverImg": "string",
      "totalStock": "number",
      "availableStock": "number",
      "avgRating": "number",
      "reviewCount": "number",
      "inventoryStatus": [
        {
          "itemId": "number",
          "barcode": "string",
          "callNumber": "string",
          "location": "string",
          "status": "number"
        }
      ],
      "relatedBooks": [
        {
          "bookId": "number",
          "title": "string",
          "author": "string",
          "coverImg": "string",
          "avgRating": "number"
        }
      ]
    }
  }
  ```

### 9.3 获取搜索历史接口
- **接口路径**: `/front/search/history`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取搜索历史成功",
    "data": [
      {
        "id": "number",
        "keyword": "string",
        "searchTime": "string"
      }
    ]
  }
  ```

### 9.4 清空搜索历史接口
- **接口路径**: `/front/search/history/clear`
- **请求方法**: `DELETE`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "清空搜索历史成功",
    "data": null
  }
  ```

## 10. 数据统计模块

### 10.1 获取仪表盘统计数据接口
- **接口路径**: `/admin/dashboard/stats`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取仪表盘统计数据成功",
    "data": {
      "userCount": "number",
      "bookCount": "number",
      "borrowCount": "number",
      "visitCount": "number"
    }
  }
  ```

### 10.2 获取借阅统计图表数据接口
- **接口路径**: `/admin/dashboard/chart`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取借阅统计图表数据成功",
    "data": {
      "labels": ["一月", "二月", "三月", "四月", "五月", "六月"],
      "borrowData": [120, 200, 150, 80, 70, 110],
      "returnData": [90, 150, 120, 60, 50, 90]
    }
  }
  ```

## 11. 通用模块

### 11.1 上传文件接口
- **接口路径**: `/admin/upload`
- **请求方法**: `POST`
- **请求参数**: `multipart/form-data`
  - `file`: 文件
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "上传文件成功",
    "data": {
      "url": "string"
    }
  }
  ```

### 11.2 获取系统信息接口
- **接口路径**: `/admin/system/info`
- **请求方法**: `GET`
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "获取系统信息成功",
    "data": {
      "systemName": "string",
      "version": "string",
      "description": "string"
    }
  }
  ```

## 12. 其他管理模块

### 12.1 公告管理接口
- **接口路径**: `/admin/announcement/*`
- **接口说明**: 包括公告列表、添加公告、更新公告、删除公告等接口，与图书管理接口类似

### 12.2 采购管理接口
- **接口路径**: `/admin/purchase/*`
- **接口说明**: 包括采购申请列表、处理采购申请等接口

### 12.3 库存管理接口
- **接口路径**: `/admin/inventory/*`
- **接口说明**: 包括库存列表、更新库存等接口

### 12.4 期刊管理接口
- **接口路径**: `/admin/journal/*`
- **接口说明**: 包括期刊列表、添加期刊、更新期刊等接口

### 12.5 电子资源管理接口
- **接口路径**: `/admin/electronic-resource/*`
- **接口说明**: 包括电子资源列表、添加电子资源、更新电子资源等接口

### 12.6 权限管理接口
- **接口路径**: `/admin/permission/*`
- **接口说明**: 包括权限列表、更新权限等接口

### 12.7 系统配置接口
- **接口路径**: `/admin/system-config/*`
- **接口说明**: 包括系统配置列表、更新系统配置等接口

## 13. API版本控制

所有API接口都应该支持版本控制，建议在URL中添加版本号，例如：

```
/v1/admin/login
/v1/book
/v1/borrow/apply/list
```

## 14. 错误码设计

| 错误码 | 描述 |
| --- | --- |
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 接口未实现 |
| 10001 | 用户名或密码错误 |
| 10002 | 验证码错误 |
| 10003 | 用户已禁用 |
| 10004 | 借阅额度已满 |
| 10005 | 图书已借出 |
| 10006 | 图书已预约 |
| 10007 | 逾期未还 |
| 10008 | 已达到续借上限 |

## 15. 安全设计

1. **JWT认证**: 使用JWT Token进行身份验证，设置合理的过期时间
2. **密码加密**: 用户密码使用BCrypt等算法进行加密存储
3. **接口限流**: 对敏感接口进行限流，防止恶意请求
4. **SQL注入防护**: 使用参数化查询或ORM框架，防止SQL注入
5. **XSS防护**: 对用户输入进行过滤和转义，防止XSS攻击
6. **CSRF防护**: 对敏感操作添加CSRF令牌验证
7. **权限控制**: 基于角色的权限控制，确保用户只能访问其有权限的接口

## 16. 性能优化

1. **缓存**: 对热点数据进行缓存，如图书信息、统计数据等
2. **分页**: 所有列表接口都应该支持分页
3. **索引**: 对经常查询的字段添加索引
4. **异步处理**: 对耗时操作进行异步处理，如发送通知、生成报表等
5. **数据库优化**: 合理设计数据库结构，避免不必要的关联查询

## 17. 文档生成

建议使用Swagger或SpringDoc等工具生成API文档，方便前端开发人员查看和测试接口。

## 18. 测试策略

1. **单元测试**: 对核心业务逻辑进行单元测试
2. **集成测试**: 对API接口进行集成测试
3. **性能测试**: 对关键接口进行性能测试
4. **安全测试**: 对接口进行安全测试，如SQL注入、XSS等

## 19. 部署建议

1. **容器化**: 使用Docker容器化部署，方便扩展和管理
2. **负载均衡**: 对API服务进行负载均衡，提高可用性
3. **监控**: 添加监控和日志，方便排查问题
4. **备份**: 定期备份数据库，防止数据丢失

以上是图书馆管理系统后端API接口设计文档，涵盖了前端需要的所有API接口。根据实际需求，可能需要对接口进行调整和扩展。