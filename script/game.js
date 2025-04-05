(function main() {
  const $game = document.querySelector('#game');
  const $rows = Array.from($game.children);
  const $current_tile = document.querySelector('#current');
  const $score_1 = document.querySelector('#score-1');
  const $score_2 = document.querySelector('#score-2');
  const $player_1_name = document.querySelector('#player-1-name');
  const $player_2_name = document.querySelector('#player-2-name');
  const $game_over = document.querySelector('#game-over');
  const $winner = document.querySelector('#winner');
  const $winner_pts = document.querySelector('#winner-pts');

  let current_turn;

  const game = {
    disabled_tiles: null,
    against_bot: null,
    bot_level: null,
  };

  // Generate every hexagon tile
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 10; col++) {

      // Generate one hexagon tile in `row`
      let $tile = document.createElement('span');
      $tile.classList.add('hexa');
      $tile.setAttribute('data-empty', '');
      $tile.setAttribute('data-row', row);
      $tile.setAttribute('data-col', col);

      // Custom method to set tile points
      $tile.setPoints = function (points) {
        this.setAttribute('data-points', parseInt(points));
        this.innerText = parseInt(points);
      }

      // Append tile element to game window
      $rows[row].appendChild($tile);

      // Show preview for empty tile
      $tile.addEventListener('mouseover', tileOnMouseOver);

      // Remove preview on mouse leave
      $tile.addEventListener('mouseleave', tileOnMouseLeave);

      // Fill empty tile with player's color and trigger next turn
      $tile.addEventListener('click', tileOnClick);
    }
  }

  function tileOnMouseOver() {
    if (this.hasAttribute('data-empty') &&
      !this.hasAttribute('data-disabled')) {

      this.setAttribute('data-color', $current_tile.getAttribute('data-color'));
      this.innerText = $current_tile.innerText;

      let row = parseInt(this.getAttribute('data-row'));
      let col = parseInt(this.getAttribute('data-col'));
      let color = this.getAttribute('data-color');
      let points = parseInt(this.innerText);

      let $adjacent_tiles = getAdjacentTiles(row, col);

      for (let $adjacent_tile of $adjacent_tiles) {
        if (!$adjacent_tile.hasAttribute('data-empty') &&
          !$adjacent_tile.hasAttribute('data-disabled')) {
          try {
            var adjacent_tile_points = parseInt($adjacent_tile.innerText);
          } catch (err) {
            var adjacent_tile_points = 0;
          }
          // Increment points of adjacent tiles with identical color by 1
          if ($adjacent_tile.getAttribute('data-color') == color) {
            $adjacent_tile.innerText = (adjacent_tile_points + 1);
            $adjacent_tile.style.textDecoration = 'underline';
          } else {
            // Take over opponent's tiles which has less points
            if (adjacent_tile_points < points) {
              $adjacent_tile.setAttribute('data-preview', color);
            }
          }
        }
      }
    }
  }

  function tileOnMouseLeave() {
    if (!this.hasAttribute('data-disabled')) {
      let row = parseInt(this.getAttribute('data-row'));
      let col = parseInt(this.getAttribute('data-col'));

      let $adjacent_tiles = getAdjacentTiles(row, col);

      for (let $adjacent_tile of $adjacent_tiles) {
        $adjacent_tile.removeAttribute('data-preview');
        $adjacent_tile.innerText = $adjacent_tile.getAttribute('data-points');
        $adjacent_tile.style.textDecoration = 'none';
      }

      if (this.hasAttribute('data-empty')) {
        this.removeAttribute('data-color');
        this.innerText = this.getAttribute('data-points');
      }
    }
  }

  function tileOnClick() {
    if (this.hasAttribute('data-empty') &&
      !this.hasAttribute('data-disabled')) {
      let row = parseInt(this.getAttribute('data-row'));
      let col = parseInt(this.getAttribute('data-col'));

      this.setPoints(this.innerText);

      let $adjacent_tiles = getAdjacentTiles(row, col);

      for (let $adjacent_tile of $adjacent_tiles) {
        if (!$adjacent_tile.hasAttribute('data-empty') &&
          !$adjacent_tile.hasAttribute('data-disabled')) {
          let adjacent_tile_color = $adjacent_tile.getAttribute('data-preview');
          if (adjacent_tile_color) {
            $adjacent_tile.setAttribute('data-color', adjacent_tile_color);
          }

          $adjacent_tile.setPoints($adjacent_tile.innerText);
        }
      }

      tileClearMouseEvents(this);
      this.removeAttribute('data-empty');

      tileOnMouseLeave.call(this);

      nextTurn();
    }
  }

  function tileClearMouseEvents(el) {
    el.removeEventListener('mouseover', tileOnMouseOver);
    el.removeEventListener('mouseleave', tileOnMouseLeave);
    el.removeEventListener('click', tileOnClick);
  }

  function newGame(options) {
    current_turn = 0;

    ({
      disabled_tiles: game.disabled_tiles = 0,
      player_1: $player_1_name.innerText = 'Player 1',
      player_2: $player_2_name.innerText = 'Player 2',
      bot_level: game.bot_level,
      against_bot: game.against_bot = 0,
    } = options);

    game.against_bot = +game.against_bot;
    if (game.against_bot) {
      $player_2_name.innerText = 'Bot';
    }

    for (let i = 0; i < +game.disabled_tiles; i++) {
      disableRandomTile();
    }

    nextTurn();
  }

  function nextTurn() {
    current_turn = current_turn == 1 ? 2 : 1;
    $current_tile.setAttribute('data-color', ['red', 'blue'][current_turn - 1]);
    $current_tile.innerText = Math.round(Math.random() * 19) + 1;

    updateScore();

    checkGameOver();

    if (game.against_bot && current_turn == 2) {
      botMove();
    }
  }

  function updateScore() {
    let score_1 = Array.from($game.querySelectorAll('.hexa[data-color=red]:not([data-empty])')).reduce(calculateScore, 0);
    $score_1.innerText = score_1;
    let score_2 = Array.from($game.querySelectorAll('.hexa[data-color=blue]:not([data-empty])')).reduce(calculateScore, 0);
    $score_2.innerText = score_2;

  }

  async function botMove() {
    $game.style.pointerEvents = "none";

    if (document.querySelector('#game .hexa[data-empty]')) {

      let $empty_tiles = (document.querySelectorAll('#game .hexa[data-empty]'));
      let empty_tiles_count = $empty_tiles.length;

      for (let i = 7; i >= 0; i--) {
        let rand_index = Math.round(Math.random() * (empty_tiles_count - 1));
        let $rand_tile = $empty_tiles[rand_index];

        tileOnMouseOver.call($rand_tile)
        await wait(125);
        if (i == 0) {
          await wait(250);
          tileOnClick.call($rand_tile);
        }
        tileOnMouseLeave.call($rand_tile);
      }
    }

    $game.style.pointerEvents = "auto";
  }

  function checkGameOver() {
    if (!document.querySelector('#game .hexa[data-empty]')) {
      let score_1 = +$score_1.innerText;
      let score_2 = +$score_2.innerText;
      let winner = null;

      if (score_1 > score_2) {
        winner = 0;
        $winner.innerText = $player_1_name.innerText;
        $winner_pts.innerText = $score_1.innerText;
        $winner.style.color = 'red';
      } else if (score_2 > score_1) {
        winner = 1;
        $winner.innerText = $player_2_name.innerText;
        $winner_pts.innerText = $score_2.innerText;
        $winner.style.color = 'blue';
      } else {
        $winner.innerText = 'Tie. Nobody'
        $winner_pts.innerText = $score_1.innerText;
        $winner.style.color = 'white';
      }

      let history = JSON.parse(localStorage.getItem('history'));
      if (!history) {
        history = []
      }

      history.push({
        player_1: {
          name: $player_1_name.innerText,
          score: score_1,
        },
        player_2: {
          name: $player_2_name.innerText,
          score: score_2,
        },
        datetime: new Date().toJSON(),
        winner,
        ...game
      });

      localStorage.setItem('history', JSON.stringify(history));

      slideDownFadeIn($game_over);
    }
  }

  function disableRandomTile() {
    let rand_row = Math.round(Math.random() * 7);
    let rand_col = Math.round(Math.random() * 9);

    let target = $rows[rand_row].children[rand_col];
    if (!target.hasAttribute('data-disabled')) {
      target.setAttribute('data-disabled', '');
      target.removeAttribute('data-empty');
      tileClearMouseEvents(target);
    } else {
      disableRandomTile();
    }
  }

  function getAdjacentTiles(row, col) {
    // Get vertically adjacent rows
    let $adjacent_rows = $rows.filter(function ($row, row_index) {
      return [row - 1, row + 1].includes(row_index);
    });

    // Get vertically/diagonally adjacent tiles
    let $adjacent_tiles = $adjacent_rows.map(function ($row) {
      let $tiles = Array.from($row.children)
      return $tiles.filter(function ($adjacent_tile, tile_index) {
        return [col, (row % 2 == 0) ? col - 1 : col + 1].includes(tile_index);
      });
    });

    // Get horizonatally adjacent tiles
    if (col > 0) {
      $adjacent_tiles.push($rows[row].children[col - 1]);
    }
    if (col < 9) {
      $adjacent_tiles.push($rows[row].children[col + 1]);
    }

    $adjacent_tiles = $adjacent_tiles.flat();
    return $adjacent_tiles;
  }

  function calculateScore(score, hexa) {
    let hexa_points = parseInt(hexa.getAttribute('data-points'));
    return score + hexa_points;
  }

  function slideDownFadeIn(el) {
    el.classList.remove('slide-up-fade-out');
    el.offsetWidth;
    el.classList.add('slide-down-fade-in');
  }

  function slideUpFadeOut(el) {
    el.classList.remove('slide-down-fade-in');
    el.offsetWidth;
    el.classList.add('slide-up-fade-out');
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Search query (form) processing
  let params = new URLSearchParams(location.search);

  newGame(Object.fromEntries(params));

  let $history = document.querySelector('#history');

  let history = JSON.parse(localStorage.getItem('history'));
  history = history.slice(-5);
  for (let item of history) {
    $history.innerHTML +=
      `
  <div class="history-item">
    <div>
      <span>${item.player_1.name}</span>
      <span>${item.player_1.score}</span>
    </div>
    vs
    <div>
      <span>${item.player_2.name}</span>
      <span>${item.player_2.score}</span>
    </div>
  </div>
  `;
  }
})();