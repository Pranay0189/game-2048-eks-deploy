export const SIZE = 4;

export const rotate = (g: number[][]) =>
  g[0].map((_, i) => g.map(r => r[i]).reverse());

export const slide = (row: number[]) => {
  const arr = row.filter(Boolean);
  let score = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
    }
  }

  const merged = arr.filter(Boolean);
  return {
    row: [...merged, ...Array(SIZE - merged.length).fill(0)],
    score,
  };
};

export const moveLeft = (grid: number[][]) => {
  let total = 0;
  const newGrid = grid.map(row => {
    const { row: r, score } = slide(row);
    total += score;
    return r;
  });
  return { newGrid, total };
};

export const moveGrid = (grid: number[][], dir: number) => {
  let temp = grid;
  for (let i = 0; i < dir; i++) temp = rotate(temp);
  const { newGrid, total } = moveLeft(temp);
  let res = newGrid;
  for (let i = 0; i < (4 - dir) % 4; i++) res = rotate(res);
  return { res, total };
};

export const canMove = (g: number[][]) => {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) return true;
      if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
      if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
};
