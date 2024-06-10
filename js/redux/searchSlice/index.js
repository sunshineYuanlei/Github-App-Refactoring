import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {handleData, getProjectModels, doCallBack} from '../ReduxUtil';
import ArrayUtil from '../../util/ArrayUtil';
import Utils from '../../util/Utils';

const API_URL = 'https://api.github.com/search/repositories?q=';
const QUERY_STR = '&sort=stars';
const CANCEL_TOKENS = [];

// 使用 createAsyncThunk 创建异步操作
// 发起搜索/下拉刷新
export const setRefreshSearchAsync = createAsyncThunk(
  'search/setRefreshSearchAsync',
  async payload => {
    // payload: {inputKey, popularKeys, token, favoriteDao, pageSize, callBack}
    const {inputKey, popularKeys, token, favoriteDao, pageSize, callBack} =
      payload;
    const fetchUrl = genFetchUrl(inputKey);
    const data = await new Promise((resolve, reject) => {
      fetch(fetchUrl)
        .then(response => {
          return response.json();
        })
        .then(response => {
          // hasCancel有两个功能, 既要判断, 又要删除
          if (hasCancel(token)) {
            reject();
            console.log('user cancel');
            return;
          }
          if (!response?.items?.length) {
            reject();
            const msg = `没找到关于${inputKey}的项目`;
            doCallBack(callBack, msg);
            return;
          }
          resolve(response);
        })
        .catch(e => {
          console.log(e);
          reject();
        });
    });
    const {items} = data;
    // resolvedData: {items, projectModels, storeName, pageIndex}, storeName此处不需要
    let resolvedData = await handleData({
      data: items,
      pageSize,
      favoriteDao,
    });

    const extraParams = {
      showBottomButton: !Utils.checkKeyIsExist(popularKeys, inputKey),
      inputKey,
    };

    resolvedData = {...resolvedData, ...extraParams};
    // 这里的返回值会进入到fulfilled的action.payload中
    return resolvedData;
  },
);

const genFetchUrl = key => {
  return API_URL + key + QUERY_STR;
};

const hasCancel = token => {
  if (CANCEL_TOKENS.includes(token)) {
    ArrayUtil.remove(CANCEL_TOKENS, token);
    return true;
  }

  return false;
};

// 上拉加载更多
export const setLoadMoreSearchAsync = createAsyncThunk(
  'search/setLoadMoreSearchAsync',
  async payload => {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(async () => {
        // payload: {pageIndex, pageSize, dataArray, favoriteDao}
        const {pageIndex, pageSize, dataArray, favoriteDao} = payload;
        const min = Math.min(pageSize * pageIndex, dataArray.length);
        const projectModels = await getProjectModels(
          dataArray.slice(0, min),
          favoriteDao,
        );
        resolve({projectModels, pageIndex});

        clearTimeout(timeout);
        timeout = null;
      }, 500);
    });
    const res = await promise;
    return res;
  },
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    inputKey: '',
    showText: '搜索',
    isLoading: false,
    hideLoadingMore: true, //默认隐藏加载更多
    items: [],
    projectModels: [], //要显示的数据
    showBottomButton: false,
    pageIndex: 1,
  },
  reducers: {
    setSearchCancel(state, {payload: token}) {
      token && CANCEL_TOKENS.push(token);

      state.isLoading = false;
      state.showText = '搜索';
    },
    setShowBottomButton(state, {payload: showBottomButton}) {
      state.showBottomButton = showBottomButton
    },
    initState(state, {payload}) {
      state.hideLoadingMore = true;
      state.items = [];
      state.projectModels = [];
      state.showBottomButton = false;
      state.pageIndex = 1;
    },
  },
  extraReducers: builder => {
    // 在extraReducers中处理异步操作的结果
    builder
      .addCase(setRefreshSearchAsync.pending, (state, {meta}) => {
        state.isLoading = true;
        state.hideLoadingMore = true;
        state.showBottomButton = false;
        state.showText = '取消';
      })
      .addCase(setRefreshSearchAsync.fulfilled, (state, {payload}) => {
        state.isLoading = false;
        state.hideLoadingMore = false;
        state.showText = '搜索';
        state.items = payload.items;
        state.projectModels = payload.projectModels;
        state.pageIndex = payload.pageIndex;
        state.showBottomButton = payload.showBottomButton;
        state.inputKey = payload.inputKey;
      })
      .addCase(setRefreshSearchAsync.rejected, (state, {payload}) => {
        state.isLoading = false;
        state.showText = '搜索';
      })
      .addCase(setLoadMoreSearchAsync.pending, (state, {meta}) => {
        statehideLoadingMore = false;
      })
      .addCase(setLoadMoreSearchAsync.fulfilled, (state, {payload}) => {
        state.projectModels = payload.projectModels;
        state.pageIndex = payload.pageIndex;
        state.hideLoadingMore = false;
      })
      .addCase(setLoadMoreSearchAsync.rejected, (state, {payload}) => {
        state.pageIndex = --payload.pageIndex;
        state.hideLoadingMore = false;
      });
  },
});

export const {setSearchCancel, setSearchInputKey, initState, setShowBottomButton} =
  searchSlice.actions;

export default searchSlice.reducer;
