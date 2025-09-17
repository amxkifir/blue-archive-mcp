// 简单测试脚本验证API连接
import { spawn } from 'child_process';

async function testServer() {
  console.log('🧪 测试蔚蓝档案 MCP 服务器...\n');

  // 模拟 MCP 初始化
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  // 获取工具列表的消息
  const toolsMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  try {
    console.log('🚀 启动服务器...');
    const server = spawn('node', ['dist/index.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let responseBuffer = '';

    server.stdout.on('data', (data) => {
      responseBuffer += data.toString();
      console.log('📡 服务器响应:', data.toString());
    });

    server.stderr.on('data', (data) => {
      console.log('📝 服务器日志:', data.toString());
    });

    // 给服务器一些启动时间
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📨 发送初始化消息...');
    server.stdin.write(JSON.stringify(initMessage) + '\n');

    // 等待初始化响应
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📨 请求工具列表...');
    server.stdin.write(JSON.stringify(toolsMessage) + '\n');

    // 等待工具列表响应
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ 测试完成！');
    server.kill();

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testServer();
