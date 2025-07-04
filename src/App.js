import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Trophy, Play, Info, RotateCcw } from 'lucide-react';

const EaterAI = () => {
  const [gameState, setGameState] = useState('menu'); // menu, config, game, gameOver, scores
  const [playerName, setPlayerName] = useState('');
  const [config, setConfig] = useState({
    startingRobots: 2,
    lives: 3,
    completionPercentage: 80,
    powerUpDuration: 5000,
    aiLearningRate: 1
  });
  
  const [gameData, setGameData] = useState({
    score: 0,
    level: 1,
    lives: 3,
    player: { x: 1, y: 1 },
    robots: [],
    board: [],
    dots: [],
    powerUps: [],
    isPoweredUp: false,
    powerUpTimer: 0,
    aiMemory: {},
    totalDots: 0,
    eatenDots: 0
  });
  
  const [highScores, setHighScores] = useState([
    { name: 'CPU', score: 1000, level: 3 },
    { name: 'BOT', score: 500, level: 2 },
    { name: 'AI', score: 250, level: 1 }
  ]);
  
  const gameLoopRef = useRef();
  const keysRef = useRef({});
  
  // Board dimensions
  const BOARD_WIDTH = 21;
  const BOARD_HEIGHT = 15;
  const CELL_SIZE = 20;
  
  // Generate initial board
  const generateBoard = useCallback(() => {
    const board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    const dots = [];
    
    // Create maze walls (1 = wall, 0 = empty, 2 = dot)
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x === 0 || x === BOARD_WIDTH - 1 || y === 0 || y === BOARD_HEIGHT - 1) {
          board[y][x] = 1; // Border walls
        } else if (x % 4 === 0 && y % 4 === 0) {
          board[y][x] = 1; // Internal walls
        } else if (Math.random() < 0.15) {
          board[y][x] = 1; // Random walls
        } else {
          board[y][x] = 2; // Dots
          dots.push({ x, y });
        }
      }
    }
    
    // Ensure starting areas are clear
    const clearAreas = [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, // Player start
      { x: BOARD_WIDTH - 2, y: BOARD_HEIGHT - 2 } // Robot home
    ];
    
    clearAreas.forEach(area => {
      if (area.x < BOARD_WIDTH && area.y < BOARD_HEIGHT) {
        board[area.y][area.x] = 0;
        // Remove dots from cleared areas
        const dotIndex = dots.findIndex(dot => dot.x === area.x && dot.y === area.y);
        if (dotIndex !== -1) dots.splice(dotIndex, 1);
      }
    });
    
    return { board, dots };
  }, []);
  
  // Initialize robots with AI memory
  const initializeRobots = useCallback((level) => {
    const robotCount = Math.min(config.startingRobots + level - 1, 8);
    const robots = [];
    const homeX = BOARD_WIDTH - 2;
    const homeY = BOARD_HEIGHT - 2;
    
    for (let i = 0; i < robotCount; i++) {
      robots.push({
        id: i,
        x: homeX,
        y: homeY,
        targetX: homeX,
        targetY: homeY,
        speed: 200 + level * 10,
        lastMove: Date.now(),
        memory: {
          playerPositions: [],
          escapeRoutes: [],
          powerUpLocations: [],
          huntingPatterns: []
        }
      });
    }
    
    return robots;
  }, [config.startingRobots]);
  
  // Start new game
  const startNewGame = useCallback(() => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    
    const { board, dots } = generateBoard();
    const robots = initializeRobots(1);
    
    setGameData({
      score: 0,
      level: 1,
      lives: config.lives,
      player: { x: 1, y: 1 },
      robots,
      board,
      dots,
      powerUps: [],
      isPoweredUp: false,
      powerUpTimer: 0,
      aiMemory: {},
      totalDots: dots.length,
      eatenDots: 0
    });
    
    setGameState('game');
  }, [playerName, config.lives, generateBoard, initializeRobots]);
  
  // AI pathfinding with learning
  const findPath = useCallback((startX, startY, targetX, targetY, board, aiMemory) => {
    const queue = [{ x: startX, y: startY, path: [] }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    
    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      
      if (x === targetX && y === targetY) {
        return path;
      }
      
      const directions = [
        { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
      ];
      
      // AI learning: prefer directions that previously led to player
      if (aiMemory.huntingPatterns && aiMemory.huntingPatterns.length > 0) {
        directions.sort((a, b) => {
          const aSuccess = aiMemory.huntingPatterns.filter(p => p.dx === a.dx && p.dy === a.dy).length;
          const bSuccess = aiMemory.huntingPatterns.filter(p => p.dx === b.dx && p.dy === b.dy).length;
          return bSuccess - aSuccess;
        });
      }
      
      for (const { dx, dy } of directions) {
        const newX = x + dx;
        const newY = y + dy;
        const key = `${newX},${newY}`;
        
        if (newX >= 0 && newX < BOARD_WIDTH && 
            newY >= 0 && newY < BOARD_HEIGHT && 
            board[newY][newX] !== 1 && 
            !visited.has(key)) {
          
          visited.add(key);
          queue.push({
            x: newX,
            y: newY,
            path: [...path, { x: newX, y: newY }]
          });
        }
      }
    }
    
    return [];
  }, []);
  
  // Update AI robots with learning
  const updateRobots = useCallback((robots, player, board, isPoweredUp, level) => {
    const now = Date.now();
    
    return robots.map(robot => {
      if (now - robot.lastMove < robot.speed) return robot;
      
      const newRobot = { ...robot };
      
      // Update AI memory with player position
      newRobot.memory.playerPositions.push({ x: player.x, y: player.y, timestamp: now });
      if (newRobot.memory.playerPositions.length > 50) {
        newRobot.memory.playerPositions.shift();
      }
      
      let targetX, targetY;
      
      if (isPoweredUp) {
        // Flee from player
        targetX = robot.x + (robot.x - player.x);
        targetY = robot.y + (robot.y - player.y);
        
        // Ensure target is within bounds
        targetX = Math.max(1, Math.min(BOARD_WIDTH - 2, targetX));
        targetY = Math.max(1, Math.min(BOARD_HEIGHT - 2, targetY));
      } else {
        // AI learning: predict player movement
        const recentPositions = newRobot.memory.playerPositions.slice(-5);
        if (recentPositions.length >= 2) {
          const lastPos = recentPositions[recentPositions.length - 1];
          const prevPos = recentPositions[recentPositions.length - 2];
          
          // Predict where player might go based on recent movement
          const predictedX = lastPos.x + (lastPos.x - prevPos.x);
          const predictedY = lastPos.y + (lastPos.y - prevPos.y);
          
          targetX = Math.max(0, Math.min(BOARD_WIDTH - 1, predictedX));
          targetY = Math.max(0, Math.min(BOARD_HEIGHT - 1, predictedY));
        } else {
          targetX = player.x;
          targetY = player.y;
        }
      }
      
      const path = findPath(robot.x, robot.y, targetX, targetY, board, newRobot.memory);
      
      if (path.length > 0) {
        const nextMove = path[0];
        newRobot.x = nextMove.x;
        newRobot.y = nextMove.y;
        
        // Learn from successful hunting patterns
        if (!isPoweredUp && path.length <= 3) {
          newRobot.memory.huntingPatterns.push({
            dx: nextMove.x - robot.x,
            dy: nextMove.y - robot.y,
            success: true
          });
        }
      }
      
      newRobot.lastMove = now;
      return newRobot;
    });
  }, [findPath]);
  
  // Handle player movement
  const movePlayer = useCallback((dx, dy) => {
    setGameData(prev => {
      const newX = prev.player.x + dx;
      const newY = prev.player.y + dy;
      
      if (newX < 0 || newX >= BOARD_WIDTH || 
          newY < 0 || newY >= BOARD_HEIGHT || 
          prev.board[newY][newX] === 1) {
        return prev;
      }
      
      const newGameData = { ...prev };
      newGameData.player = { x: newX, y: newY };
      
      // Check if player eats a dot
      if (prev.board[newY][newX] === 2) {
        newGameData.board = prev.board.map(row => [...row]);
        newGameData.board[newY][newX] = 0;
        newGameData.score += 10;
        newGameData.eatenDots += 1;
        
        // Spawn power-up occasionally
        if (Math.random() < 0.1 && prev.powerUps.length === 0) {
          const availableCells = [];
          for (let y = 1; y < BOARD_HEIGHT - 1; y++) {
            for (let x = 1; x < BOARD_WIDTH - 1; x++) {
              if (newGameData.board[y][x] === 0) {
                availableCells.push({ x, y });
              }
            }
          }
          
          if (availableCells.length > 0) {
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            newGameData.powerUps = [randomCell];
          }
        }
      }
      
      // Check power-up collection
      const powerUpIndex = prev.powerUps.findIndex(p => p.x === newX && p.y === newY);
      if (powerUpIndex !== -1) {
        newGameData.powerUps = prev.powerUps.filter((_, i) => i !== powerUpIndex);
        newGameData.isPoweredUp = true;
        newGameData.powerUpTimer = Date.now() + config.powerUpDuration;
        newGameData.score += 50;
      }
      
      return newGameData;
    });
  }, [config.powerUpDuration]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'game') return;
    
    const gameLoop = () => {
      setGameData(prev => {
        const newGameData = { ...prev };
        
        // Update power-up timer
        if (prev.isPoweredUp && Date.now() > prev.powerUpTimer) {
          newGameData.isPoweredUp = false;
        }
        
        // Update robots with AI learning
        newGameData.robots = updateRobots(
          prev.robots, 
          prev.player, 
          prev.board, 
          prev.isPoweredUp, 
          prev.level
        );
        
        // Check collisions
        for (const robot of newGameData.robots) {
          if (robot.x === prev.player.x && robot.y === prev.player.y) {
            if (prev.isPoweredUp) {
              // Eat robot
              newGameData.score += 100;
              robot.x = BOARD_WIDTH - 2;
              robot.y = BOARD_HEIGHT - 2;
            } else {
              // Player hit by robot
              newGameData.lives -= 1;
              if (newGameData.lives <= 0) {
                // Game over
                const newScore = { name: playerName, score: prev.score, level: prev.level };
                setHighScores(prevScores => {
                  const newScores = [...prevScores, newScore];
                  return newScores.sort((a, b) => b.score - a.score).slice(0, 3);
                });
                setGameState('gameOver');
                return prev;
              } else {
                // Reset player position
                newGameData.player = { x: 1, y: 1 };
              }
            }
          }
        }
        
        // Check level completion
        const completion = (prev.eatenDots / prev.totalDots) * 100;
        if (completion >= config.completionPercentage) {
          // Level up
          newGameData.level += 1;
          newGameData.score += 500 * prev.level;
          
          const { board, dots } = generateBoard();
          newGameData.board = board;
          newGameData.dots = dots;
          newGameData.totalDots = dots.length;
          newGameData.eatenDots = 0;
          newGameData.player = { x: 1, y: 1 };
          newGameData.robots = initializeRobots(newGameData.level);
          newGameData.powerUps = [];
          newGameData.isPoweredUp = false;
        }
        
        return newGameData;
      });
    };
    
    gameLoopRef.current = setInterval(gameLoop, 100);
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, updateRobots, config.completionPercentage, generateBoard, initializeRobots, playerName]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      
      if (gameState === 'game') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            movePlayer(0, -1);
            break;
          case 'ArrowDown':
            e.preventDefault();
            movePlayer(0, 1);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
          case 'ArrowRight':
            e.preventDefault();
            movePlayer(1, 0);
            break;
        }
      }
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, movePlayer]);
  
  // Render game board
  const renderBoard = () => {
    const cells = [];
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cellType = gameData.board[y][x];
        let content = '';
        let className = 'absolute border border-gray-600 ';
        
        switch (cellType) {
          case 1:
            className += 'bg-blue-600';
            break;
          case 2:
            className += 'bg-black';
            content = '•';
            break;
          default:
            className += 'bg-black';
        }
        
        cells.push(
          <div
            key={`${x}-${y}`}
            className={className}
            style={{
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'yellow',
              fontSize: '8px'
            }}
          >
            {content}
          </div>
        );
      }
    }
    
    // Add player
    cells.push(
      <div
        key="player"
        className="absolute bg-yellow-400 rounded-full border-2 border-yellow-600"
        style={{
          left: gameData.player.x * CELL_SIZE + 2,
          top: gameData.player.y * CELL_SIZE + 2,
          width: CELL_SIZE - 4,
          height: CELL_SIZE - 4,
          boxShadow: gameData.isPoweredUp ? '0 0 10px #ffff00' : 'none'
        }}
      />
    );
    
    // Add robots
    gameData.robots.forEach(robot => {
      cells.push(
        <div
          key={`robot-${robot.id}`}
          className={`absolute rounded border-2 ${
            gameData.isPoweredUp ? 'bg-blue-300 border-blue-500' : 'bg-red-500 border-red-700'
          }`}
          style={{
            left: robot.x * CELL_SIZE + 2,
            top: robot.y * CELL_SIZE + 2,
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4
          }}
        />
      );
    });
    
    // Add power-ups
    gameData.powerUps.forEach((powerUp, index) => {
      cells.push(
        <div
          key={`powerup-${index}`}
          className="absolute bg-green-400 rounded-full border-2 border-green-600"
          style={{
            left: powerUp.x * CELL_SIZE + 4,
            top: powerUp.y * CELL_SIZE + 4,
            width: CELL_SIZE - 8,
            height: CELL_SIZE - 8,
            animation: 'pulse 1s infinite'
          }}
        />
      );
    });
    
    return cells;
  };
  
  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
          EaterAI
        </h1>
        <p className="text-xl mb-8 text-center max-w-2xl">
          Eat your way through the board while dodging intelligent AI robots that learn your patterns!
        </p>
        
        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white text-center"
            maxLength={20}
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={startNewGame}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Play size={20} />
            Start Game
          </button>
          
          <button
            onClick={() => setGameState('config')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Settings size={20} />
            Config
          </button>
          
          <button
            onClick={() => setGameState('scores')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Trophy size={20} />
            High Scores
          </button>
        </div>
      </div>
    );
  }
  
  // Configuration screen
  if (gameState === 'config') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <h2 className="text-4xl font-bold mb-8">Configuration</h2>
        
        <div className="bg-gray-800 p-6 rounded-lg space-y-6 w-full max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Starting Robots (1-8)</label>
            <input
              type="range"
              min="1"
              max="8"
              value={config.startingRobots}
              onChange={(e) => setConfig(prev => ({ ...prev, startingRobots: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400">{config.startingRobots}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Lives (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={config.lives}
              onChange={(e) => setConfig(prev => ({ ...prev, lives: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400">{config.lives}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Completion % (70-90)</label>
            <input
              type="range"
              min="70"
              max="90"
              value={config.completionPercentage}
              onChange={(e) => setConfig(prev => ({ ...prev, completionPercentage: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400">{config.completionPercentage}%</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Power-up Duration (3-10 seconds)</label>
            <input
              type="range"
              min="3000"
              max="10000"
              step="1000"
              value={config.powerUpDuration}
              onChange={(e) => setConfig(prev => ({ ...prev, powerUpDuration: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400">{config.powerUpDuration / 1000}s</div>
          </div>
        </div>
        
        <button
          onClick={() => setGameState('menu')}
          className="mt-8 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Back to Menu
        </button>
      </div>
    );
  }
  
  // High scores screen
  if (gameState === 'scores') {
    return (
      <div className="flex flex-col items-center justify-center min-h
