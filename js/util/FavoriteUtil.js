export default class FavoriteUtil {
  /**
   * favoriteIcon单击回调函数
   * @param favoriteDao
   * @param item
   * @param isFavorite
   */
  static onFavorite(favoriteDao, item, isFavorite) {
    //fix const key = flag === FLAG_STORAGE.flag_trending ? item.fullName : item.id.toString();
    const key = (item.id || item.fullName) + '';
    if (isFavorite) {
      favoriteDao.saveFavoriteItem(key, JSON.stringify(item));
    } else {
      favoriteDao.removeFavoriteItem(key);
    }
  }
}
