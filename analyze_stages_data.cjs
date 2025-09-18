const https = require('https');

async function fetchJson(url) {
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

async function analyzeStagesData() {
  console.log('=== 分析关卡数据结构 ===');
  
  try {
    const stagesData = await fetchJson('https://schaledb.com/data/cn/stages.json');
    
    console.log('数据类型:', typeof stagesData);
    console.log('是否为数组:', Array.isArray(stagesData));
    
    if (typeof stagesData === 'object' && !Array.isArray(stagesData)) {
      console.log('数据是对象，键值:', Object.keys(stagesData).slice(0, 10));
      
      // 获取第一个关卡数据
      const firstKey = Object.keys(stagesData)[0];
      const firstStage = stagesData[firstKey];
      console.log('\n第一个关卡数据:');
      console.log('Key:', firstKey);
      console.log('Value:', JSON.stringify(firstStage, null, 2));
      
      // 查找包含"1-1"相关的关卡
      console.log('\n查找可能的1-1关卡:');
      let count = 0;
      for (const [key, stage] of Object.entries(stagesData)) {
        if (count >= 5) break;
        
        const hasOneOne = 
          (stage.Name && stage.Name.includes('1-1')) ||
          (stage.StageNumber && stage.StageNumber.includes('1-1')) ||
          key.includes('1-1') ||
          (stage.Stage === 1 && stage.Chapter === 1);
          
        if (hasOneOne) {
          console.log(`找到: Key=${key}, Name=${stage.Name}, Stage=${stage.Stage}, Chapter=${stage.Chapter}`);
          count++;
        }
      }
      
      // 查找Normal难度关卡
      console.log('\n查找Normal难度关卡:');
      count = 0;
      for (const [key, stage] of Object.entries(stagesData)) {
        if (count >= 5) break;
        
        const isNormal = 
          (stage.Level && stage.Level.toString().toLowerCase().includes('normal')) ||
          (stage.Category && stage.Category.toLowerCase().includes('normal')) ||
          (stage.Type && stage.Type.toLowerCase().includes('normal')) ||
          (stage.Difficulty && stage.Difficulty.toLowerCase().includes('normal'));
          
        if (isNormal) {
          console.log(`找到: Key=${key}, Name=${stage.Name}, Level=${stage.Level}, Category=${stage.Category}, Type=${stage.Type}`);
          count++;
        }
      }
      
    } else if (Array.isArray(stagesData)) {
      console.log('数据是数组，长度:', stagesData.length);
      if (stagesData.length > 0) {
        console.log('\n第一个关卡数据:');
        console.log(JSON.stringify(stagesData[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  }
}

analyzeStagesData();