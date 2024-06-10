import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import ThemeDao from '../../expand/dao/ThemeDao';
import ThemeFactory, {ThemeFlags} from '../../res/styles/ThemeFactory';

// 使用 createAsyncThunk 创建异步操作
export const getThemeChangeAsync = createAsyncThunk(
  'theme/setThemeChangeAsync',
  async payload => {
    const res = await new ThemeDao().getTheme()
    // 这里的返回值会进入到fulfilled的action.payload中
    return res;
  },
);

const Default = ThemeFactory.createTheme(ThemeFlags.Default);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: Default.theme,
    styles: Default.styles,
    isShowCustomThemeView: false,
  },
  reducers: {
    // setTheme(state, action) {
    //   state.theme = action.payload;
    // },
    setShowCustomThemeView(state, action) {
      state.isShowCustomThemeView = action.payload;
    },
    setCustomTheme(state, action) {
      const {theme, styles} = ThemeFactory.createTheme(action.payload);
      state.theme = theme;
      state.styles = styles;
    },
  },
  extraReducers: builder => {
    // 在extraReducers中处理异步操作的结果
    builder.addCase(getThemeChangeAsync.fulfilled, (state, {payload}) => {
      const {theme, styles} = payload;
      state.theme = theme;
      state.styles = styles;
    });
  },
});

export const {setShowCustomThemeView, setCustomTheme} = themeSlice.actions;
export default themeSlice.reducer;
