<template>
  <div class="home" style ="padding: 10px">

    <!-- 搜索-->
    <div style="margin: 10px 0;">
      <el-form inline="true" size="small">
        <el-form-item label="图书编号" >
          <el-input v-model="search1" placeholder="请输入图书编号"  clearable>
            <template #prefix><el-icon class="el-input__icon"><Search/></el-icon></template>
          </el-input>
        </el-form-item >
        <el-form-item label="图书名称" >
          <el-input v-model="search2" placeholder="请输入图书名称"  clearable>
            <template #prefix><el-icon class="el-input__icon"><Search /></el-icon></template>
          </el-input>
        </el-form-item >
        <el-form-item label="作者" >
          <el-input v-model="search3" placeholder="请输入作者"  clearable>
            <template #prefix><el-icon class="el-input__icon"><Search /></el-icon></template>
          </el-input>
        </el-form-item >
        <el-form-item>
          <el-button type="primary" style="margin-left: 1%" @click="load" size="mini" >
            查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button size="mini"  type="danger" @click="clear">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right" v-if="numOfOutDataBook!=0">
          <el-popconfirm
              confirm-button-text="查看"
              cancel-button-text="取消"
              title="您有图书已逾期，请尽快归还"
              @confirm="toLook"
          >
            <template #reference>
              <el-button  type="warning">逾期通知</el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
    </div>
    <!-- 按钮-->
    <div style="margin: 10px 0;" >
      <el-button type="primary" @click = "add" v-if="isAdmin">上架</el-button>
      <el-popconfirm title="确认删除?" @confirm="deleteBatch" v-if="isAdmin">
        <template #reference>
          <el-button type="danger" size="mini" >批量删除</el-button>
        </template>
      </el-popconfirm>
    </div>
    <!-- 数据字段-->
    <el-table :data="tableData" stripe border="true" @selection-change="handleSelectionChange">
      <el-table-column v-if="isAdmin"
                       type="selection"
                       width="55">
      </el-table-column>
      <el-table-column prop="isbn" label="图书编号" sortable />
      <el-table-column prop="title" label="图书名称" />
      <el-table-column prop="price" label="价格" sortable/>
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="publisher" label="出版社" />
      <el-table-column prop="publishDate" label="出版时间" sortable/>
      <el-table-column prop="availableStock" label="状态">
        <template v-slot="scope">
          <el-tag v-if="scope.row.availableStock <= 0" type="warning">已借阅</el-tag>
          <el-tag v-else type="success">未借阅</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" >
        <template v-slot="scope">
          <el-button  size="mini" @click ="handleEdit(scope.row)" v-if="isAdmin">修改</el-button>
          <el-popconfirm title="确认删除?" @confirm="handleDelete(scope.row.bookId)" v-if="isAdmin">
            <template #reference>
              <el-button type="danger" size="mini" >删除</el-button>
            </template>
          </el-popconfirm>
          <el-button  size="mini" @click ="handlelend(scope.row.bookId,scope.row.isbn,scope.row.title,scope.row.totalStock - scope.row.availableStock)" v-if="!isAdmin" :disabled="scope.row.availableStock <= 0">借阅</el-button>
          <el-popconfirm title="确认还书?" @confirm="handlereturn(scope.row.bookId,scope.row.isbn,scope.row.totalStock - scope.row.availableStock)" v-if="!isAdmin" :disabled="scope.row.availableStock >= scope.row.totalStock">
            <template #reference>
              <el-button type="danger" size="mini" :disabled="(this.isbnArray.indexOf(scope.row.isbn)) == -1 || scope.row.availableStock >= scope.row.totalStock" >还书</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--测试,通知对话框-->
    <el-dialog
        v-model="dialogVisible3"
        v-if="numOfOutDataBook!=0"
        title="逾期详情"
        width="50%"
        :before-close="handleClose"
    >
        <el-table :data="outDateBook" style="width: 100%">
          <el-table-column prop="isbn" label="图书编号" />
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="lendtime" label="借阅日期" />
          <el-table-column prop="deadtime" label="截至日期" />
        </el-table>

      <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible3 = false"
        >确认</el-button>
      </span>
      </template>
    </el-dialog>
    <!--    分页-->
    <div style="margin: 10px 0">
      <el-pagination
          v-model:currentPage="currentPage"
          :page-sizes="[5, 10, 20]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      >
      </el-pagination>

      <el-dialog v-model="dialogVisible" title="上架书籍" width="30%">
        <el-form :model="form" label-width="120px">

          <el-form-item label="图书编号">
            <el-input style="width: 80%" v-model="form.isbn"></el-input>
          </el-form-item>
          <el-form-item label="图书名称">
            <el-input style="width: 80%" v-model="form.title"></el-input>
          </el-form-item>
          <el-form-item label="价格">
            <el-input style="width: 80%" v-model="form.price"></el-input>
          </el-form-item>
          <el-form-item label="作者">
            <el-input style="width: 80%" v-model="form.author"></el-input>
          </el-form-item>
          <el-form-item label="出版社">
            <el-input style="width: 80%" v-model="form.publisher"></el-input>
          </el-form-item>
          <el-form-item label="出版时间">
            <div>
              <el-date-picker value-format="YYYY-MM-DD" type="date" style="width: 80%" clearable v-model="form.publishDate" ></el-date-picker>
            </div>
          </el-form-item>
          <el-form-item label="分类号">
            <el-input style="width: 80%" v-model="form.categoryCode"></el-input>
          </el-form-item>
          <el-form-item label="简介">
            <el-input style="width: 80%" type="textarea" v-model="form.summary"></el-input>
          </el-form-item>
          <el-form-item label="总库存">
            <el-input style="width: 80%" type="number" v-model="form.totalStock"></el-input>
          </el-form-item>
          <el-form-item label="可借库存">
            <el-input style="width: 80%" type="number" v-model="form.availableStock"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
        </template>
      </el-dialog>

      <el-dialog v-model="dialogVisible2" title="修改书籍信息" width="30%">
        <el-form :model="form" label-width="120px">
          <el-form-item label="图书编号">
            <el-input style="width: 80%" v-model="form.isbn"></el-input>
          </el-form-item>
          <el-form-item label="图书名称">
            <el-input style="width: 80%" v-model="form.title"></el-input>
          </el-form-item>
          <el-form-item label="价格">
            <el-input style="width: 80%" v-model="form.price"></el-input>
          </el-form-item>
          <el-form-item label="作者">
            <el-input style="width: 80%" v-model="form.author"></el-input>
          </el-form-item>
          <el-form-item label="出版社">
            <el-input style="width: 80%" v-model="form.publisher"></el-input>
          </el-form-item>
          <el-form-item label="出版时间">
            <div>
              <el-date-picker value-format="YYYY-MM-DD" type="date" style="width: 80%" clearable v-model="form.publishDate" ></el-date-picker>
            </div>
          </el-form-item>
          <el-form-item label="分类号">
            <el-input style="width: 80%" v-model="form.categoryCode"></el-input>
          </el-form-item>
          <el-form-item label="简介">
            <el-input style="width: 80%" type="textarea" v-model="form.summary"></el-input>
          </el-form-item>
          <el-form-item label="总库存">
            <el-input style="width: 80%" type="number" v-model="form.totalStock"></el-input>
          </el-form-item>
          <el-form-item label="可借库存">
            <el-input style="width: 80%" type="number" v-model="form.availableStock"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import {ElMessage} from "element-plus";
