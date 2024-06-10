import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import FavoriteDao from '../../expand/dao/FavoriteDao';

// 使用 createAsyncThunk 创建异步操作
// 上拉加载更多
export const setLoadMoreFavoriteAsync = createAsyncThunk(
  'favorite/setLoadMoreFavoriteAsync',
  async payload => {
    const {storeName, isShowLoading} = payload;
    const res = await new FavoriteDao(storeName).getAllItems().then(items => {
      let projectModels = [];
      for (let i = 0; i < items.length; i++) {
        projectModels.push({item: items[i], isFavorite: true});
      }
      return {projectModels, storeName, isShowLoading};
    });

    // 这里的返回值会进入到fulfilled的action.payload中
    return res;
  },
);

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: {},
  reducers: {},
  extraReducers: builder => {
    // 在extraReducers中处理异步操作的结果
    builder
      .addCase(setLoadMoreFavoriteAsync.pending, (state, {meta}) => {
        state[meta.arg.storeName] = {
          ...state[meta.arg.storeName],
          isLoading: meta.arg.isShowLoading,
        };
      })
      .addCase(setLoadMoreFavoriteAsync.fulfilled, (state, {payload}) => {
        state[payload.storeName] = {
          ...state[payload.storeName],
          isLoading: false,
          projectModels: payload.projectModels, //此次要展示的数据
        };
      })
      .addCase(setLoadMoreFavoriteAsync.rejected, (state, {payload}) => {
        state[payload.storeName] = {
          ...state[payload.storeName],
          isLoading: false,
        };
      });
  },
});

export default favoriteSlice.reducer;
