# Flowy

![Demo](https://media.giphy.com/media/dv1C56OywrP7Cn20nr/giphy.gif) <br>A modern JavaScript library to create beautiful flowcharts with ease ✨

[Dribbble](demo.com) | [Twitter](demo.com) | [Original Demo](docs/original-demo/) | [Documentation](docs/)

## 🚀 Project Status

**Current Version**: 1.0.0 (Modernization in Progress)
**Development Status**: Active Development
**Test Coverage**: 83 tests, 100% pass rate
**Build System**: Modern Vite-based build pipeline

## 📁 Project Structure

```
flowy/
├── src/                    # 🎯 Modern source code (modular architecture)
│   ├── flowy.js           # Main entry point
│   ├── flowy.css          # Core stylesheet
│   ├── core/              # Core modules
│   │   └── block-manager.js # Block management module
│   └── utils/             # Utility modules
│       └── dom-utils.js   # DOM operations module
├── dist/                   # 📦 Build artifacts (Vite-generated)
│   ├── flowy.es.js        # ES module format (31.07 kB)
│   ├── flowy.umd.js       # UMD format (15.06 kB)
│   └── flowy.iife.js      # IIFE format (15.00 kB)
├── docs/                   # 📚 Documentation and demos
│   ├── original-demo/     # ✅ Working baseline demo
│   ├── refactor-demo/     # 🧪 Refactored version demo
│   └── *.md               # Project documentation
├── tests/                  # 🧪 Comprehensive test suite
│   ├── unit/              # Unit tests (83 tests)
│   ├── e2e-test.js        # End-to-end tests
│   └── performance/       # Performance benchmarks
└── build configs...        # Modern build configuration
```

## 🎯 Development Workflow

**Modern Development Strategy:**

1. **Modular Architecture**: Code organized in focused modules with clear responsibilities
2. **Test-Driven Development**: 83 unit tests ensure stability during refactoring
3. **Modern Build System**: Vite provides fast development and optimized production builds
4. **Continuous Integration**: GitHub Actions automate testing and quality checks
5. **Code Quality**: ESLint + Prettier ensure consistent code style

## ✅ Current Achievements

**Testing Infrastructure** ✅
- 83 unit tests with 100% pass rate
- Isolated test environment preventing test interference
- Comprehensive coverage of core functionality
- Performance benchmarking suite

**Modern Build System** ✅
- Vite-based development server with HMR
- Multi-format builds (ES, UMD, IIFE)
- Source maps and code optimization
- Development and production configurations

**Modular Refactoring** 🔄 (In Progress)
- ✅ DOM utilities module extracted
- ✅ Block management module extracted
- 🔄 Snap engine module (planned)
- 🔄 Drag handler module (planned)

**Code Quality Tools** ✅
- ESLint for code quality analysis
- Prettier for consistent formatting
- EditorConfig for cross-editor consistency

## 🌟 About Flowy

Flowy makes creating WebApps with flowchart functionality an incredibly simple task. Build automation software, mindmapping tools, or simple programming platforms in minutes by implementing the library into your project.

**Key Improvements in This Version:**
- 🏗️ **Modular Architecture**: Clean, maintainable code structure
- 🧪 **Comprehensive Testing**: 83 unit tests ensure reliability
- ⚡ **Modern Build System**: Fast development with Vite
- 📦 **Multiple Formats**: ES, UMD, and IIFE builds available
- 🔧 **Developer Experience**: Hot reload, linting, and formatting

Made by [Alyssa X](https://alyssax.com) | Modernized by the Flowy Community

## 📖 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Contributing](#contributing)

## 🚀 Quick Start

### Using CDN (Recommended for quick testing)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="path/to/flowy.css">
    <script src="path/to/flowy.js"></script>
</head>
<body>
    <div class="create-flowy">Drag me!</div>
    <div id="canvas"></div>

    <script>
        flowy($("#canvas"));
    </script>
</body>
</html>
```

### Using npm (Recommended for projects)

```bash
npm install flowy
```

```javascript
import flowy from 'flowy';
import 'flowy/dist/flowy.css';

// Initialize
flowy(document.getElementById('canvas'));
```

## ✨ Features

**Core Features:**
- 🖱️ **Responsive drag and drop** - Smooth interaction across devices
- 🧲 **Automatic snapping** - Intelligent block positioning
- 🔄 **Block rearrangement** - Dynamic workflow restructuring
- 🗑️ **Delete blocks** - Easy workflow editing
- 📐 **Automatic block centering** - Perfect alignment

**Modern Enhancements:**
- 📱 **Mobile-friendly** - Touch device support
- ⚡ **High performance** - Optimized for large workflows
- 🎨 **Customizable styling** - Easy theme integration
- 🔧 **Developer-friendly** - Modern API and tooling

You can try out [the demo](https://alyssax.com/x/flowy) to see the library in action.

## 📦 Installation

### Option 1: CDN (Quick Start)
```html
<!-- Include jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Include Flowy -->
<link rel="stylesheet" href="https://unpkg.com/flowy/dist/flowy.css">
<script src="https://unpkg.com/flowy/dist/flowy.umd.js"></script>
```

### Option 2: npm (Recommended)
```bash
npm install flowy
```

### Option 3: Download
Download the latest release from [GitHub Releases](https://github.com/franksunye/flowy/releases)

## 🛠️ Development

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Setup
```bash
# Clone the repository
git clone https://github.com/franksunye/flowy.git
cd flowy

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Check code quality
npm run format       # Format code
```

## 📚 API Reference

### Initialization

```javascript
flowy(canvas, ongrab, onrelease, onsnap, spacing_x, spacing_y);
```

| Parameter   | Type                  | Description                                                      |
| ----------- | --------------------- | ---------------------------------------------------------------- |
| `canvas`    | _Element/jQuery_      | The element that will contain the blocks                         |
| `ongrab`    | _function_ (optional) | Function that gets triggered when a block is dragged             |
| `onrelease` | _function_ (optional) | Function that gets triggered when a block is released            |
| `onsnap`    | _function_ (optional) | Function that gets triggered when a block snaps with another one |
| `spacing_x` | _integer_ (optional)  | Horizontal spacing between blocks (default 20px)                 |
| `spacing_y` | _integer_ (optional)  | Vertical spacing between blocks (default 80px)                   |

### Creating Draggable Elements

Add the class `.create-flowy` to elements you want to make draggable:

```html
<div class="create-flowy" data-blocktype="start">Start Block</div>
<div class="create-flowy" data-blocktype="process">Process Block</div>
<div class="create-flowy" data-blocktype="decision">Decision Block</div>
```

### Basic Example

```javascript
// Initialize Flowy
flowy(
    document.getElementById('canvas'),
    function(block) { console.log('Block grabbed:', block); },
    function(block) { console.log('Block released:', block); },
    function(block, parent) { console.log('Block snapped:', block, parent); },
    40,  // horizontal spacing
    100  // vertical spacing
);
```

### Methods

#### Get Flowchart Data

```javascript
// Get data as object
const flowData = flowy.output();

// Get data as JSON string
const jsonData = JSON.stringify(flowy.output());
```

**Output Format:**
```javascript
{
    "id": 1,
    "parent": 0,
    "data": [
        {
            "name": "blockid",
            "value": "1"
        }
    ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | _integer_ | Unique identifier for the block |
| `parent` | _integer_ | ID of parent block (-1 for root blocks) |
| `data` | _array_ | Array of input data from the block |
| `name` | _string_ | Name attribute of inputs |
| `value` | _string_ | Value attribute of inputs |

#### Delete All Blocks

```javascript
// Clear the entire flowchart
flowy.deleteBlocks();
```

## 🧪 Testing

Our comprehensive test suite ensures reliability:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests (83 tests)
npm run test:e2e         # End-to-end tests
npm run test:performance # Performance benchmarks

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ 83 unit tests with 100% pass rate
- ✅ API contract testing
- ✅ Drag & drop functionality
- ✅ Snapping algorithm verification
- ✅ Workflow behavior validation
- ✅ Performance benchmarking

## 🤝 Contributing

We welcome all forms of contributions! **Project Status**: 1.0.0 | Active Development | 40% Modular Refactoring

### 🚀 Quick Start
```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/flowy.git
cd flowy && npm install

# 2. Verify environment
npm test                    # 83/83 tests pass
npm run dev                 # Start dev server

# 3. Development workflow
npm run test:watch          # Test watch mode
npm run lint                # Code quality check
```

### 🎯 How to Contribute

**🐛 Bug Fixes**: Search Issues → Create Issue (if needed) → Fork → Fix → Submit PR
**✨ New Features**: Discuss in Issues → Get approval → Create branch → Test → Implement → PR
**📚 Docs/Tests**: Identify issue → Create branch → Improve → Submit PR

### 🔧 Code Standards
- **Quality**: ESLint + Prettier (run `npm run lint`)
- **Testing**: All new features need tests (83/83 current)
- **Commits**: Use clear commit messages (`feat:`, `fix:`, `docs:`)
- **Branches**: `feature/name`, `fix/issue`, `docs/update`

### 📝 Pull Request Process
1. **Pre-check**: `npm run lint && npm test`
2. **Description**: Clear description of changes
3. **Testing**: All tests pass + new tests added
4. **Review**: Code review → Merge

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Original Author**: [Alyssa X](https://alyssax.com)
- **Community Contributors**: Thank you to all who have contributed to modernizing Flowy
- **Testing Framework**: Built with Jest and Playwright
- **Build System**: Powered by Vite

## 📞 Support

## 📚 Documentation

### Core Docs
- **[Quick Start](docs/02_QUICK_START.md)** - Installation, usage, project overview
- **[API Reference](docs/20_API.md)** - Complete API documentation
- **[Development Guide](docs/30_DEVELOPMENT.md)** - Environment setup, testing, code quality
- **[Architecture](docs/10_ARCHITECTURE.md)** - System design and technical decisions
- **[Build & Deploy](docs/50_DEPLOYMENT.md)** - Build system, CI/CD, release process

### Project Management
- **[Product Backlog](docs/00_BACKLOG.md)** - Agile development planning
- **[Changelog](docs/01_CHANGELOG.md)** - Version change records

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/franksunye/flowy/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/franksunye/flowy/discussions)
- 📧 **Email**: hi@alyssax.com

---

**Made with ❤️ by the Flowy community**
