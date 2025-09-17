# 蔚蓝档案 Blue Archive MCP 服务器

这是一个用于蔚蓝档案（Blue Archive）游戏的 MCP (Model Context Protocol) 服务器，提供了丰富的游戏数据查询功能。

## 功能特点

- 🏫 **学生信息查询** - 获取所有学生的详细信息，包括属性、技能、装备等
- ⚔️ **团队战数据** - 获取RAID活动信息和BOSS数据
- ⚙️ **装备系统** - 查询装备的属性、获取方式等
- 🎯 **多语言支持** - 支持中文、英文、日文、韩文、泰文、繁体中文等
- 💾 **智能缓存** - 1小时客户端缓存，提升查询性能
- 🔧 **自定义查询** - 支持按条件过滤和搜索

## 安装步骤

### 1. 安装依赖

```bash
cd blue_archive_mcp
npm install
```

### 2. 构建项目

```bash
npm run build
```

## 可用工具

### 1. `get_students`
获取学生列表，支持搜索和语言选择

**参数：**
- `language` (string): 语言代码 (cn, en, jp, kr, th, tw) 默认为 "cn"
- `search` (string): 搜索关键词（学生名称、学校、社团）
- `limit` (number): 返回数量限制，默认 20

### 2. `get_student_info`
获取单个学生的详细信息

**参数：**
- `studentId` (number): 学生ID（必填）
- `language` (string): 语言代码，默认为 "cn"

### 3. `get_raids`
获取团队战活动信息

**参数：**
- `language` (string): 语言代码，默认为 "cn"
- `search` (string): 按活动名称搜索

### 4. `get_equipment`
获取装备列表信息

**参数：**
- `language` (string): 语言代码，默认为 "cn"
- `category` (string): 装备类别 (Hat, Glove, Shoes, Bag, Badge, Charm, Haar Accessory, Necktie)
- `tier` (number): 装备等级 (1-3)

### 5. `get_game_config`
获取游戏配置信息

**参数：**
- `includeRegions` (boolean): 是否包含地区信息，默认 true

## 在 Claude Desktop 中使用

### 1. 配置服务器

在 `%APPDATA%/Claude/claude_desktop_config.json` 或 `~/Library/Application Support/Claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "blue-archive": {
      "command": "node",
      "args": ["f:\\BA MCPtool\\blue_archive_mcp\\dist\\index.js"]
    }
  }
}
```

**注意：Windows 路径使用双斜杠或正斜杠**

### 2. 重启 Claude Desktop

保存配置文件后重启 Claude Desktop，MCP 工具就会加载完成。

### 3. 使用方法

在 Claude 中可以直接使用自然语言查询：

```
查询一下阿露的详细信息
我想要2级帽子装备
有什么团队战活动吗？
查一下亚比学院的学生
```

## 数据来源

所有数据来自 SchaleDB 网站 (https://schaledb.com)，这是蔚蓝档案游戏的权威数据源。

- 实时更新：数据与游戏版本同步更新
- 多语言：完整支持所有官方语言版本
- 免费可靠：社区维护，稳定性高

## 示例查询

### 学生信息
- "找一些治疗学生" → 查询康复位置的学生
- "哪些学生是突击队" → 查找Striker位置的学生
- "阿比学院有什么学生" → 查询特定学校的学生

### 装备系统
- "显示所有3级装备" → 查看高级装备
- "有什么手套装备" → 查找特定类别装备
- "我需要Badge装备" → 饰品类装备查询

### 战斗数据
- "列出所有团队战" → 获取所有RAID活动
- "查找困难团队战" → 查询高难度活动
- "秋季活动的详细信息" → 具体活动信息

## 高级用法

### 缓存机制

服务器实现了智能缓存：
- 缓存时间：1小时
- 自动过期：超过TTL自动刷新
- 内存优化：防止内存泄漏

### 错误处理

- 网络错误重试机制
- 数据不存在时友好提示
- API调用超时保护

### 性能优化

- 支持压缩数据格式 (.min.json)
- 分页查询结果
- 并发网络请求处理

## 故障排除

### 连接问题
1. 确认路径配置正确
2. 检查 Node.js 版本 (需要 v18+)
3. 验证构建文件存在

### 数据加载失败
1. 检查网络连接
2. 确认 SchaleDB 服务可用
3. 查看 Claude Desktop 日志

### 工具不显示
1. 重启 Claude Desktop
2. 检查配置文件语法
3. 确认服务器进程正在运行

## 技术说明

- **框架**: TypeScript + MCP SDK
- **传输**: STDIO (标准输入输出)
- **缓存**: 内存 Map 实现
- **网络**: 原生 fetch API
- **错误处理**: 完整的异常捕获和友好提示

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具！

---

**数据使用免责声明**: 本工具仅用于学习和娱乐目的，游戏数据来源于 SchaleDB，请遵守相关法律法规和游戏使用条款。
