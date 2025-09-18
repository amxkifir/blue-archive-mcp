const https = require('https');

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function debugVoiceData() {
  try {
    console.log('正在获取语音数据...');
    const voiceData = await fetchData('https://schaledb.com/data/cn/voice.json');
    
    // 查找爱露的语音数据 (ID: 10000)
    const studentId = 10000;
    const studentVoices = voiceData[studentId];
    
    if (!studentVoices) {
      console.log('未找到学生语音数据');
      return;
    }
    
    console.log('=== 爱露的语音数据结构分析 ===');
    console.log('可用语音类型:', Object.keys(studentVoices));
    
    // 分析每种语音类型的数据结构
    Object.keys(studentVoices).forEach(voiceType => {
      console.log(`\n--- ${voiceType} 语音类型 ---`);
      const voices = studentVoices[voiceType];
      
      console.log('数据类型:', typeof voices);
      console.log('是否为数组:', Array.isArray(voices));
      
      if (Array.isArray(voices)) {
        console.log('数组长度:', voices.length);
        if (voices.length > 0) {
          console.log('第一个元素结构:', JSON.stringify(voices[0], null, 2));
          if (voices.length > 1) {
            console.log('第二个元素结构:', JSON.stringify(voices[1], null, 2));
          }
        }
      } else if (typeof voices === 'object' && voices !== null) {
        console.log('对象键:', Object.keys(voices));
        const firstKey = Object.keys(voices)[0];
        if (firstKey) {
          console.log(`第一个键 "${firstKey}" 的值:`, JSON.stringify(voices[firstKey], null, 2));
        }
      } else {
        console.log('值:', voices);
      }
    });
    
    // 特别检查NORMAL类型的详细结构
    if (studentVoices.NORMAL) {
      console.log('\n=== NORMAL 语音详细分析 ===');
      const normalVoices = studentVoices.NORMAL;
      
      if (Array.isArray(normalVoices)) {
        normalVoices.slice(0, 3).forEach((voice, index) => {
          console.log(`\n第${index + 1}个NORMAL语音:`, JSON.stringify(voice, null, 2));
        });
      } else {
        Object.keys(normalVoices).slice(0, 3).forEach(key => {
          console.log(`\n键 "${key}":`, JSON.stringify(normalVoices[key], null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('获取数据时出错:', error.message);
  }
}

debugVoiceData();