/**
 * 关键Bug复现测试
 * 专门复现用户报告的问题：
 * "删除所有块后，重新拖拽第二个块时吸附功能不工作"
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入隔离测试环境
const { withIsolatedTest } = require('../isolated-test-environment');

describe('关键Bug复现测试', () => {
  describe('用户报告的吸附功能失效问题', () => {
    test('复现：删除所有块后重新拖拽第二个块吸附功能失效', async () => {
      await withIsolatedTest('critical-bug-reproduction', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        // 初始化 flowy
        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('🔍 开始复现用户报告的问题...');

        // 步骤1：首次在画布上进行块操作（应该正常工作）
        console.log('📝 步骤1：创建第一个块');
        const firstBlock1 = testInstance.createTestDragElement('1', 'First Block');
        testInstance.simulateMouseDown(firstBlock1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('📝 步骤2：创建第二个块并测试吸附（应该正常）');
        const secondBlock1 = testInstance.createTestDragElement('2', 'Second Block');
        testInstance.simulateMouseDown(secondBlock1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(420, 380); // 接近第一个块
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 验证第一次吸附功能正常
        let visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        console.log(`🔍 第一次吸附测试 - 可见indicator数量: ${visibleIndicators.length}`);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证两个块都被创建
        let output = testInstance.flowy.output();
        console.log(`📊 第一轮创建后的块数量: ${output ? output.length : 0}`);

        // 步骤3：点击删除，清空所有块
        console.log('🗑️ 步骤3：删除所有块');
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证删除后状态
        output = testInstance.flowy.output();
        console.log(`📊 删除后的块数量: ${output ? output.length : 0}`);

        // 步骤4：重新拖拽第一个块（应该正常）
        console.log('📝 步骤4：重新创建第一个块');
        const firstBlock2 = testInstance.createTestDragElement('1', 'New First Block');
        testInstance.simulateMouseDown(firstBlock2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 步骤5：再次拖拽第二个块，测试吸附功能（这里应该失效）
        console.log('🔍 步骤5：测试第二个块的吸附功能（关键测试点）');
        const secondBlock2 = testInstance.createTestDragElement('2', 'New Second Block');
        testInstance.simulateMouseDown(secondBlock2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(420, 380); // 接近第一个块
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 关键验证：第二次吸附功能是否正常
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        console.log(`🔍 第二次吸附测试 - 可见indicator数量: ${visibleIndicators.length}`);
        
        // 这里应该失败，因为吸附功能不工作了
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证最终状态
        output = testInstance.flowy.output();
        console.log(`📊 最终块数量: ${output ? output.length : 0}`);
        
        if (output && output.length >= 2) {
          const childBlock = output.find(block => block.parent !== -1);
          console.log(`🔗 是否有子块（吸附成功的标志）: ${childBlock ? 'Yes' : 'No'}`);
          expect(childBlock).toBeDefined();
        }
      });
    });

    test('验证indicator状态在清理后是否正确重置', async () => {
      await withIsolatedTest('indicator-state-verification', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建初始状态
        const block1 = testInstance.createTestDragElement('1', 'Block 1');
        testInstance.simulateMouseDown(block1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 触发indicator显示
        const block2 = testInstance.createTestDragElement('2', 'Block 2');
        testInstance.simulateMouseDown(block2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        console.log(`🔍 清理前indicator状态 - 可见数量: ${visibleIndicators.length}`);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证indicator状态
        const allIndicators = canvas.querySelectorAll('.indicator');
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        
        console.log(`🔍 清理后indicator状态 - 总数: ${allIndicators.length}, 可见数量: ${visibleIndicators.length}`);
        
        // indicator应该存在但不可见
        expect(allIndicators.length).toBeGreaterThan(0);
        expect(visibleIndicators.length).toBe(0);

        // 重新测试indicator功能
        const newBlock1 = testInstance.createTestDragElement('1', 'New Block 1');
        testInstance.simulateMouseDown(newBlock1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        const newBlock2 = testInstance.createTestDragElement('2', 'New Block 2');
        testInstance.simulateMouseDown(newBlock2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        console.log(`🔍 重新测试indicator功能 - 可见数量: ${visibleIndicators.length}`);
        
        // 这里应该能够正常显示indicator
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));
      });
    });

    test('验证块ID管理在清理后是否正确重置', async () => {
      await withIsolatedTest('block-id-management', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建几个块
        for (let i = 0; i < 3; i++) {
          const block = testInstance.createTestDragElement(`${i + 1}`, `Block ${i + 1}`);
          testInstance.simulateMouseDown(block);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(300 + i * 100, 300);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        let output = testInstance.flowy.output();
        console.log(`📊 创建后的块ID: ${output ? output.map(b => b.id).join(', ') : 'none'}`);

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 重新创建块，ID应该从0开始
        const newBlock = testInstance.createTestDragElement('1', 'New Block');
        testInstance.simulateMouseDown(newBlock);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        output = testInstance.flowy.output();
        console.log(`📊 重新创建后的块ID: ${output ? output.map(b => b.id).join(', ') : 'none'}`);
        
        // 验证ID重置
        if (output && output.length > 0) {
          expect(output[0].id).toBe(0);
        }
      });
    });
  });
});
