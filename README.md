# 🤖 EaterAI

A classic arcade-style game where you eat dots while dodging intelligent AI robots that learn your movement patterns and get smarter over time!

![EaterAI Game](https://img.shields.io/badge/Game-EaterAI-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![AI](https://img.shields.io/badge/AI-Learning%20Robots-red)

## 🎮 Game Features

- **🧠 Intelligent AI**: Robots that learn your movement patterns and adapt their hunting strategies
- **📈 Progressive Difficulty**: Each level adds more robots AND makes them smarter
- **⚙️ Fully Configurable**: Customize robot count, lives, completion percentage, and power-up duration
- **🏆 Persistent Leaderboard**: Top 3 high scores with player names saved locally
- **🎯 Classic Gameplay**: Eat dots, avoid robots, grab power-ups to turn the tables
- **🎨 Modern UI**: Clean, responsive design with smooth animations

## 🚀 How to Play

1. **Enter your name** and click "Start Game"
2. **Use arrow keys** to move your yellow character around the maze
3. **Eat the yellow dots** to score points and progress through the level
4. **Avoid the red robots** - they're learning your patterns and getting smarter!
5. **Grab green power-ups** to temporarily become invincible and eat the robots
6. **Complete 80%** of the board to advance to the next level
7. **Survive and score high** to make it onto the top 3 leaderboard!

## 🎯 Game Controls

- **↑ ↓ ← →** Arrow Keys: Move your character
- **Configuration Menu**: Adjust game settings
- **High Scores**: View the top 3 players

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (comes with Node.js)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eaterai.git
   cd eaterai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🌐 Deploy to GitHub Pages

1. **Update package.json** with your GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/eaterai"
   ```

2. **Install gh-pages** (if not already installed):
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

Your game will be live at `https://yourusername.github.io/eaterai`

## 🤖 AI Features

The robots in EaterAI aren't just simple chasers - they're genuinely intelligent:

- **Pattern Recognition**: Robots remember where you've been and predict where you're going
- **Adaptive Pathfinding**: AI learns your favorite escape routes and cuts them off
- **Cross-Level Learning**: Robots get smarter between levels, not just more numerous
- **Coordinated Hunting**: Multiple robots work together to corner you
- **Dynamic Difficulty**: The challenge evolves based on your playstyle

## 🎛️ Configuration Options

Customize your experience:
- **Starting Robots**: 1-8 robots to begin with
- **Lives**: 1-5 lives per game
- **Completion Percentage**: 70-90% board completion to advance
- **Power-up Duration**: 3-10 seconds of invincibility

## 🏗️ Built With

- **React 18.2.0** - Frontend framework
- **Tailwind CSS** - Styling and animations
- **Lucide React** - Modern icons
- **Custom AI Algorithm** - Smart robot behavior and learning

## 📱 Browser Compatibility

EaterAI works on all modern browsers:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for desktop and mobile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Game Tips

- **Study the robots**: They learn from your movements, so try changing your patterns!
- **Use walls strategically**: Corner yourself deliberately to force robots into predictable paths
- **Save power-ups**: Don't grab them immediately - wait for the right moment
- **Watch the progress bar**: You only need 80% completion, so plan your route efficiently
- **Each level teaches the AI**: The robots get smarter, so adapt your strategy!

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information

## ⭐ Star this Repository

If you enjoyed EaterAI, please give it a star! It helps others discover the game.

---

**Happy Gaming! 🎮** 

Challenge yourself against AI that actually learns and evolves. Can you outsmart the machines?
