/**
 * file upload task queue
 *
 * @author jinghui-Luo
 *
 * Created at     : 2022-07-02 21:36:48
 * Last modified  : 2022-07-25 00:34:11
 */

// pending：等待上传、success：上传成功、fail：上传失败、done：已成功
export enum Status {
  Pending = 'Pending',
  Success = 'Success',
  Fail = 'Fail',
  Done = 'Done',
}

class FileQueue {
  private list: any[];
  private isExecuting: boolean;
  public onCompleteAll: (list: any[]) => void;

  constructor() {
    // 队列存储数组
    this.list = [];
    // 是否正在执行队列（防止异步时队列执行重复）
    this.isExecuting = false;
    // 消息队列全部完成后的回调
    this.onCompleteAll = (list) => {};
  }

  // 添加队列
  addList(length: number) {
    const newList = new Array(length).fill(0).map(() => ({
      status: Status.Pending,
      result: {},
    }));

    const insertIndex = this.list.length;
    this.list = this.list.concat(newList);
    // 返回新添加队列在整个队列中的起始下标
    return insertIndex;
  }

  // 更新队列状态和数据
  updateItem(index: number, status: Status, result: any) {
    const item = this.list[index];
    item.status = status;
    item.result = result || {};
  }

  // 检查队列
  async check(callback: (status: Status) => void) {
    console.log('check isExecuting:', this.isExecuting);
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;

    for (let i = 0; i < this.list.length; i++) {
      const item = this.list[i];
      if (item.status === Status.Pending) {
        break;
      } else {
        if (item.status === Status.Success) {
          item.status = Status.Done;
          await callback(item.result);
        }

        if (i === this.list.length - 1) {
          this.onCompleteAll(this.list);
          this.list = [];
          this.isExecuting = false;
        }
      }
    }
    this.isExecuting = false;
  }
}

export default FileQueue;
