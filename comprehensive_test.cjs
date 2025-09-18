const { BlueArchiveMCPServer } = require('./dist/index.js');

async function comprehensiveTest() {
  console.log('开始初始化服务器...');
  const server = new BlueArchiveMCPServer();
  console.log('服务器初始化完成');
  
  console.log('=== 全面测试关卡搜索功能 ===\n');

  try {
    // 基础搜索测试
    console.log('=== 基础搜索测试 ===');
    const basicSearch = await server.client.getStagesEnhanced({ search: '1-1' });
    console.log('搜索 "1-1":', basicSearch.slice(0, 3));

    // 章节筛选测试
    console.log('\n=== 章节筛选测试 ===');
    const chapterSearch = await server.client.getStagesEnhanced({ chapter: '1' });
    console.log('章节 "1":', chapterSearch.slice(0, 3));

    // 难度筛选测试
    console.log('\n=== 难度筛选测试 ===');
    const difficultySearch = await server.client.getStagesEnhanced({ difficulty: '困难' });
    console.log('难度 "困难":', difficultySearch.slice(0, 3));

    // 类别筛选测试
    console.log('\n=== 类别筛选测试 ===');
    const categorySearch = await server.client.getStagesEnhanced({ area: '主线' });
    console.log('类别 "主线":', categorySearch.slice(0, 3));

    // 组合搜索测试
    console.log('\n=== 组合搜索测试 ===');
    const combinedSearch = await server.client.getStagesEnhanced({ 
      search: '1-1', 
      area: '主线',
      chapter: '1'
    });
    console.log('组合搜索 (1-1 + 主线 + 章节1):', combinedSearch.slice(0, 3));

    // 地形搜索测试
    console.log('\n=== 地形搜索测试 ===');
    const terrainSearch = await server.client.getStagesEnhanced({ search: '市街' });
    console.log('地形 "市街":', terrainSearch.slice(0, 3));

    console.log('✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

comprehensiveTest();