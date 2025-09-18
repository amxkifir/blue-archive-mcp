const fs = require('fs');
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

// 读取编译后的代码
let code = fs.readFileSync('./dist/index.js', 'utf8');

// 在代码末尾添加测试代码
const testCode = `

// 测试代码
async function testVariants() {
    console.log('开始测试变体发现功能...');
    
    const client = new SchaleDBClient();
    
    try {
        // 先测试获取学生数据
        console.log('正在获取学生数据...');
        const students = await client.getStudentsEnhanced({ 
            language: 'jp', 
            limit: 20 
        });
        
        console.log(\`获取到 \${students.length} 个学生数据\`);
        
        if (students.length > 0) {
            console.log('\\n第一个学生数据:');
            const first = students[0];
            console.log('Name:', first.Name);
            console.log('Id:', first.Id);
            console.log('所有字段:', Object.keys(first));
            
            // 查找变体学生
            const variants = students.filter(s => s.Name && s.Name.includes('（'));
            console.log(\`\\n找到 \${variants.length} 个变体学生:\`);
            variants.slice(0, 5).forEach(v => {
                console.log(\`- \${v.Name} (ID: \${v.Id})\`);
            });
            
            // 测试变体发现功能
            console.log('\\n=== 测试变体发现功能 ===');
            const foundVariants = await client.findStudentVariants({
                name: 'アル',
                language: 'jp',
                includeOriginal: true
            });
            
            console.log(\`找到 \${foundVariants.length} 个アル的变体:\`);
            foundVariants.forEach((variant, index) => {
                console.log(\`\${index + 1}. \${variant.name} (ID: \${variant.id}) - 相似度: \${variant.similarity}%\`);
            });
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
        console.error('错误堆栈:', error.stack);
    }
}

// 运行测试
testVariants().catch(console.error);
`;

// 将测试代码添加到原代码中
code = code + testCode;

// 写入临时文件
fs.writeFileSync('./temp_test.cjs', code);

console.log('测试文件已创建，正在执行...');

// 执行测试
require('./temp_test.cjs');