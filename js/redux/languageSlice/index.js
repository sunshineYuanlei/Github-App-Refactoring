import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import LanguageDao from '../../expand/dao/LanguageDao';

// 使用 createAsyncThunk 创建异步操作
export const setLoadLanguageAsync = createAsyncThunk(
  'language/setLoadLanguageAsync',
  async payload => {
    const {flag, key} = payload;
    const data = await new LanguageDao(flag).fetch();
    // 这里的返回值会进入到fulfilled的action.payload中
    return {data, key};
  },
);

const languageSlice = createSlice({
  name: 'language',
  initialState: {languages: [], keys: []},
  reducers: {},
  extraReducers: builder => {
    // 在extraReducers中处理异步操作的结果
    builder.addCase(setLoadLanguageAsync.fulfilled, (state, {payload}) => {
      state[payload.key] = payload.data;
    });
  },
});

export default languageSlice.reducer;
