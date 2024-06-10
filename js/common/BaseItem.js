import {PropTypes} from 'prop-types';
import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class BaseItem extends Component {
  static propTypes = {
    projectModel: PropTypes.object, // ts类型集合库, 开发提速
    onSelect: PropTypes.func,
    onFavorite: PropTypes.func,
    theme: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      isFavorite: this.props.projectModel.isFavorite,
    };
  }

  /**
   * 牢记：https://github.com/reactjs/rfcs/blob/master/text/0006-static-lifecycle-methods.md
   * componentWillReceiveProps在新版React中不能再用了
   * @param nextProps
   * @param prevState
   * @returns {*}
   */
  // 监听外层传入的props的变化, 同步更新state, 解决react单向数据流的问题
  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const isFavorite = nextProps.projectModel.isFavorite;
  //   if (prevState.isFavorite !== isFavorite) {
  //     return {
  //       isFavorite: isFavorite,
  //     };
  //   }
  //   return null;
  // }
  setFavoriteState(isFavorite) {
    this.props.projectModel.isFavorite = isFavorite;
    this.setState({
        isFavorite: isFavorite,
    })
  }

  onItemClick() {
    this.props.onSelect(isFavorite => {
      this.setFavoriteState(isFavorite);
    });
  }

  onPressFavorite() {
    this.setFavoriteState(!this.state.isFavorite);
    this.props.onFavorite(this.props.projectModel.item, !this.state.isFavorite);
  }
  _favoriteIcon() {
    const {theme} = this.props;
    return (
      <TouchableOpacity
        style={{padding: 6}}
        underlayColor="transparent"
        onPress={() => this.onPressFavorite()}>
        <FontAwesome
          name={this.state.isFavorite ? 'star' : 'star-o'}
          size={26}
          style={{color: theme.themeColor}}
        />
      </TouchableOpacity>
    );
  }
}
