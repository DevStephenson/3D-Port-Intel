const isObjEq = (m1, m2) => {
    if (!m1 || !m2) return false;
    for (var [key, value] of m1) { if (value !== m2.get(key)) return false; }
    return true;
  }
  
  // Fisher-Yates (aka Knuth) Shuffle
  const shuffle = (array) => {
    var currentIndex = array.length, randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
  
  const isWinningCombination = (game, key) => {
    return isObjEq(game.get(0), key.get(2)) && isObjEq(game.get(1), key.get(1)) && isObjEq(game.get(2), key.get(0));
  }
  
  module.exports.shuffle = shuffle;
  module.exports.isWinningCombination = isWinningCombination;