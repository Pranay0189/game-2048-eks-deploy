import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typography from "@mui/material/Typography";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PaletteIcon from "@mui/icons-material/Palette";
import "./Game2048.css";

/* =====================
   Constants
===================== */
const SIZE = 4;
const TARGET = 2048;
const MAX_UNDO = 5;

/* =====================
   Grid Utilities
===================== */
const emptyGrid = () =>
  Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(0));

const rotate = (g: number[][]) =>
  g[0].map((_, i) => g.map((r) => r[i]).reverse());

const slide = (row: number[]) => {
  const original = [...row];
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
  const newRow = [...merged, ...Array(SIZE - merged.length).fill(0)];
  const moved = !original.every((v, i) => v === newRow[i]);

  return { row: newRow, score, moved };
};

const moveLeft = (grid: number[][]) => {
  let total = 0;
  let moved = false;

  const newGrid = grid.map((r) => {
    const { row, score, moved: rowMoved } = slide(r);
    total += score;
    moved ||= rowMoved;
    return row;
  });

  return { newGrid, total, moved };
};

const moveGrid = (grid: number[][], dir: number) => {
  let temp = grid;
  for (let i = 0; i < dir; i++) temp = rotate(temp);
  const { newGrid, total, moved } = moveLeft(temp);
  let res = newGrid;
  for (let i = 0; i < (4 - dir) % 4; i++) res = rotate(res);
  return { res, total, moved };
};

const addRandomTile = (grid: number[][]) => {
  const empty: number[][] = [];
  grid.forEach((r, i) =>
    r.forEach((c, j) => c === 0 && empty.push([i, j]))
  );
  if (!empty.length) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const g = grid.map((row) => [...row]);
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
};

const canMove = (g: number[][]) => {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) return true;
      if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
      if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
};

/* =====================
   Tile
===================== */
const Tile = React.memo(({ value }: { value: number }) => (
  <motion.div layout className={`tile ${value ? `tile-${value}` : ""}`}>
    {value || ""}
  </motion.div>
));

/* =====================
   Main Component
===================== */
export default function Game2048() {
  const [grid, setGrid] = useState(emptyGrid());
  const [history, setHistory] = useState<number[][][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("hs")) || 0
  );
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [theme, setTheme] = useState("classic");

  const themeClass = useMemo(() => `theme-${theme}`, [theme]);

  const startGame = () => {
    const g = addRandomTile(addRandomTile(emptyGrid()));
    setGrid(g);
    setHistory([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setWon(false);
    setStarted(true);
  };

  const handleMove = useCallback(
    (dir: number) => {
      if (gameOver || won) return;
      const { res, total, moved } = moveGrid(grid, dir);
      if (!moved) return;

      setHistory((h) => [grid, ...h].slice(0, MAX_UNDO));
      const next = addRandomTile(res);
      const newScore = score + total;

      setGrid(next);
      setScore(newScore);
      setMoves((m) => m + 1);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("hs", String(newScore));
      }
      if (next.flat().includes(TARGET)) setWon(true);
      if (!canMove(next)) setGameOver(true);
    },
    [grid, score, gameOver, won, highScore]
  );

  /* 🔄 Undo */
  const undo = () => {
    if (!history.length) return;
    const [prev, ...rest] = history;
    setGrid(prev);
    setHistory(rest);
  };

  /* 🤖 AI Autoplay — THIS FIXES THE BUILD ERROR */
  useEffect(() => {
    if (!autoPlay) return;

    const id = setInterval(() => {
      let bestDir: number | null = null;
      let bestScore = -1;

      for (let d = 0; d < 4; d++) {
        const { res, total, moved } = moveGrid(grid, d);
        if (!moved) continue;

        const empty = res.flat().filter(v => v === 0).length;
        const score = total + empty * 10;

        if (score > bestScore) {
          bestScore = score;
          bestDir = d;
        }
      }

      if (bestDir !== null) handleMove(bestDir);
    }, 200);

    return () => clearInterval(id);
  }, [autoPlay, grid, handleMove]);

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = {
        ArrowLeft: 0,
        ArrowUp: 1,
        ArrowRight: 2,
        ArrowDown: 3,
      };
      if (map[e.key] !== undefined) handleMove(map[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove]);

  if (!started) {
    return (
      <div className="start-screen theme-classic">
        <div className="card">
          <Typography variant="h3">2048</Typography>
          <button className="button" onClick={startGame}>
            Play Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-root ${themeClass}`}>
      <div className="controls">
        <div className="card">Score: {score}</div>
        <div className="card">
          <EmojiEventsIcon fontSize="small" /> {highScore}
        </div>
        <div className="card">Moves: {moves}</div>

        <button className="button" onClick={undo}>Undo</button>
        <button className="button" onClick={() => setAutoPlay(a => !a)}>
          <SmartToyIcon />
        </button>
        <button
          className="button"
          onClick={() =>
            setTheme(t =>
              t === "classic" ? "light" : t === "light" ? "ocean" : "classic"
            )
          }
        >
          <PaletteIcon />
        </button>
      </div>

      <div className="grid-wrapper">
        <div className="grid">
          {grid.flat().map((v, i) => (
            <Tile key={i} value={v} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {(gameOver || won) && (
          <motion.div className="overlay">
            <div className="overlay-card">
              <Typography variant="h4">
                {won ? "You Win!" : "Game Over"}
              </Typography>
              <p>Score: {score}</p>
              <button className="button" onClick={startGame}>
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
