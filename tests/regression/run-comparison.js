#!/usr/bin/env node

/**
 * 版本对比测试执行脚本
 * 
 * 使用方法:
 * npm run test:regression
 * 或
 * node tests/regression/run-comparison.js
 */

import VersionComparisonTest from './version-comparison.js';

async function main() {
  console.log('🚀 启动Flowy版本对比测试');
  console.log('='.repeat(60));
  console.log('📋 测试目标: 确保重构版本与原始版本功能完全一致');
  console.log('📂 原始版本: docs/src-demo/index.html');
  console.log('📂 重构版本: docs/refactor-demo/index.html');
  console.log('='.repeat(60));

  const tester = new VersionComparisonTest();
  
  try {
    // 初始化测试环境
    await tester.setup();
    
    // 执行完整的对比测试
    const report = await tester.runFullComparisonTest();
    
    // 输出最终结果
    console.log('\n🎯 最终结果:');
    if (report.failed === 0) {
      console.log('🎉 所有测试通过！重构版本与原始版本功能完全一致！');
      process.exit(0);
    } else {
      console.log('⚠️  发现功能差异，需要进一步修复。');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  } finally {
    // 清理测试环境
    await tester.cleanup();
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

// 执行主函数
main().catch(console.error);
