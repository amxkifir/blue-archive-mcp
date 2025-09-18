# 语音功能测试 - Markdown音频链接

## 测试不同的音频链接格式

### 1. 标准Markdown链接格式
[🎵 播放音频](https://schaledb.com/audio/JP/Aru/Aru_Title.ogg)

### 2. HTML5音频标签（内嵌播放器）
<audio controls preload="none">
  <source src="https://schaledb.com/audio/JP/Aru/Aru_Title.ogg" type="audio/ogg">
  <source src="https://schaledb.com/audio/JP/Aru/Aru_Title.mp3" type="audio/mpeg">
  您的浏览器不支持音频播放。
</audio>

### 3. 带描述的音频链接
**🎵 音频播放选项:**
- [直接播放链接](https://schaledb.com/audio/JP/Aru/Aru_Title.ogg)
- <audio controls preload="none"><source src="https://schaledb.com/audio/JP/Aru/Aru_Title.ogg" type="audio/ogg">您的浏览器不支持音频播放。</audio>

**📝 转录文本:** アル、参上！

---

### 4. 多个音频文件示例

#### 阿露 - 标题语音
- [🎵 播放音频](https://schaledb.com/audio/JP/Aru/Aru_Title.ogg)
- <audio controls preload="none"><source src="https://schaledb.com/audio/JP/Aru/Aru_Title.ogg" type="audio/ogg">您的浏览器不支持音频播放。</audio>
- **转录:** アル、参上！

#### 阿露 - 问候语音
- [🎵 播放音频](https://schaledb.com/audio/JP/Aru/Aru_Lobby_1.ogg)
- <audio controls preload="none"><source src="https://schaledb.com/audio/JP/Aru/Aru_Lobby_1.ogg" type="audio/ogg">您的浏览器不支持音频播放。</audio>

---

## 💡 使用提示:
- 点击"直接播放链接"在新窗口中播放音频
- 使用HTML5音频控件进行内嵌播放
- 如果无法播放，请检查网络连接或尝试其他播放方式
- 音频文件来源：SchaleDB官方数据库

## 🔧 技术说明:
1. **Markdown链接**: 适用于大多数Markdown渲染器
2. **HTML5音频标签**: 提供更好的用户体验，支持内嵌播放
3. **多格式支持**: 同时提供OGG和MP3格式以提高兼容性
4. **预加载控制**: 使用preload="none"减少带宽消耗

## 📊 兼容性测试结果:
- ✅ GitHub Markdown: 支持链接，部分支持HTML5音频
- ✅ VS Code Markdown Preview: 完全支持
- ✅ Typora: 完全支持
- ✅ 大多数现代浏览器: 完全支持HTML5音频
- ⚠️ 某些静态站点生成器: 可能需要额外配置
