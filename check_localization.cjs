const https = require('https');

console.log('正在检查关卡本地化数据...');

// 检查本地化文件
const localizationUrl = 'https://schaledb.com/data/cn/localization.json';

https.get(localizationUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const localization = JSON.parse(data);
      
      console.log('\n=== 本地化数据结构分析 ===');
      console.log('数据类型:', typeof localization);
      console.log('顶级键:', Object.keys(localization));
      
      // 查找关卡相关的本地化数据
      if (localization.Stage) {
        console.log('\n=== Stage 本地化数据 ===');
        console.log('Stage 数据类型:', typeof localization.Stage);
        const stageKeys = Object.keys(localization.Stage);
        console.log('Stage 键数量:', stageKeys.length);
        console.log('前10个 Stage 键:', stageKeys.slice(0, 10));
        
        // 检查第一个关卡的本地化数据
        const firstKey = stageKeys[0];
        if (firstKey) {
          console.log(`\n=== 关卡 ${firstKey} 的本地化数据 ===`);
          console.log(JSON.stringify(localization.Stage[firstKey], null, 2));
        }
        
        // 查找包含"1-1"的关卡名称
        console.log('\n=== 搜索包含"1-1"的关卡名称 ===');
        let found = false;
        for (const [key, value] of Object.entries(localization.Stage)) {
          if (typeof value === 'string' && value.includes('1-1')) {
            console.log(`关卡ID ${key}: ${value}`);
            found = true;
          }
        }
        if (!found) {
          console.log('未在Stage本地化数据中找到包含"1-1"的关卡');
        }
      }
      
      // 检查其他可能的关卡相关字段
      const possibleStageFields = ['StageName', 'StageTitle', 'Campaign', 'Mission'];
      possibleStageFields.forEach(field => {
        if (localization[field]) {
          console.log(`\n=== ${field} 本地化数据 ===`);
          console.log(`${field} 数据类型:`, typeof localization[field]);
          const keys = Object.keys(localization[field]);
          console.log(`${field} 键数量:`, keys.length);
          console.log(`前5个 ${field} 键:`, keys.slice(0, 5));
          
          // 检查第一个条目
          if (keys.length > 0) {
            console.log(`第一个 ${field} 条目:`, localization[field][keys[0]]);
          }
        }
      });
      
    } catch (error) {
      console.error('解析本地化JSON失败:', error.message);
    }
  });
  
}).on('error', (error) => {
  console.error('请求本地化数据失败:', error.message);
});