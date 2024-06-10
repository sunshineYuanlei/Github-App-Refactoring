/**
 * 处理下拉刷新的数据
 * @param actionType
 * @param dispatch
 * @param storeName
 * @param data
 * @param pageSize
 * @param favoriteDao
 */
import ProjectModel from '../model/ProjectModel';
import Utils from '../util/Utils';
/**
 * 处理数据
 * @param actionType
 * @param dispatch
 * @param storeName
 * @param data
 * @param pageSize
 * @param favoriteDao
 * @param params 其他参数
 */
export async function handleData({storeName, data, pageSize, favoriteDao}) {
  let fixItems = [];
  const myData = data?.data;
  if (myData) {
    if (Array.isArray(myData)) {
      fixItems = myData;
    } else if (Array.isArray(myData.items)) {
      fixItems = myData.items;
    }
  } else {
    fixItems = data;
  }
  //第一次要加载的数据
  let showItems =
    pageSize > fixItems.length ? fixItems : fixItems.slice(0, pageSize);

  const projectModels = await getProjectModels(showItems, favoriteDao);
  const res = {
    items: fixItems,
    projectModels: projectModels,
    storeName,
    pageIndex: 1,
  };
  return res;
}

/**
 * 通过本地的收藏状态包装Item
 * @param showItems
 * @param favoriteDao
 * @param callback
 * @returns {Promise<void>}
 * @private
 */
export async function getProjectModels(showItems, favoriteDao) {
  let keys = [];
  try {
    //获取收藏的key
    keys = await favoriteDao.getFavoriteKeys();
  } catch (e) {
    console.log(e);
  }
  let projectModels = []; // 数据结构为 [item: Object, isFavorite: Boolean]
  for (let i = 0, len = showItems.length; i < len; i++) {
    projectModels.push(
      new ProjectModel(showItems[i], Utils.checkFavorite(showItems[i], keys)),
    );
  }
  return projectModels;
}

// 以下这种实现方式也可, 更加简洁清晰
export async function _getProjectModels(showItems, favoriteDao) {
  let keys = [];
  try {
    keys = await favoriteDao.getFavoriteKeys();
  } catch (e) {
    console.log(e);
  }
  let projectModels = [];
  for (let i = 0; i < showItems.length; i++) {
    let model = {
      item: showItems,
      isFavorite: Utils.checkFavorite(showItems[i], keys),
    };
    projectModels.push(model);
  }
}

export const doCallBack = (callBack, object) => {
  if (typeof callBack === 'function') {
    callBack(object);
  }
};
