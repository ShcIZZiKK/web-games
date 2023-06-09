import GameManager from './managers/GameManager';

// Games
import GameSnake from './games/snake/Game';
import GameArkanoid from './games/arkanoid/Game';
import Game2048 from './games/2048/Game';

const gameSnake = new GameSnake();
const gameArkanoid = new GameArkanoid();
const game2048 = new Game2048();

const games = [
  {
    name: 'snake',
    game: gameSnake,
    helper: [
      { key: 'arrow right &rarr;', description: 'Поворот вправо' },
      { key: 'arrow left &larr;', description: 'Поворот влево' },
      { key: 'arrow up &uarr;', description: 'Поворот вверх' },
      { key: 'arrow down &darr;', description: 'Поворот вниз' },
      { key: 'esc', description: 'Выход' }
    ]
  },
  {
    name: '2048',
    game: game2048,
    helper: [
      { key: 'arrow right &rarr;', description: 'Сдвиг вправо' },
      { key: 'arrow left &larr;', description: 'Сдвиг влево' },
      { key: 'arrow up &uarr;', description: 'Сдвиг вверх' },
      { key: 'arrow down &darr;', description: 'Сдвиг вниз' },
      { key: 'esc', description: 'Выход' }
    ]
  },
  {
    name: 'arkanoid',
    game: gameArkanoid,
    helper: [
      { key: 'arrow right &rarr;', description: 'Двигаться вправо' },
      { key: 'arrow left &larr;', description: 'Двигаться влево' },
      { key: 'space', description: 'Запуск шарика' },
      { key: 'esc', description: 'Выход' }
    ]
  },
];

window.addEventListener('load', () => {
  GameManager.init(games);
});
