# Flowy

![Demo](https://media.giphy.com/media/dv1C56OywrP7Cn20nr/giphy.gif)
<br>An javascript library to create pretty flowcharts with ease ✨

[Dribbble](demo.com) | [Twitter](demo.com) | [Original Demo](docs/original-demo/)

## 📁 Project Structure

```
flowy/
├── src/                    # 🎯 Source code (development base)
│   ├── flowy.js           # Main source code (472 lines)
│   └── flowy.css          # Main stylesheet (41 lines)
├── dist/                   # 📦 Build artifacts (working versions)
│   ├── flowy.js           # Development version (same as src/)
│   ├── flowy.css          # Development version (same as src/)
│   ├── flowy.min.js       # Production version (29,780 bytes - working)
│   └── flowy.min.css      # Production version (1,094 bytes - working)
├── docs/                   # 📚 Documentation and demos
│   ├── original-demo/     # ✅ Working baseline demo
│   └── src-demo/          # 🧪 Source code demo (for testing)
├── tests/                  # 🧪 Automated tests
│   ├── simple-test.js     # Basic functionality test
│   ├── detailed-comparison.js # Comprehensive comparison test
│   └── flowy-comparison.js # Full feature test suite
└── tools/                  # 🔧 Build tools (future)
```

## 🎯 Development Workflow

**Verified Development Strategy:**
1. **Source Code**: All development work should be based on `src/` directory
2. **Testing**: Use `docs/original-demo/` as the functional baseline
3. **Validation**: Automated tests confirm `src/` matches demo functionality
4. **Build**: Generate `dist/` from `src/` (future implementation)

## ✅ Verification Status

Through automated Playwright testing, we have confirmed:
- ✅ `src/flowy.js` is the authentic source code for the working demo
- ✅ All core functionality matches between src and demo versions
- ✅ Safe to proceed with modernization based on `src/` directory

## 📦 Dist Directory Management

**Current Status**: `dist/` contains working versions copied from `docs/original-demo/`
- `dist/flowy.min.js` (29,780 bytes) - Working production version
- `dist/flowy.min.css` (1,094 bytes) - Working production version
- `dist/flowy.js` and `dist/flowy.css` - Same as `src/` versions

**Future Plan**: Establish automated build pipeline `src/` → `dist/`


Flowy makes creating WebApps with flowchart functionality an incredibly simple task. Build automation software, mindmapping tools, or simple programming platforms in minutes by implementing the library into your project. 



Made by [Alyssa X](https://alyssax.com)

## Table of contents
- [Features](#features)
- [Installation](#installation)
- [Running Flowy](#running-flowy)
    - [Initialization](#initialization)
    - [Example](#example)
- [Methods](#methods)
    - [Get the flowchart data](#get-the-flowchart-data)
    - [Delete all blocks](#delete-all-blocks)


## Features
Currently, Flowy supports the following:

 - Responsive drag and drop
 - Automatic snapping
 - Block rearrangement
 - Delete blocks
 - Automatic block centering
 
 You can try out [the demo](https://alyssax.com/x/flowy) to see the library in action.
 

## Installation
Adding Flowy to your WebApp is incredibly simple:
1. Include jQuery to your project
2. Link `flowy.min.js` and `flowy.min.css` to your project

## Running Flowy

### Initialization
```javascript
flowy(canvas, ongrab, onrelease, onsnap, spacing_x, spacing_y);
```

Parameter | Type | Description
--- | --- | ---
   `canvas` | *jQuery object* | The element that will contain the blocks 
   `ongrab` | *function* (optional) |  Function that gets triggered when a block is dragged
   `onrelease` | *function* (optional) |  Function that gets triggered when a block is released
   `onsnap` | *function* (optional) |  Function that gets triggered when a block snaps with another one
   `spacing_x` | *integer* (optional) |  Horizontal spacing between blocks (default 20px)
   `spacing_Y` | *integer* (optional) |  Vertical spacing between blocks (default 80px)

To define the blocks that can be dragged, you need to add the class `.create-flowy`

### Example
**HTML**
```html
<div class="create-flowy">The block to be dragged</div>
<div id="canvas"></div>
```
**Javascript**
```javascript
var spacing_x = 40;
var spacing_y = 100;
// Initialize Flowy
flowy($("#canvas"), onGrab, onRelease, onSnap, spacing_x, spacing_y);
function onGrab(){
	// When the user grabs a block
}
function onRelease(){
	// When the user releases a block
}
function onSnap(){
	// When a block snaps with another one
}
```
## Methods
### Get the flowchart data
```javascript
// As an object
flowy.output();
// As a JSON string
JSON.stringify(flowy.output());
```
The JSON object that gets outputted looks like this:
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
Here's what each property means:
Key | Value type | Description
--- | --- | ---
   `id` | *integer* | Unique value that identifies a block 
   `parent` | *integer* |  The `id` of the parent a block is attached to (-1 means the block has no parent)
   `data` | *array of objects* |  An array of all the inputs within the selected block
   `name` | *string* |  The name attribute of the input
   `value` | *string* |  The value attribute of the input

### Delete all blocks
To remove all blocks at once use:
```javascript
flowy.deleteBlocks()
```
Currently there is no method to individually remove blocks. The only way to go about it is by splitting branches manually.
#
 Feel free to reach out to me through email at hi@alyssax.com or [on Twitter](https://twitter.com/alyssaxuu) if you have any questions or feedback! Hope you find this useful 💜