import moment from "moment";
import api from '../api';
export default {
  created(){
    let userStr = sessionStorage.getItem("user") ||"{}"
    this.user = JSON.parse(userStr)
    this.load()
  },
  name: 'Book',
  methods: {
  // (this.isbnArray.indexOf(scope.row.isbn)) == -1
    handleSelectionChange(val){
      this.ids = val.map(v =>v.bookId)
    },
    deleteBatch(){
      if (!this.ids.length) {
        ElMessage.warning("请选择数据！")
        return
      }
      //  一个小优化，直接发送这个数组，而不是一个一个的提交删除
      api.book.batchDeleteBook(this.ids).then(res =>{
        console.log('批量删除响应:', res)
        console.log('响应类型:', typeof res)
        console.log('响应code:', res.code)
        console.log('响应code类型:', typeof res.code)
        // 操作成功，显示成功提示
        ElMessage.success("批量删除成功")
        this.load()
      }).catch(error => {
        // 只有在请求失败时才显示错误提示
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败')
      })
    },
    load(){
      this.numOfOutDataBook =0;
      this.outDateBook =[];
      // 构建查询参数，只传递非空值
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize
      };
      // ISBN是精确查询，只有在非空时才传递
      if (this.search1 && this.search1.trim() !== '') {
        params.isbn = this.search1.trim();
      }
      // 图书名称是模糊查询，只有在非空时才传递
      if (this.search2 && this.search2.trim() !== '') {
        params.title = this.search2.trim();
      }
      // 作者是模糊查询，只有在非空时才传递
      if (this.search3 && this.search3.trim() !== '') {
        params.author = this.search3.trim();
      }
      api.book.getBookList(params).then(res =>{
        console.log(res)
        this.tableData = res.data.records
        this.total = res.data.total
      }).catch(error => {
        console.error('获取图书列表失败:', error)
        ElMessage.error('获取图书列表失败')
      })
    //
      if(this.user.role == 2){
        api.lendRecord.getUserBorrowInfo({
          pageNum: "1",
          pageSize: this.total,
          search1: "",
          search2: "",
          search3: this.user.id,
        }).then(res =>{
          console.log(res)
          this.bookData = res.data.records
          this.number = this.bookData.length;
          var nowDate = new Date();
          for(let i=0; i< this.number; i++){
            this.isbnArray[i] = this.bookData[i].isbn;
            let dDate = new Date(this.bookData[i].deadtime);
            if(dDate < nowDate){
              this.outDateBook[this.numOfOutDataBook] = {
                isbn:this.bookData[i].isbn,
                bookName : this.bookData[i].bookName,
                deadtime : this.bookData[i].deadtime,
                lendtime : this.bookData[i].lendtime,
              };
              this.numOfOutDataBook = this.numOfOutDataBook + 1;
            }
          }
          console.log("in load():" +this.numOfOutDataBook );
        })
      }
      //
    },
    clear(){
      this.search1 = ""
      this.search2 = ""
      this.search3 = ""
      this.load()
    },

    handleDelete(id){
      api.book.deleteBook(id).then(res =>{
        console.log('删除书籍响应:', res)
        console.log('响应类型:', typeof res)
        console.log('响应code:', res.code)
        console.log('响应code类型:', typeof res.code)
        // 操作成功，显示成功提示
        ElMessage.success("删除成功")
        this.load()
      }).catch(error => {
        // 只有在请求失败时才显示错误提示
        console.error('删除书籍失败:', error)
        ElMessage.error('删除书籍失败')
      })
    },
    handlereturn(id,isbn,bn){
      // 获取当前图书信息
      api.book.getBookById(id).then(bookRes => {
        console.log('获取图书详情响应:', bookRes)
        // 获取图书详情成功，继续后续操作
        const book = bookRes.data;
        // 更新图书库存，增加可借数量
        const updateData = {
          bookId: id,
          totalStock: book.totalStock,
          availableStock: book.availableStock + 1
        };
        api.book.updateBook(updateData).then(res =>{
          console.log('还书更新库存响应:', res)
          console.log('响应类型:', typeof res)
          console.log('响应code:', res.code)
          console.log('响应code类型:', typeof res.code)
          // 操作成功，显示成功提示
          ElMessage({
            message: '还书成功',
            type: 'success',
          })
        //
          this.form3.isbn = isbn
      this.form3.readerId = this.user.id
      let endDate = moment(new Date()).format("yyyy-MM-DD HH:mm:ss")
      this.form3.returnTime = endDate
      this.form3.status = "1"
      console.log(bn)
      this.form3.borrownum = bn
      api.lendRecord.updateLendRecord(this.form3).then(res =>{
        console.log(res)
        let form3 ={};
        form3.isbn = isbn;
        form3.bookName = name || '';
        form3.nickName = this.user.username;
        form3.id = this.user.id;
        form3.lendtime = endDate;
        form3.deadtime = endDate;
        form3.prolong  = 1;
        api.lendRecord.deleteBorrowRecord(form3).then(res =>{
          console.log(res)
          this.load()
        }).catch(error => {
          console.error('删除借阅记录失败:', error)
        })
      }).catch(error => {
        console.error('更新借阅记录失败:', error)
      })
        //
        })
      }).catch(error => {
        console.error('获取图书详情失败:', error)
        ElMessage.error('获取图书详情失败')
      })
      // this.form3.isbn = isbn
      // this.form3.readerId = this.user.id
      // let endDate = moment(new Date()).format("yyyy-MM-DD HH:mm:ss")
      // this.form3.returnTime = endDate
      // this.form3.status = "1"
      // console.log(bn)
      // this.form3.borrownum = bn
      // request.put("/LendRecord1/",this.form3).then(res =>{
      //   console.log(res)
      // })
      // let form3 ={};
      // form3.isbn = isbn;
      // form3.bookName = name;
      // form3.nickName = this.user.username;
      // form3.id = this.user.id;
      // form3.lendtime = endDate;
      // form3.deadtime = endDate;
      // form3.prolong  = 1;
      // request.post("/bookwithuser/deleteRecord",form3).then(res =>{
      //   console.log(res)
      //   this.load()
      // })
    },
    handlelend(id,isbn,name,bn){
      if(this.number ==5){
        ElMessage.warning("您不能再借阅更多的书籍了")
        return;
      }
      if(this.numOfOutDataBook !=0){
        ElMessage.warning("在您归还逾期书籍前不能再借阅书籍")
        return;
      }
      // 获取当前图书信息
      api.book.getBookById(id).then(bookRes => {
        console.log('获取图书详情响应:', bookRes)
        // 获取图书详情成功，继续后续操作
        const book = bookRes.data;
        // 更新图书库存，减少可借数量
        const updateData = {
          bookId: id,
          totalStock: book.totalStock,
          availableStock: book.availableStock - 1
        };
        api.book.updateBook(updateData).then(res =>{
          console.log('借阅更新库存响应:', res)
          console.log('响应类型:', typeof res)
          console.log('响应code:', res.code)
          console.log('响应code类型:', typeof res.code)
          // 操作成功，显示成功提示
          ElMessage({
            message: '借阅成功',
            type: 'success',
          })
        }).catch(error => {
          // 只有在请求失败时才显示错误提示
          console.error('借阅失败:', error)
          ElMessage.error('借阅失败')
        })

        this.form2.status = "0"
        this.form2.isbn = isbn
        this.form2.bookname = name
        this.form2.readerId = this.user.id
        this.form2.borrownum = bn+1
        console.log(this.form2.borrownum)
        console.log(this.user)
        let startDate = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
        this.form2.lendTime = startDate
        console.log(this.user)
        api.lendRecord.createLendRecord(this.form2).then(res =>{
          console.log(res)
        }).catch(error => {
          console.error('创建借阅记录失败:', error)
        })
        let form3 ={};
        form3.isbn = isbn;
        form3.bookName = name || '';
        form3.nickName = this.user.username;
        form3.id = this.user.id;
        form3.lendtime = startDate;
        let nowDate = new Date(startDate);
        nowDate.setDate(nowDate.getDate()+30);
        form3.deadtime = moment(nowDate).format("yyyy-MM-DD HH:mm:ss");
        form3.prolong  = 1;
        api.lendRecord.addBorrowRecord(form3).then(res =>{
          console.log(res)
          this.load()
        }).catch(error => {
          console.error('添加借阅记录失败:', error)
        })
      }).catch(error => {
        console.error('获取图书详情失败:', error)
        ElMessage.error('获取图书详情失败')
      })
    },
    add(){
      this.dialogVisible= true
      this.form ={}
    },
    save(){
      //ES6语法
      //地址,但是？IP与端口？+请求参数
      // this.form?这是自动保存在form中的，虽然显示时没有使用，但是这个对象中是有它的
      console.log('保存前的form数据:', this.form)
      if(this.form.bookId){
        api.book.updateBook(this.form).then(res =>{
        console.log('修改书籍响应:', res)
        console.log('响应类型:', typeof res)
        console.log('响应code:', res.code)
        console.log('响应code类型:', typeof res.code)
        // 操作成功，显示成功提示
        ElMessage({
          message: '修改书籍信息成功',
          type: 'success',
        })

        this.load()
        this.dialogVisible2 = false
      }).catch(error => {
        // 只有在请求失败时才显示错误提示
        console.error('修改书籍失败:', error)
        ElMessage.error('修改书籍失败')
      })
      }
      else {
        // 新增图书时不需要borrownum和status字段，使用totalStock和availableStock
        api.book.addBook(this.form).then(res =>{
        console.log('新增书籍响应:', res)
        console.log('响应类型:', typeof res)
        console.log('响应code:', res.code)
        console.log('响应code类型:', typeof res.code)
        // 操作成功，显示成功提示
        ElMessage.success('上架书籍成功')
        this.load()
        this.dialogVisible = false
      }).catch(error => {
        // 只有在请求失败时才显示错误提示
        console.error('上架书籍失败:', error)
        ElMessage.error('上架书籍失败')
      })
      }

    },
    // formatter(row) {:formatter="formatter"
    //   return row.address
    // },

    handleEdit(row){
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible2 = true
    },
    handleSizeChange(pageSize){
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum){
      this.pageNum = pageNum
      this.load()
    },
    toLook(){
      this.dialogVisible3 =true;
    },
  },
  data() {
    return {
      form: {},
      form2:{},
      form3:{},
      dialogVisible: false,
      dialogVisible2: false,
      search1:'',
      search2:'',
      search3:'',
      total:10,
      currentPage:1,
      pageSize: 10,
      tableData: [],
      user:{},
      number:0,
      bookData:[],
      isbnArray:[],
      outDateBook:[],
      numOfOutDataBook: 0,
      dialogVisible3 : true,
      ids: [],
    }
  },
  computed: {
    isAdmin() {
      return this.user.userType === 'ADMIN';
    }
  },
}
</script>
