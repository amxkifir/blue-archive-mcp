const https = require('https');

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function inspectStageData() {
  try {
    console.log('=== 关卡数据结构检查 ===');
    
    // 获取原始关卡数据
    const stagesData = await fetchData('https://schaledb.com/data/cn/stages.json');
    console.log('总关卡数量:', stagesData ? stagesData.length : 'undefined');
    console.log('数据类型:', typeof stagesData);
    console.log('是否为数组:', Array.isArray(stagesData));
    
    if (stagesData && stagesData.length > 0) {
      console.log('\n第一个关卡的完整结构:');
      console.log(JSON.stringify(stagesData[0], null, 2));
      
      console.log('\n前5个关卡的基本信息:');
      stagesData.slice(0, 5).forEach((stage, i) => {
        console.log(`${i+1}. ID: ${stage.Id}, Name: ${stage.Name}, Category: ${stage.Category}, Type: ${stage.Type}, Stage: ${stage.Stage}`);
      });
    } else if (stagesData) {
      console.log('\n数据结构:');
      console.log(JSON.stringify(stagesData, null, 2));
    }
    
    // 检查本地化数据
    console.log('\n=== 本地化数据检查 ===');
    const localizationData = await fetchData('https://schaledb.com/data/cn/localization.json');
    console.log('本地化数据类型:', typeof localizationData);
    if (localizationData && localizationData.StageTitle) {
      console.log('StageTitle 数据:');
      console.log(JSON.stringify(localizationData.StageTitle, null, 2));
    } else {
      console.log('未找到 StageTitle 本地化数据');
      if (localizationData) {
        console.log('可用的本地化键:', Object.keys(localizationData).slice(0, 10));
      }
    }
  } catch (error) {
    console.error('检查失败:', error.message);
    console.error('错误详情:', error);
  }
}

inspectStageData();