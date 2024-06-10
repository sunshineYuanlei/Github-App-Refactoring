import React, {useState, useEffect} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Text,
  DeviceInfo,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackPressComponent from '../common/BackPressComponent';
import SafeAreaViewPlus from 'react-native-safe-area-plus';
import LanguageDao, {FLAG_LANGUAGE} from '../expand/dao/LanguageDao';
import NavigationUtil from '../navigator/NavigationUtil';
import ArrayUtil from '../util/ArrayUtil';
import ViewUtil from '../util/ViewUtil';
import {useSelector, useDispatch} from 'react-redux';
import {setLoadLanguageAsync} from '../redux/languageSlice';
import cloneDeep from 'lodash/cloneDeep';

const CustomKeyPage = props => {
  // 全局主题
  const themeColor = useSelector(state => state.theme.theme);
  const dispatch = useDispinneratch();
  // 获取路由传参
  const {params} = props.route;
  // 获取标签/语言 flag
  let {flag, isRemoveKey} = params;
  // 判断当前是否为删除界面
  isRemoveKey = !!isRemoveKey;
  let key = flag === FLAG_LANGUAGE.flag_key ? 'keys' : 'languages';
  // 获取store中的语言和标签数据
  const language = useSelector(state => state.language);
  // 设置本地数据
  const [state, setState] = useState({keys: []});
  useEffect(() => {
    if (!language?.[key]?.length) {
      dispatch(setLoadLanguageAsync({flag, key}));
    } else {
      if (isRemoveKey) {
        const keys = language[key].map(val => ({...val, checked: false}));
        setState({...state, keys});
      } else {
        setState({...state, keys: language[key]});
      }
    }
  }, [language[key]]);

  // 实例化语言/标签数据库类, 以便对数据进行数据保存, 在使用的同时还需要 -- dispatch(setLoadLanguageAsync(flagKey, key));
  // 获取数据则直接使用 dispatch(setLoadLanguageAsync(flagKey, key))
  const languageDao = new LanguageDao(flag);

  // 设置物理返回键
  const backPress = new BackPressComponent({backPress: () => onBackPress()});
  const onBackPress = () => {
    onBack();
    return true;
  };
  // 绑定 backPress的生命周期处理, 其实质是事件监听的绑定与解除事件监听
  useEffect(() => {
    backPress.componentDidMount();
    return () => {
      backPress.componentWillUnmount();
    };
  }, []);

  // 离开页面二次提醒
  const [changeValues, setChangeValues] = useState([]);
  const onBack = () => {
    if (changeValues.length > 0) {
      Alert.alert('提示', '要保存修改吗？', [
        {
          text: '否',
          onPress: () => {
            leave();
          },
        },
        {
          text: '是',
          onPress: () => {
            onSave();
          },
        },
      ]);
    } else {
      // 没有修改直接离开当前导航
      leave();
    }
  };
  const leave = () => {
    NavigationUtil.goBack(props.navigation);
  };
  const onSave = () => {
    console.log('onSave', changeValues);
    // 如无修改则直接退出当前导航, 否则, 更新数据后离开当前导航
    if (changeValues.length === 0) {
      return leave();
    }
    // 区分是否删除
    let keys = cloneDeep(language[key]);
    if (isRemoveKey) {
      for (let i = 0; i < changeValues.length; i++) {
        ArrayUtil.remove(keys, changeValues[i], 'name');
      }
    }
    const updateKeys = isRemoveKey ? keys : state.keys;
    // 更新本地数据库
    languageDao.save(updateKeys);
    // 更新store
    dispatch(setLoadLanguageAsync({flag, key}));
    leave();
  };

  let title = isRemoveKey ? '标签移除' : '自定义标签';
  if (key === 'languages') title = '自定义语言';

  // 页面渲染
  const renderView = () => {
    let dataArray = state.keys;
    let len = dataArray?.length;
    if (!len) return;
    let views = [];
    for (let i = 0; i < len; i += 2) {
      views.push(
        <View key={i}>
          <View style={styles.item}>
            {renderCheckBox(dataArray[i], i)}
            {i + 1 < len && renderCheckBox(dataArray[i + 1], i + 1)}
          </View>
          <View style={styles.line} />
        </View>,
      );
    }
    return views;
  };

  const renderCheckBox = (data, index) => {
    return (
      <CheckBox
        key={index}
        style={{flex: 1, padding: 10}}
        onClick={() => onClick(data, index)}
        isChecked={data.checked}
        leftText={data.name}
        checkedImage={_checkedImage(true)}
        unCheckedImage={_checkedImage(false)}
      />
    );
  };

  const _checkedImage = checked => {
    return (
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={20}
        style={{
          color: themeColor,
        }}
      />
    );
  };

  const onClick = (data, index) => {
    // 保存修改记录
    setChangeValues(ArrayUtil.updateArray(changeValues, data));
    console.log('changeValues', changeValues);
    console.log('state', state.keys[index]);
    //更新state以便显示选中状态
    const myState = cloneDeep(state);
    myState.keys[index].checked = !data.checked;
    setState(myState);
  };

  return (
    <SafeAreaViewPlus style={styles.container} topColor={themeColor}>
      {/* 顶部状态栏 */}
      <View style={{...styles.inner, backgroundColor: themeColor}}>
        {ViewUtil.getLeftBackButton(onBack)}
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View>
          <Text style={{...styles.title, paddingRight: 10}} onPress={onSave}>
            {isRemoveKey ? '移除' : '保存'}
          </Text>
        </View>
      </View>
      <ScrollView>{renderView()}</ScrollView>
    </SafeAreaViewPlus>
  );
};

export default CustomKeyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0,
  },
  inner: {
    height: 37.5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    padding: 3,
    color: 'white',
    fontSize: 17,
  },
  item: {
    flexDirection: 'row',
  },
  line: {
    flex: 1,
    height: 0.3,
    backgroundColor: 'darkgray',
  },
});
