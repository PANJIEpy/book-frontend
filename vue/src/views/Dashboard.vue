<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in cards" :key="item.title">
        <el-card class="box-card">
          <div slot="header" class="clearfix">{{ item.title }}</div>
          <div class="text item">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="item.icon" style="width: 100px"></use>
            </svg>
            <span class="text">{{ item.data }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div ref="myTimer" style="margin-left: 15px;font-weight: 550;"></div>
    <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="margin-left: 5px"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {ElMessage} from "element-plus";
import api from '../api';
import { User, Document } from '@element-plus/icons-vue';

export default {
  components: {
    User,
    Document
  },
  data() {
    return {
      cards: [
        { title: '已借阅', data: 100, icon: '#iconlend-record-pro' },
        { title: '总访问', data: 100, icon: '#iconvisit'   },
        { title: '图书数', data: 100, icon: '#iconbook-pro' },
        { title: '用户数', data: 1000, icon: '#iconpopulation' }
      ],
      data:{}
    }
  },
  created() {

  },
  mounted() {
    this.circleTimer()

    // 初始化图表实例
    var myChart = echarts.init(document.getElementById('main'))
    
    // 获取所有统计数据
    Promise.all([
      api.dashboard.getUserCount(),
      api.dashboard.getBookCount(),
      api.dashboard.getBorrowCount(),
      api.dashboard.getVisitCount(),
      api.dashboard.getBorrowChartData()
    ]).then(([userRes, bookRes, borrowRes, visitRes, chartRes]) => {
      // 更新卡片数据
      if (userRes.code === 0 || userRes.code === 200) {
        this.cards[3].data = userRes.data || 0
      }
      
      if (bookRes.code === 0 || bookRes.code === 200) {
        this.cards[2].data = bookRes.data || 0
      }
      
      if (borrowRes.code === 0 || borrowRes.code === 200) {
        this.cards[0].data = borrowRes.data || 0
      }
      
      if (visitRes.code === 0 || visitRes.code === 200) {
        this.cards[1].data = visitRes.data || 0
      }
      
      // 准备图表数据
      let chartData = {
        labels: this.cards.map(item => item.title),
        values: [
          this.cards[0].data,
          this.cards[1].data,
          this.cards[2].data,
          this.cards[3].data
        ]
      }
      
      // 如果后端返回了图表数据，则使用后端数据
      if (chartRes.code === 0 || chartRes.code === 200 && chartRes.data) {
        chartData = chartRes.data
      }
      
      // 绘制图表
      myChart.setOption({
        title: {
          text: '统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.labels || this.cards.map(item => item.title),
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar',
            label: { 
              show: true,
              position: 'top'
            },
            barWidth: '25%',
            data: [
              {
                value: chartData.values ? chartData.values[0] : this.cards[0].data,
                itemStyle: { color: '#5470c6' }
              },
              {
                value: chartData.values ? chartData.values[1] : this.cards[1].data,
                itemStyle: { color: '#91cc75' }
              },
              {
                value: chartData.values ? chartData.values[2] : this.cards[2].data,
                itemStyle: { color: '#fac858' }
              },
              {
                value: chartData.values ? chartData.values[3] : this.cards[3].data,
                itemStyle: { color: '#ee6666' }
              }
            ]
          }
        ]
      })
    })
      .catch(error => {
          console.error('获取图表数据失败，使用默认数据', error)
          // 使用默认数据
          myChart.setOption({
            title: {
              text: '统计'
            },
            tooltip: {
              trigger: 'axis'
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: this.cards.map(item => item.title),
              axisTick: {
                alignWithLabel: true
              }
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                type: 'bar',
                label: { show: true },
                barWidth: '25%',
                data: [
                  {
                    value: this.cards[0].data,
                    itemStyle: { color: '#5470c6' }
                  },
                  {
                    value: this.cards[1].data,
                    itemStyle: { color: '#91cc75' }
                  },
                  {
                    value: this.cards[2].data,
                    itemStyle: { color: '#fac858' }
                  },
                  {
                    value: this.cards[3].data,
                    itemStyle: { color: '#ee6666' }
                  }
                ]
              }
            ]
          })
        })
      window.addEventListener('resize', () => {
        myChart.resize()
      })
  },
  methods: {
    circleTimer() {
      this.getTimer()
      setInterval(() => {
        this.getTimer()
      }, 1000)
    },
    getTimer() {
      var d = new Date()
      var t = d.toLocaleString()
      // 使用Vue的ref安全访问DOM元素
      if (this.$refs.myTimer) {
        this.$refs.myTimer.innerHTML = t
      }
    }
  }
}
</script>

<style scoped>
.box-card {
   width: 80%;
  margin-bottom: 25px;
  margin-left: 10px;
}

.clearfix {
  text-align: center;
  font-size: 15px;
}

.text {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  vertical-align: super;
}

#main {
  width: 100%;
  height: 450px;
  margin-top: 20px;
}

.icon {
  width: 50px;
  height: 50px;
  padding-top: 5px;
  padding-right: 10px;
}
</style>