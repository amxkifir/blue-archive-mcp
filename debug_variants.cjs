const fs = require('fs');

// 读取编译后的代码
const code = fs.readFileSync('./dist/index.js', 'utf8');

// 提取必要的类和函数
console.log('正在提取代码...');

// 提取Cache类
const cacheMatch = code.match(/class Cache \{[\s\S]*?\n\}/);
if (!cacheMatch) {
    console.error('无法找到Cache类');
    process.exit(1);
}

// 提取SchaleDBClient类 - 使用更精确的匹配
const clientStartIndex = code.indexOf('class SchaleDBClient {');
if (clientStartIndex === -1) {
    console.error('无法找到SchaleDBClient类');
    process.exit(1);
}

// 找到类的结束位置
let braceCount = 0;
let clientEndIndex = clientStartIndex;
let inClass = false;

for (let i = clientStartIndex; i < code.length; i++) {
    const char = code[i];
    if (char === '{') {
        braceCount++;
        inClass = true;
    } else if (char === '}') {
        braceCount--;
        if (inClass && braceCount === 0) {
            clientEndIndex = i + 1;
            break;
        }
    }
}

const clientCode = code.substring(clientStartIndex, clientEndIndex);

// 提取其他必要的函数和常量
const fetchDataMatch = code.match(/async function fetchData[\s\S]*?\n\}/);
const simplifyStudentDataMatch = code.match(/function simplifyStudentData[\s\S]*?\n\}/);

console.log('代码提取完成');

// 创建必要的依赖
const https = require('https');
const http = require('http');

// 模拟fetch函数
global.fetch = async function(url, options = {}) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https:') ? https : http;
        const request = lib.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    ok: response.statusCode >= 200 && response.statusCode < 300,
                    status: response.statusCode,
                    json: () => Promise.resolve(JSON.parse(data)),
                    text: () => Promise.resolve(data)
                });
            });
        });
        
        request.on('error', reject);
        
        if (options.body) {
            request.write(options.body);
        }
        
        request.end();
    });
};

// 执行提取的代码
try {
    eval(cacheMatch[0]);
    console.log('Cache类加载成功');
    
    if (fetchDataMatch) {
        eval(fetchDataMatch[0]);
        console.log('fetchData函数加载成功');
    }
    
    if (simplifyStudentDataMatch) {
        eval(simplifyStudentDataMatch[0]);
        console.log('simplifyStudentData函数加载成功');
    }
    
    eval(clientCode);
    console.log('SchaleDBClient类加载成功');
    
    // 创建客户端实例
    const client = new SchaleDBClient();
    console.log('客户端实例创建成功');
    
    // 测试数据获取
    async function testDataFetching() {
        console.log('\n=== 测试数据获取 ===');
        
        try {
            // 先测试获取少量学生数据
            console.log('正在获取学生数据...');
            const students = await client.getStudentsEnhanced({ 
                language: 'jp', 
                limit: 10 
            });
            
            console.log(`获取到 ${students.length} 个学生数据`);
            
            if (students.length > 0) {
                console.log('\n第一个学生数据结构:');
                const firstStudent = students[0];
                console.log('Name:', firstStudent.Name);
                console.log('PersonalName:', firstStudent.PersonalName);
                console.log('PathName:', firstStudent.PathName);
                console.log('所有字段:', Object.keys(firstStudent));
                
                // 查找包含括号的学生（变体）
                console.log('\n查找变体学生:');
                const variants = students.filter(s => s.Name && s.Name.includes('（'));
                console.log(`找到 ${variants.length} 个变体学生:`);
                variants.forEach(v => {
                    console.log(`- ${v.Name} (PersonalName: ${v.PersonalName})`);
                });
            }
            
            return students;
            
        } catch (error) {
            console.error('数据获取失败:', error.message);
            return [];
        }
    }
    
    // 测试变体发现功能
    async function testVariantFinding() {
        console.log('\n=== 测试变体发现功能 ===');
        
        try {
            console.log('正在查找アル的变体...');
            const variants = await client.findStudentVariants({
                name: 'アル',
                language: 'jp',
                includeOriginal: true
            });
            
            console.log(`找到 ${variants.length} 个变体:`);
            variants.forEach((variant, index) => {
                console.log(`${index + 1}. ${variant.name} (ID: ${variant.id}) - 相似度: ${variant.similarity}%`);
            });
            
        } catch (error) {
            console.error('变体发现失败:', error.message);
            console.error('错误堆栈:', error.stack);
        }
    }
    
    // 执行测试
    async function runTests() {
        const students = await testDataFetching();
        if (students.length > 0) {
            await testVariantFinding();
        }
    }
    
    runTests().catch(console.error);
    
} catch (error) {
    console.error('代码执行失败:', error.message);
    console.error('错误堆栈:', error.stack);
}