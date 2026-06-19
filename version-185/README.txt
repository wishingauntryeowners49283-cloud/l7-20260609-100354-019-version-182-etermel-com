欧美精品视频网静态站点

生成结果：
- 首页：index.html
- 分类总览：categories.html
- 排行榜：ranking.html
- 搜索页：search.html
- 全部影片：category/all.html
- 影片详情页：movies/0001.html 至 movies/2000.html
- 共解析影片：2000 部

图片说明：
页面已按要求引用网站顶级目录下的 1.jpg 到 150.jpg。部署时把对应 JPG 文件放在与 index.html 同级的位置即可。

播放器说明：
上传的数据文件没有单独提供每部影片的 m3u8 字段，生成时使用原 JS 文件中解析出的 HLS 播放源轮换绑定；如需替换为真实片源，可批量修改详情页 data-m3u8 属性。
