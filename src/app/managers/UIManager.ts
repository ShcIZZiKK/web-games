import AudioManager from './AudioManager';
import GameManager from './GameManager';
import Mediator from '../helpers/Mediator';
import Utils from '../helpers/Utils';
import { HelperList, GameScore, ResultBlocks, ResultBlocksButton } from '../interfaces';

const mediator = Mediator.getInstance();

class UIManager {
  private static instance: UIManager; // Экземпляр класса
  private audioManager: AudioManager; // Аудио менеджер
  private uiManagerMenu: UIManagerMenu; // Менеджер для главного меню
  private uiManagerScore: UIManagerScore; // Менеджер для вывода очков игры
  private uiManagerResult: UIManagerResult; // Менеджер для вывода результата игры
  private uiManagerHelper: UIManagerHelper; // Менеджер для вывода подсказок управления
  private uiActiveClass = 'is-active'; // Класс для взаимодействия с ui

  private constructor() {
    this.init();
  }

  /**
   * Доступ к экземпляру класса
   */
  public static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }

    return UIManager.instance;
  }

  /**
   * Инициализация менеджера
   * @private
   */
  private init(): void {
    this.audioManager = new AudioManager();
    this.uiManagerMenu = new UIManagerMenu(this.audioManager, this.uiActiveClass);
    this.uiManagerScore = new UIManagerScore();
    this.uiManagerResult = new UIManagerResult(this.audioManager, this.uiActiveClass);
    this.uiManagerHelper = new UIManagerHelper();
  }

  /**
   * Добавляет список игр в главное меню
   * @param wrapper
   * @param menuButtons
   */
  public setMenuItems(wrapper: HTMLElement, menuButtons: Array<string>) {
    this.uiManagerMenu.createMenuButtons(wrapper, menuButtons);
  }

  /**
   * Устанавливает блоки для вывода очков игры
   * @param currentWrapper
   * @param maxWrapper
   */
  public setScoreItems(currentWrapper: HTMLElement, maxWrapper: HTMLElement) {
    this.uiManagerScore.setBlocks(currentWrapper, maxWrapper);
  }

  /**
   * Устанавливает блоки для вывода результата игры
   * @param blocks
   */
  public setResultBlocks(blocks: ResultBlocks) {
    this.uiManagerResult.setBlocks(blocks);
  }

  /**
   * Сообщает uiManagerResult что нужно вывести результат игры
   * @param result
   * @param score
   */
  public setResult(result: string, score: number) {
    this.uiManagerResult.updateResult(result, score);
  }

  /**
   * Запускает музыку главного меню
   */
  public playMusic() {
    this.uiManagerMenu.playMusic();
  }

  /**
   * Устанавливает блок для вывода подсказок управления
   * @param helperBlock
   */
  public setHelperBlock(helperBlock: HTMLElement) {
    this.uiManagerHelper.setWrapper(helperBlock);
  }

  /**
   * Сообщает uiManagerHelper что нужно обновить список подсказок
   * @param helperList
   */
  public updateHelperList(helperList: Array<HelperList>) {
    this.uiManagerHelper.updateHelperList(helperList);
  }

  /**
   * Сообщает uiManagerHelper что нужно установить подсказки по умолчанию
   */
  public setDefaultHelperList() {
    this.uiManagerHelper.setDefaultList();
  }
}

class UIManagerMenu {
  private audioManager: AudioManager; // Аудио менеджер
  private menuButtons: Array<HTMLElement> = []; // Кнопки меню
  private activeIndex = 0; // Индекс текущей активной кнопки
  private activeClass: string; // Класс для подсветки активного пункта меню

  constructor(audioManager: AudioManager, activeClass: string) {
    this.activeClass = activeClass;

    this.initAudioManager(audioManager);
    this.bindEvents();
  }

  public createMenuButtons(wrapper: HTMLElement, menuButtons: Array<string>) {
    if (!wrapper || !menuButtons.length) {
      return;
    }

    menuButtons.forEach((button, index) => {
      const elem = document.createElement('button');
      const elemText = document.createTextNode(button);

      elem.appendChild(elemText);

      if (index === 0) {
        elem.className = this.activeClass;
        this.activeIndex = 0;
      }

      wrapper.appendChild(elem);

      this.menuButtons.push(elem);
    });
  }

  public playMusic() {
    if (this.audioManager) {
      this.audioManager.musicPlay('menu');
    }
  }

  private initAudioManager(audioManager: AudioManager) {
    const musicList = [
      { name: 'menu', file: 'menu.mp3', loop: true, volume: 0.3 },
      { name: 'button', file: 'button.mp3', loop: false },
      { name: 'enter', file: 'enter.mp3', loop: false }
    ];

    this.audioManager = audioManager;
    this.audioManager.addMusicList(musicList);
    this.playMusic();
  }

