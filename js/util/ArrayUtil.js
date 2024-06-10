// import cloneDeep from 'lodash/cloneDeep';

export default class ArrayUtil {
  /**
   * 更新数组,若item已存在则将其从数组中删除,若不存在则将其添加到数组
   * **/
  static updateArray(array, item) {
    // let array = cloneDeep(arr);
    for (let i = 0, len = array?.length; i < len; i++) {
      let temp = array[i];
      if (item.name === temp.name) {
        array.splice(i, 1);
        return array;
      }
    }
    array.push(item);
    return array;
  }
  /**
   * 将数组中指定元素移除
   * @param array
   * @param item 要移除的item
   * @param id 要对比的属性，缺省则比较地址
   * @returns {*}
   */
  static remove(array, item, id) {
    // let array = cloneDeep(arr);
    if (!array) return [];
    for (let i = 0, l = array?.length; i < l; i++) {
      const val = array[i];
      if (item === val || (val && val[id] && val[id] === item[id])) {
        array.splice(i, 1);
        return array
      }
    }
    return array;
  }

  /**
   * 判断两个数组的是否相等
   * @return boolean true 数组长度相等且对应元素相等
   * */
  static isEqual(arr1, arr2) {
    if (!(arr1 && arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    for (let i = 0, l = arr1.length; i < l; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
}
