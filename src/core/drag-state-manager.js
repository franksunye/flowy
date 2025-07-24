/**
 * 拖拽状态管理器 (DragStateManager)
 * 
 * 职责:
 * - 管理所有拖拽相关的状态变量
 * - 提供统一的状态访问和修改接口
 * - 确保状态变更的一致性和可追踪性
 * 
 * 设计原则:
 * - 单一职责: 只负责状态管理，不包含业务逻辑
 * - 不可变性: 状态变更通过方法调用，避免直接修改
 * - 类型安全: 提供明确的状态类型定义
 * 
 * @author Flowy Team
 * @version 1.0.0
 * @since 2025-07-24
 */

class DragStateManager {
  constructor() {
    // 初始化所有拖拽状态
    this.reset();
  }

  /**
   * 重置所有状态到初始值
   */
  reset() {
    this.state = {
      // 基础拖拽状态
      active: false,           // 是否正在拖拽新块
      rearrange: false,        // 是否正在重排现有块
      
      // 拖拽元素和位置
      drag: null,              // 当前拖拽的DOM元素
      dragx: 0,                // 拖拽起始X偏移
      dragy: 0,                // 拖拽起始Y偏移
      original: null,          // 原始元素引用
      
      // 辅助状态
      lastevent: false,        // 最后事件标记
      offsetleft: 0,           // 左偏移
      offsetleftold: 0,        // 旧左偏移
      
      // 状态变更历史 (用于调试和回滚)
      history: [],
      maxHistorySize: 10
    };
  }

  /**
   * 获取完整状态对象的只读副本
   * @returns {Object} 状态对象的深拷贝
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * 获取特定状态值
   * @param {string} key - 状态键名
   * @returns {*} 状态值
   */
  get(key) {
    return this.state[key];
  }

  /**
   * 设置单个状态值
   * @param {string} key - 状态键名
   * @param {*} value - 新值
   * @param {boolean} recordHistory - 是否记录历史
   */
  set(key, value, recordHistory = true) {
    if (recordHistory) {
      this._recordHistory();
    }
    
    const oldValue = this.state[key];
    this.state[key] = value;
    
    // 触发状态变更事件 (如果需要)
    this._onStateChange(key, oldValue, value);
  }

  /**
   * 批量设置状态
   * @param {Object} updates - 要更新的状态对象
   * @param {boolean} recordHistory - 是否记录历史
   */
  setState(updates, recordHistory = true) {
    if (recordHistory) {
      this._recordHistory();
    }
    
    Object.keys(updates).forEach(key => {
      const oldValue = this.state[key];
      this.state[key] = updates[key];
      this._onStateChange(key, oldValue, updates[key]);
    });
  }

  /**
   * 检查是否正在拖拽 (任何类型的拖拽)
   * @returns {boolean}
   */
  isDragging() {
    return this.state.active || this.state.rearrange;
  }

  /**
   * 检查是否正在拖拽新块
   * @returns {boolean}
   */
  isActiveDragging() {
    return this.state.active;
  }

  /**
   * 检查是否正在重排现有块
   * @returns {boolean}
   */
  isRearranging() {
    return this.state.rearrange;
  }

  /**
   * 开始拖拽新块
   * @param {jQuery} dragElement - 拖拽元素
   * @param {jQuery} originalElement - 原始元素
   * @param {number} dragx - X偏移
   * @param {number} dragy - Y偏移
   */
  startActiveDrag(dragElement, originalElement, dragx, dragy) {
    this.setState({
      active: true,
      rearrange: false,
      drag: dragElement,
      original: originalElement,
      dragx: dragx,
      dragy: dragy
    });
  }

  /**
   * 开始重排现有块
   * @param {jQuery} dragElement - 拖拽元素
   * @param {number} dragx - X偏移
   * @param {number} dragy - Y偏移
   */
  startRearrange(dragElement, dragx, dragy) {
    this.setState({
      active: false,
      rearrange: true,
      drag: dragElement,
      dragx: dragx,
      dragy: dragy
    });
  }

  /**
   * 结束拖拽 (任何类型)
   */
  endDrag() {
    this.setState({
      active: false,
      rearrange: false,
      drag: null,
      original: null,
      dragx: 0,
      dragy: 0
    });
  }

  /**
   * 更新拖拽位置偏移
   * @param {number} dragx - X偏移
   * @param {number} dragy - Y偏移
   */
  updateDragOffset(dragx, dragy) {
    this.setState({
      dragx: dragx,
      dragy: dragy
    }, false); // 位置更新频繁，不记录历史
  }

  /**
   * 获取当前拖拽元素
   * @returns {jQuery|null}
   */
  getCurrentDragElement() {
    return this.state.drag;
  }

  /**
   * 获取原始元素
   * @returns {jQuery|null}
   */
  getOriginalElement() {
    return this.state.original;
  }

  /**
   * 获取拖拽偏移
   * @returns {Object} {x, y}
   */
  getDragOffset() {
    return {
      x: this.state.dragx,
      y: this.state.dragy
    };
  }

  /**
   * 设置辅助状态
   * @param {Object} auxiliaryState - 辅助状态对象
   */
  setAuxiliaryState(auxiliaryState) {
    const allowedKeys = ['lastevent', 'offsetleft', 'offsetleftold'];
    const filteredState = {};
    
    Object.keys(auxiliaryState).forEach(key => {
      if (allowedKeys.includes(key)) {
        filteredState[key] = auxiliaryState[key];
      }
    });
    
    this.setState(filteredState, false);
  }

  /**
   * 回滚到上一个状态
   * @returns {boolean} 是否成功回滚
   */
  rollback() {
    if (this.state.history.length > 0) {
      const previousState = this.state.history.pop();
      this.state = { ...previousState, history: this.state.history };
      return true;
    }
    return false;
  }

  /**
   * 获取状态变更历史
   * @returns {Array} 历史记录数组
   */
  getHistory() {
    return [...this.state.history];
  }

  /**
   * 记录当前状态到历史
   * @private
   */
  _recordHistory() {
    // 创建当前状态的深拷贝，排除history和maxHistorySize
    const currentState = {};
    Object.keys(this.state).forEach(key => {
      if (key !== 'history' && key !== 'maxHistorySize') {
        currentState[key] = this.state[key];
      }
    });

    this.state.history.push(currentState);

    // 限制历史记录大小
    if (this.state.history.length > this.state.maxHistorySize) {
      this.state.history.shift();
    }
  }

  /**
   * 状态变更回调
   * @private
   * @param {string} key - 变更的键
   * @param {*} oldValue - 旧值
   * @param {*} newValue - 新值
   */
  _onStateChange(key, oldValue, newValue) {
    // 可以在这里添加状态变更日志或事件触发
    // console.log(`DragState changed: ${key} ${oldValue} -> ${newValue}`);
  }

  /**
   * 获取状态摘要 (用于调试)
   * @returns {Object} 状态摘要
   */
  getSummary() {
    return {
      isDragging: this.isDragging(),
      isActive: this.isActiveDragging(),
      isRearranging: this.isRearranging(),
      hasDragElement: !!this.state.drag,
      hasOriginalElement: !!this.state.original,
      dragOffset: this.getDragOffset()
    };
  }
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragStateManager;
} else if (typeof window !== 'undefined') {
  window.DragStateManager = DragStateManager;
}