  private changeActiveClassMenuButtons(direction: string) {
    if (direction === 'up') {
      this.activeIndex =
        this.activeIndex === 0
          ? this.menuButtons.length - 1
          : this.activeIndex - 1;
    } else {
      this.activeIndex =
        this.activeIndex === this.menuButtons.length - 1
          ? 0
          : this.activeIndex + 1;
    }

    this.audioManager.musicPlay('button');

    this.menuButtons.forEach((button, index) => {
      const method = index === this.activeIndex ? 'add' : 'remove';

      button.classList[method](this.activeClass);
    });
  }

  private bindEvents() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
          if (GameManager.stage !== 'menu') {
            return;
          }

          this.changeActiveClassMenuButtons('up');

          break;
        case 'ArrowDown':
          if (GameManager.stage !== 'menu') {
            return;
          }

          this.changeActiveClassMenuButtons('down');

          break;
        case 'Enter':
          if (GameManager.stage !== 'menu') {
            return;
          }

          this.audioManager.musicStop('menu');
          this.audioManager.musicPlay('enter');
          mediator.publish('menu:enter', this.activeIndex);

          break;
        default:
          break;
      }
    });
  }
}

class UIManagerScore {
  private current: HTMLElement;
  private max: HTMLElement;

  constructor() {
    this.subscribes();
  }

  setBlocks(current: HTMLElement, max: HTMLElement) {
    this.current = current;
    this.max = max;
  }

  private subscribes() {
    mediator.subscribe('store:update', (obj: GameScore) => {
      if (GameManager.stage === 'menu') {
        return;
      }

      const { current, max } = obj;

      this.current.innerText = Utils.getFilledZeroText(current.toString());
      this.max.innerText = Utils.getFilledZeroText(max.toString());
    });
  }
}

class UIManagerResult {
  private audioManager: AudioManager;
  private textWrapper: HTMLElement;
  private scoreWrapper: HTMLElement;
  private buttons: Array<ResultBlocksButton>;
  private activeIndex = 0;
  private activeClass: string;

  constructor(audioManager: AudioManager, activeClass: string) {
    this.activeClass = activeClass;

    this.initAudioManager(audioManager);
    this.bindEvents();
  }

  public setBlocks(blocks: ResultBlocks) {
    this.textWrapper = blocks.textWrapper;
    this.scoreWrapper = blocks.scoreWrapper;
    this.buttons = blocks.buttons;

    if (this.buttons.length) {
      this.buttons[this.activeIndex].element.classList.add('is-active');
    }
  }

  public updateResult(result: string, score: number) {
    this.textWrapper.innerText = result === 'win' ? 'YOU WIN!' : 'GAME OVER';
    this.scoreWrapper.innerText = Utils.getFilledZeroText(score.toString());
  }

  private initAudioManager(audioManager: AudioManager) {
    const musicList = [
      { name: 'button', file: 'button.mp3', loop: false },
      { name: 'enter', file: 'enter.mp3', loop: false }
    ];

    this.audioManager = audioManager;
    this.audioManager.addMusicList(musicList);
  }

  private changeActiveClassMenuButtons(direction: string) {
    if (direction === 'up') {
      this.activeIndex =
        this.activeIndex === 0
          ? this.buttons.length - 1
          : this.activeIndex - 1;
    } else {
      this.activeIndex =
        this.activeIndex === this.buttons.length - 1
          ? 0
          : this.activeIndex + 1;
    }

    this.audioManager.musicPlay('button');

    this.buttons.forEach((button, index) => {
      const method = index === this.activeIndex ? 'add' : 'remove';

      button.element.classList[method](this.activeClass);
    });
  }

  private bindEvents() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
          if (GameManager.stage === 'win' || GameManager.stage === 'lose') {
            this.changeActiveClassMenuButtons('up');
          }

          break;
        case 'ArrowDown':
          if (GameManager.stage === 'win' || GameManager.stage === 'lose') {
            this.changeActiveClassMenuButtons('down');
          }

          break;
        case 'Enter':
          if (GameManager.stage === 'win' || GameManager.stage === 'lose') {
            const eventName = this.buttons[this.activeIndex].eventName;

            this.audioManager.musicPlay('enter');
            mediator.publish(`game:${eventName}`);
          }

          break;
        default:
          break;
      }
    })
  }
}

class UIManagerHelper {
  private wrapper: HTMLElement;
  private list: Array<HelperList>;

  public setWrapper(wrapper: HTMLElement) {
    this.wrapper = wrapper;
  }

  public updateHelperList(list: Array<HelperList>) {
    this.list = list;
    this.showList();
  }

  public setDefaultList() {
    this.list = [
      { key: 'arrow up &uarr;', description: 'Листать вверх' },
      { key: 'arrow down &darr;', description: 'Листать вниз' },
      { key: 'enter', description: 'Запустить игру' }
    ];
    this.showList();
  }

  private showList() {
    this.wrapper.innerHTML = '';
    let text = '';

    this.list.forEach((item) => {
      text += `<li>${item.key}</li><li>${item.description}</li>`
    });

    this.wrapper.innerHTML = text;
  }
}

export default UIManager;
