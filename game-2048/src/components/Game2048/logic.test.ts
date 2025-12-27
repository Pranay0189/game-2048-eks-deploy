import { describe, it, expect } from "vitest";
import { slide, moveGrid, canMove } from "./logic";

describe("2048 logic", () => {
  it("merges tiles correctly", () => {
    const { row, score } = slide([2, 2, 4, 0]);
    expect(row).toEqual([4, 4, 0, 0]);
    expect(score).toBe(4);
  });

  it("moves grid left", () => {
    const grid = [
      [2, 0, 2, 0],
      [0, 4, 0, 4],
      [2, 2, 2, 2],
      [0, 0, 0, 0],
    ];

    const { res } = moveGrid(grid, 0);
    expect(res[0]).toEqual([4, 0, 0, 0]);
  });

  it("detects game over", () => {
    const grid = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];

    expect(canMove(grid)).toBe(false);
  });
});
