import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import DataStore, {FLAG_STORAGE} from '../../expand/dao/DataStore';
import {handleData, getProjectModels} from '../ReduxUtil';

// 使用 createAsyncThunk 创建异步操作
// 下拉刷新
export const setRefreshPopularAsync = createAsyncThunk(
  'popular/setRefreshPopularAsync',
  async payload => {
    // payload: {storeName, url, pageSize, favoriteDao}
    const {storeName, url, pageSize, favoriteDao} = payload;
    let dataStore = new DataStore();
    const data = await dataStore.fetchData(url, FLAG_STORAGE.flag_popular);

    // console.log('response-setPopularDownRefreshAsync:', data);
    // resolvedData: {items, projectModels, storeName, pageIndex}
    const resolvedData = handleData({
      storeName,
      data,
      pageSize,
      favoriteDao,
    });
    // 这里的返回值会进入到fulfilled的action.payload中

    return resolvedData;
  },
);

// 上拉加载更多
export const setLoadMorePopularAsync = createAsyncThunk(
  'popular/setLoadMorePopularAsync',
  async payload => {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(async () => {
        // payload: {storeName, pageIndex, pageSize, dataArray, favoriteDao}
        const {storeName, pageIndex, pageSize, dataArray, favoriteDao} =
          payload;
        const min = Math.min(pageSize * pageIndex, dataArray.length);
        const projectModels = await getProjectModels(
          dataArray.slice(0, min),
          favoriteDao,
        );
        resolve({storeName, projectModels, pageIndex});

        clearTimeout(timeout);
        timeout = null;
      }, 500);
    });
    const res = await promise;
    return res;
  },
);

const popularSlice = createSlice({
  name: 'popular',
  initialState: {},
  reducers: {
    setFlushPopularFavorite(state, {payload}) {
      // payload: {storeName, pageIndex, pageSize, dataArray, favoriteDao}
      const {storeName, pageIndex, pageSize, dataArray, favoriteDao} = payload;
      const min = Math.min(pageSize * pageIndex, dataArray.length);
      const projectModels = getProjectModels(
        dataArray.slice(0, min),
        favoriteDao,
      );
      state[storeName] = {
        ...state[storeName],
        projectModels,
      };
    },
  },
  extraReducers: builder => {
    // 在extraReducers中处理异步操作的结果
    builder
      .addCase(setRefreshPopularAsync.pending, (state, {meta}) => {
        state[meta.arg.storeName] = {
          ...state[meta.arg.storeName],
          isLoading: true,
          hideLoadingMore: true,
        };
      })
      .addCase(setRefreshPopularAsync.fulfilled, (state, {payload}) => {
        state[payload.storeName] = {
          ...state[payload.storeName],
          isLoading: false,
          hideLoadingMore: false,
          // 需要经过加工得到的三个数据
          pageIndex: payload.pageIndex,
          items: payload.items, //原始数据
          projectModels: payload.projectModels, //此次要展示的数据
        };
      })
      .addCase(setRefreshPopularAsync.rejected, (state, {payload}) => {
        state[payload.storeName] = {
          ...state[payload.storeName],
          isLoading: false,
        };
      })
      .addCase(setLoadMorePopularAsync.fulfilled, (state, {payload}) => {
        state[payload.storeName] = {
          ...state[payload.storeName],
          projectModels: payload.projectModels,
          pageIndex: payload.pageIndex,
          hideLoadingMore: false,
        };
      })
      .addCase(setLoadMorePopularAsync.rejected, (state, {payload}) => {
        state[payload.storeName] = {
          ...state[payload.storeName],
          pageIndex: --payload.pageIndex,
          hideLoadingMore: false,
        };
      });
  },
  // selectors: {
  //   selectPopular: state => state.popular,
  // },
});

export const {setFlushPopularFavorite} = popularSlice.actions;

// export const {selectPopular} = popularSlice.selectors;

export default popularSlice.reducer;
