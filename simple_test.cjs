console.log('开始测试...');

try {
  const { BlueArchiveMCPServer } = require('./dist/index.js');
  console.log('成功导入 BlueArchiveMCPServer');
  
  const server = new BlueArchiveMCPServer();
  console.log('成功创建服务器实例');
  
  console.log('测试完成');
} catch (error) {
  console.error('测试失败:', error);
  console.error('错误堆栈:', error.stack);
}