const DEFAULT_OPTIONS = {
  autoClose: 3000, // 自动关闭：false为关闭自动关闭
  position: 'top-right', // 位置
  onClose: null, // 关闭时的回调函数
  canClose: true, // 点击它是否会关闭
  showProgress: true, // 是否显示进度条
  hoverPaused: true, // hover的时候是否暂停
};

export default class Toast {
  #toastEL;
  #autoCloseTimer;
  #showProgressInterval;
  #autoClose;
  #prevTime;
  #restProgress = 0; // 进度条剩余路程
  #disTime;
  #isPaused = false;
  constructor(options) {
    this.#toastEL = document.createElement('div');
    this.#toastEL.classList.add('toast');
    requestAnimationFrame(() => {
      this.#toastEL.classList.add('show');
    });

    this.removeBind = this.remove.bind(this);
    this.update({ ...DEFAULT_OPTIONS, ...options });
  }

  set hoverPaused(value) {
    if (!value) return;
    this.#toastEL.addEventListener('mouseover', () => {
      this.#isPaused = true;
      this.#disTime = this.#autoClose - Date.now() + this.#prevTime;
      clearInterval(this.#autoCloseTimer);
    });
    this.#toastEL.addEventListener('mouseleave', () => {
      this.#isPaused = false;
      this.autoClose = this.#disTime;
    });
  }

  set position(position) {
    const lastContainer = this.#toastEL.parentElement;
    const selector = `[data-position="${position}"]`;
    const toastContainer = document.querySelector(selector) || this.createContainer(position);
    toastContainer.append(this.#toastEL);
    if (!lastContainer || lastContainer.hasChildNodes()) return;
    lastContainer.remove();
  }

  set text(text) {
    this.#toastEL.textContent = text;
  }

  set autoClose(value) {
    console.log(value);
    this.#prevTime = Date.now(); // 开始定时关闭的时间
    if (value === false) return; // 不开启自动关闭
    this.#autoClose = value;
    if (this.#autoCloseTimer != null) clearTimeout(this.#autoCloseTimer); // 避免改变时间时多次开启定时器和改变时重置关闭时间
    this.#autoCloseTimer = setTimeout(() => {
      this.remove();
    }, value);
  }

  set canClose(value) {
    if (value) {
      this.#toastEL.classList.add('can-close');
      this.#toastEL.addEventListener('click', this.removeBind);
    } else {
      this.#toastEL.removeEventListener('click', this.removeBind);
    }
  }
  /* 
  知道总路程：1米花费5s钟 
  要知道速度？每秒走0.2米
  */
  set showProgress(value) {
    this.#restProgress = 1;
    let totalTime = this.#autoClose; // 总时长保持不变
    if (!value || !this.#autoClose) return;
    this.#toastEL.classList.toggle('progress');
    this.#toastEL.style.setProperty('--progress', 1);
    this.#showProgressInterval = setInterval(() => {
      if (this.#isPaused) return;
      if (this.#restProgress < 0) {
        clearInterval(this.#showProgressInterval);
        return;
      }
      this.#toastEL.style.setProperty('--progress', (this.#restProgress -= 10 / totalTime));
    }, 10);
  }

  /** 创建toast容器 */
  createContainer(position) {
    const container = document.createElement('div');
    container.classList.add('toast-container');
    container.dataset.position = position;
    document.body.append(container);
    return container;
  }

  update(options) {
    Object.entries(options).forEach(([key, value]) => {
      this[key] = value;
    });
  }

  remove() {
    this.#toastEL.classList.remove('show');
    const removeEl = () => {
      const container = this.#toastEL.parentElement;
      this.#toastEL.remove();
      this.onClose && this.onClose();
      if (container && container.hasChildNodes()) return;
      container.remove();
      clearTimeout(this.#autoCloseTimer);
      clearTimeout(this.#showProgressInterval);
    };
    this.#toastEL.addEventListener('transitionend', removeEl);
  }

  show() {}
}
