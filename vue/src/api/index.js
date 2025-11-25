// API主入口文件，导出所有API模块
import * as userApi from './user';
import * as dashboardApi from './dashboard';
import * as commonApi from './common';
import * as bookApi from './book';
import * as lendRecordApi from './lendRecord';

// 导出所有API
export default {
  user: userApi,
  dashboard: dashboardApi,
  common: commonApi,
  book: bookApi,
  lendRecord: lendRecordApi
};

// 也可以直接导出各个模块，方便按需引入
export { userApi, dashboardApi, commonApi, bookApi, lendRecordApi };
