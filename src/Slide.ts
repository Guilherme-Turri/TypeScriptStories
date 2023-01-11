import TimeOut from './TimeOut.js';

export default class Slide {
  container;
  slides;
  controls;
  time;
  index;
  slide;
  timeout: TimeOut | null;
  pausedTimeout: TimeOut | null;
  paused: boolean;
  ThumbItens: HTMLElement[] | null;
  thumb: HTMLElement | null;
  constructor(
    container: Element,
    slides: Element[],
    controls: Element,
    time: number = 5000,
  ) {
    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;
    this.index = localStorage.getItem('activeSlide')
      ? Number(localStorage.getItem('activeSlide'))
      : 0;
    this.slide = this.slides[this.index];
    this.timeout = null;
    this.paused = false;
    this.pausedTimeout = null;
    this.ThumbItens = null;
    this.thumb = null;
    this.init();
  }

  hide(el: Element) {
    el.classList.remove('active');
    if (el instanceof HTMLVideoElement) {
      el.currentTime = 0;
      el.pause();
    }
  }

  show(index: number) {
    this.index = index;
    this.slide = this.slides[this.index];
    localStorage.setItem('activeSlide', this.index.toString());

    if (this.ThumbItens) {
      this.thumb = this.ThumbItens[this.index];
      this.ThumbItens.map((el) => {
        el.classList.remove('active');
      });
      this.thumb.classList.add('active');
    }

    this.slides.map((slide) => {
      this.hide(slide);
    });
    this.slide.classList.add('active');

    if (this.slide instanceof HTMLVideoElement) {
      this.autoVideo(this.slide);
    } else this.auto(this.time);
  }

  autoVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.play();
    let firstPlay = true;
    video.addEventListener('playing', () => {
      if (firstPlay) {
        this.auto(video.duration * 1000);
        firstPlay = false;
      }
    });
  }

  auto(time: number) {
    this.timeout?.clear();
    this.timeout = new TimeOut(() => this.next(), time);
    if (this.thumb) {
      this.thumb.style.animationDuration = `${time}ms`;
    }
  }

  prev() {
    if (this.paused) return;
    const prev = this.index > 0 ? this.index - 1 : this.slides.length - 1;
    this.show(prev);
  }
  next() {
    if (this.paused) return;
    const next = this.index + 1 < this.slides.length ? this.index + 1 : 0;
    this.show(next);
  }

  pause() {
    document.body.classList.add('paused');
    this.pausedTimeout = new TimeOut(() => {
      this.timeout?.pause();
      this.paused = true;
      this.thumb?.classList.add('paused');
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.pause();
      }
    }, 100);
  }
  continue() {
    document.body.classList.remove('paused');
    this.pausedTimeout?.clear();
    if (this.paused) {
      this.paused = false;
      this.timeout?.continue();
      this.thumb?.classList.remove('paused');
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.play();
      }
    }
  }

  private addControls() {
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');

    prevButton.innerText = 'Slide Anterior';
    nextButton.innerText = 'Proximo Slide';

    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);

    nextButton.addEventListener('pointerup', () => this.next());
    prevButton.addEventListener('pointerup', () => this.prev());

    this.controls.addEventListener('pointerdown', () => this.pause());
    document.addEventListener('pointerup', () => this.continue());
    document.addEventListener('touchend', () => this.continue());
  }

  private addThumbItens() {
    const thumbContainer = document.createElement('div');
    thumbContainer.id = 'slide-thumb';
    for (let i = 0; i < this.slides.length; i++) {
      thumbContainer.innerHTML += `
      <span><span class='thumb-item'></span></span>
      `;
    }
    this.controls.appendChild(thumbContainer);
    this.ThumbItens = Array.from(document.querySelectorAll('.thumb-item'));
  }

  private init() {
    this.addControls();
    this.addThumbItens();
    this.show(this.index);
  }
}
