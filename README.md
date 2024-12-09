# 环境依赖

- Node.js
- npm
- Vue.js
- Element-ui
- ffmpeg
- python
- mysql

# 技术难点与攻坚过程

## 网页检索电脑音乐文件

- 难点1
- 参考网易云音乐客户端检索电脑音频文件，用户能够添加多个文件夹，并且根据需求去选择检索哪些文件夹里的音频数据
- 引发问题：用户上传音频到网页具有时效性，根据浏览器安全策略，无法保存用户上传的文件夹路径，导致用户每次检索都需要重新选择文件夹，增加了用户操作复杂度。

---

- 攻坚1
- 更改结构，用户不能够选择检索哪些文件夹里的音频数据，添加的文件夹全部检索

```html
        <div class="online-main">
            <div v-for="(folder, index) in tempFolders" :key="index">
              <input
                type="checkbox"
                :id="'folder-' + index"
                v-model="folder.selected"
              />
              <label :for="'folder-' + index">{{ folder.name }}</label>
            </div>
          </div>
```

原有结构，采用input + checkbox属性，实现多个文件夹的选择

调整为默认选择所有文件夹结构

```html
<div class="online-main">
  <div 
    v-for="(folder, index) in tempFolders" 
    :key="index" 
    class="folder-item"
    :class="{ selected: folder.selected }"
  >
    <span class="folder-icon">✔</span>
    <span class="folder-name">{{ folder.name }}</span>
  </div>
</div>
```

- 引发问题：检索完毕后，用户更改本地文件夹以及文件，用户再次重新添加文件夹上传最新的音频数据，以前保留的音频数据可能存在重复性

---

- 攻坚2
- 添加过滤限制，拼接现有音频数据，使用map数据结构进行去重处理，重复部分保留旧的，去除新的

- 存在问题：前端处理音频的时候，只会保留当前会话的音频数据，如果前端进行了一些页面切换或者选项卡切换，会导致音频数据丢失

---

- 攻坚3
- 舍弃前端保存音频数据，采用后端保存音频数据，前端只负责展示音频数据，前端传递音频数据给后端，后端返回前端要显示的内容，当前端需要播放音乐的时候，将当前音乐的id传递给后端，由后端返回音频数据，前端播放音乐

- 优势：解决前端无法保存音频数据的情况，每一次播放都由后端重新生成一个新的临时音频链接供前端播放，解决了前端页面切换导致音频数据丢失的问题

---