const example2 = [
  [0, 3, 0, 0, 6, 2, 0, 7, 0],
  [2, 7, 6, 8, 1, 5, 0, 0, 9],
  [9, 0, 0, 0, 3, 0, 2, 5, 0],
  [0, 0, 0, 5, 8, 0, 0, 0, 7],
  [8, 0, 7, 0, 0, 0, 9, 0, 0],
  [0, 2, 4, 0, 0, 0, 0, 0, 0],
  [0, 4, 9, 6, 0, 0, 1, 3, 0],
  [6, 1, 0, 7, 4, 0, 5, 0, 0],
  [0, 0, 8, 2, 9, 0, 0, 6, 4],
];

export function generateNewGame() {
  const baseNumbers = Array(9)
    .fill(1)
    .map((value, index) => value + index);

  const firstRow = shuffleArray(baseNumbers);
  const newGrid = [firstRow];

  for (let i = 1; i < 9; i++) {
    const nextRow: number[] = [];
    for (let j = 1; j < 10; j++) {
      //newGrid.map((row)=> row.filter(j))
    }
    newGrid.push(nextRow);
  }
}

function shuffleArray(array: number[]) {
  let newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
