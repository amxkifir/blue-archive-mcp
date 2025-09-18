const { spawn } = require('child_process');

async function testMCPServer() {
  console.log('=== 蔚蓝档案 MCP 服务器全面功能测试 ===\n');
  
  const tests = [
    {
      name: '获取学生列表',
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'get_students',
          arguments: { language: 'cn', limit: 5, detailed: false }
        }
      }
    },
    {
      name: '通过名称查找学生',
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get_student_by_name',
          arguments: { name: '阿露', language: 'cn', detailed: false }
        }
      }
    },
    {
      name: '查找学生变体',
      request: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'find_student_variants',
          arguments: { name: 'アル', language: 'jp', includeOriginal: true }
        }
      }
    },
    {
      name: '获取总力战信息',
      request: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_raids',
          arguments: { language: 'cn', detailed: false }
        }
      }
    },
    {
      name: '获取装备信息',
      request: {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'get_equipment',
          arguments: { language: 'cn', limit: 3, detailed: false }
        }
      }
    }
  ];

  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let testIndex = 0;
  
  function runNextTest() {
    if (testIndex >= tests.length) {
      console.log('\n=== 所有测试完成 ===');
      server.kill();
      return;
    }
    
    const test = tests[testIndex++];
    console.log(`\n[${testIndex}] 测试: ${test.name}`);
    
    server.stdin.write(JSON.stringify(test.request) + '\n');
    
    setTimeout(runNextTest, 2000); // 2秒后运行下一个测试
  }

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const response = JSON.parse(line);
        if (response.result && response.result.content) {
          console.log('✅ 响应成功:', response.result.content[0].text.substring(0, 100) + '...');
        } else if (response.error) {
          console.log('❌ 错误:', response.error.message);
        }
      } catch (e) {
        // 忽略非JSON输出
      }
    });
  });

  server.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('running on stdio')) {
      console.log('🚀 MCP服务器已启动，开始测试...');
      setTimeout(runNextTest, 1000);
    }
  });

  server.on('close', (code) => {
    console.log(`\n服务器已关闭，退出码: ${code}`);
  });
}

testMCPServer().catch(console.error);