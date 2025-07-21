/**
 * 块管理模块
 * 负责管理工作流中的所有块，包括创建、删除、查找、位置计算等
 * 这是重构的第二步，提取blocks数组管理功能
 */

/**
 * 块管理器类
 * 管理blocks数组和相关操作
 */
class BlockManager {
    constructor() {
        // 主要的块数组
        this.blocks = [];
        // 临时块数组，用于拖拽过程中的状态管理
        this.blockstemp = [];
    }

    /**
     * 获取所有块
     * @returns {Array} 块数组
     */
    getAllBlocks() {
        return this.blocks;
    }

    /**
     * 获取临时块数组
     * @returns {Array} 临时块数组
     */
    getTempBlocks() {
        return this.blockstemp;
    }

    /**
     * 设置块数组
     * @param {Array} blocks - 新的块数组
     */
    setBlocks(blocks) {
        this.blocks = blocks;
    }

    /**
     * 设置临时块数组
     * @param {Array} blockstemp - 新的临时块数组
     */
    setTempBlocks(blockstemp) {
        this.blockstemp = blockstemp;
    }

    /**
     * 添加块到主数组
     * @param {Object} block - 要添加的块
     */
    addBlock(block) {
        this.blocks.push(block);
    }

    /**
     * 添加块到临时数组
     * @param {Object} block - 要添加的块
     */
    addTempBlock(block) {
        this.blockstemp.push(block);
    }

    /**
     * 清空所有块
     */
    clearBlocks() {
        this.blocks = [];
    }

    /**
     * 清空临时块
     */
    clearTempBlocks() {
        this.blockstemp = [];
    }

    /**
     * 获取块的数量
     * @returns {number} 块的数量
     */
    getBlockCount() {
        return this.blocks.length;
    }

    /**
     * 根据ID查找块
     * @param {number} id - 块的ID
     * @returns {Object|undefined} 找到的块或undefined
     */
    findBlockById(id) {
        return this.blocks.find(block => block.id === id);
    }

    /**
     * 根据ID从临时数组查找块
     * @param {number} id - 块的ID
     * @returns {Object|undefined} 找到的块或undefined
     */
    findTempBlockById(id) {
        return this.blockstemp.find(block => block.id === id);
    }

    /**
     * 过滤块数组
     * @param {Function} callback - 过滤函数
     * @returns {Array} 过滤后的块数组
     */
    filterBlocks(callback) {
        return this.blocks.filter(callback);
    }

    /**
     * 过滤临时块数组
     * @param {Function} callback - 过滤函数
     * @returns {Array} 过滤后的临时块数组
     */
    filterTempBlocks(callback) {
        return this.blockstemp.filter(callback);
    }

    /**
     * 从块数组中移除指定块
     * @param {Function} callback - 过滤函数，返回true的块会被保留
     */
    removeBlocks(callback) {
        this.blocks = this.blocks.filter(callback);
    }

    /**
     * 获取所有块的ID
     * @returns {Array} ID数组
     */
    getAllBlockIds() {
        return this.blocks.map(block => block.id);
    }

    /**
     * 获取最大的块ID
     * @returns {number} 最大ID，如果没有块则返回-1
     */
    getMaxBlockId() {
        if (this.blocks.length === 0) {
            return -1;
        }
        return Math.max.apply(Math, this.blocks.map(block => block.id));
    }

    /**
     * 获取下一个可用的块ID
     * @returns {number} 下一个ID
     */
    getNextBlockId() {
        if (this.blocks.length === 0) {
            return 0;
        }
        return this.getMaxBlockId() + 1;
    }

    /**
     * 合并临时块到主数组
     * 这个方法模拟jQuery的$.merge功能
     */
    mergeTempBlocks() {
        this.blocks = [...this.blocks, ...this.blockstemp];
        this.blockstemp = [];
    }

    /**
     * 获取块的位置信息数组
     * @returns {Array} 位置数组
     */
    getBlockPositions() {
        return this.blocks.map(block => block.x);
    }

    /**
     * 获取块的宽度信息数组
     * @returns {Array} 宽度数组
     */
    getBlockWidths() {
        return this.blocks.map(block => block.width);
    }

    /**
     * 创建新块对象
     * @param {Object} options - 块的配置选项
     * @returns {Object} 新创建的块对象
     */
    createBlock(options = {}) {
        const defaultBlock = {
            parent: -1,
            childwidth: 0,
            id: this.getNextBlockId(),
            x: 0,
            y: 0,
            width: 100,
            height: 50
        };
        
        return { ...defaultBlock, ...options };
    }

    /**
     * 验证块对象的有效性
     * @param {Object} block - 要验证的块
     * @returns {boolean} 是否有效
     */
    isValidBlock(block) {
        return block && 
               typeof block.id === 'number' && 
               typeof block.x === 'number' && 
               typeof block.y === 'number';
    }

    /**
     * 获取块的统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            totalBlocks: this.blocks.length,
            tempBlocks: this.blockstemp.length,
            maxId: this.getMaxBlockId(),
            nextId: this.getNextBlockId()
        };
    }

    /**
     * 重置管理器状态
     */
    reset() {
        this.blocks = [];
        this.blockstemp = [];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlockManager;
} else if (typeof window !== 'undefined') {
    window.BlockManager = BlockManager;
}
