document.querySelector('#new-game').addEventListener('change', function () {
  if (
    this.querySelector('#player-1').value
  ) { this.querySelector('#new-game-btn').removeAttribute('disabled') }
  else { this.querySelector('#new-game-btn').setAttribute('disabled', '') }
});

function togglePlayer2() {
  const $player_2 = document.querySelector('#player-2');
  const $bot_level = document.querySelector('#bot-level');

  if (document.querySelector('#against-bot').checked) {
    $player_2.setAttribute('disabled', '');
    $player_2.parentElement.style.display = 'none';

    $bot_level.removeAttribute('disabled');
    $bot_level.parentElement.style.display = 'initial';
  } else if (document.querySelector('#against-player').checked) {
    $bot_level.setAttribute('disabled', '');
    $bot_level.parentElement.style.display = 'none';

    $player_2.removeAttribute('disabled');
    $player_2.parentElement.style.display = 'initial';
  }
}
