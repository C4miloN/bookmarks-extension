# 🗂️ Advanced Bookmarks Manager

A powerful and feature-rich Chrome extension for managing your browser bookmarks with an intuitive interface and advanced functionality.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow?logo=googlechrome&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Multiple View Modes
- **🌳 Tree View**: Hierarchical view with collapsible folders
- **📋 List View**: Flat list with folder grouping
- **🖼️ Grid View**: Visual grid with large icons (5 per row)

### 🛠️ Advanced Bookmark Management
- **Drag & Drop**: Organize bookmarks by dragging between folders
- **Edit Bookmarks**: Modify titles and URLs directly
- **Delete Bookmarks**: Remove bookmarks with confirmation
- **Context Menu**: Right-click for quick actions

### 🎨 User Experience
- **🌙 Dark/Light Theme**: Toggle between themes with persistence
- **🔍 Search**: Real-time search through all bookmarks
- **📱 Responsive Design**: Adapts to different view modes
- **🎯 Hover Effects**: Tooltips in grid view, URL reveal in tree view

### 💾 Data Management
- **Persistent Settings**: Remembers theme, view mode, and folder states
- **Local Storage**: All preferences saved locally
- **Instant Updates**: Real-time synchronization with Chrome bookmarks

## 🚀 Installation

### Method 1: Load Unpacked (Development)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** in the top-right corner
4. Click **"Load unpacked"** and select the extension folder
5. The extension will appear in your toolbar

### Method 2: Chrome Web Store (Coming Soon)
*This extension will be available on the Chrome Web Store soon.*

## 🎮 Usage

### Basic Navigation
- Click the extension icon in Chrome's toolbar
- Use the view buttons (🌳 📋 🖼️) to switch between display modes
- Type in the search bar to filter bookmarks
- Click any bookmark to open it in a new tab

### Folder Management
- Click folder icons to expand/collapse
- Folder states are remembered between sessions
- All folders start collapsed by default

### Bookmark Operations
- **Edit**: Click the ✏️ button or right-click → "Edit"
- **Delete**: Click the 🗑️ button or right-click → "Delete"
- **Drag & Drop**: Drag bookmarks to reorganize or move between folders
- **Context Menu**: Right-click any bookmark for quick actions

### Theme Switching
- Click the theme button (🌙/☀️) to toggle between dark and light modes
- Your preference is automatically saved

## 🛠️ Development

### Project Structure
```
bookmarks-manager/
├── manifest.json      # Extension configuration
├── popup.html         # Main interface
├── popup.js           # Core functionality
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # This file
```

### Technical Details
- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `bookmarks` (required for bookmark management)
- **Storage**: Uses Chrome's localStorage for preferences
- **Icons**: Google's favicon service for bookmark icons

### Building from Source
No build process required! This extension uses vanilla JavaScript and can be loaded directly into Chrome.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues
Found a bug? Please create an issue with:
- Chrome version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 🎨 Customization

The extension supports easy customization through CSS variables:

```css
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --border-color: #e0e0e0;
    --hover-bg: #f5f5f5;
    /* ... more variables */
}
```

## 📋 Permissions

This extension requires the following permissions:

- `bookmarks`: To read, modify, and organize your bookmarks
- No external data transmission - all data stays locally

## 🔒 Privacy

**Your privacy is important!** This extension:
- Only accesses your bookmarks (as required for functionality)
- Stores all data locally in your browser
- Doesn't transmit any data to external servers
- Doesn't track your browsing behavior

## 🐛 Known Issues

- Drag & drop between different view modes may require refresh
- Very long URLs might be truncated in tooltips
- Large bookmark collections may have slight performance impact

## 📝 Changelog

### v1.0.0
- Initial release
- Three view modes (Tree, List, Grid)
- Drag & drop functionality
- Edit/delete bookmarks
- Theme support
- Search functionality

## 👨‍💻 Author

**Camilo N**
- PayPal: [Donate](https://paypal.me/C4miloN)
- GitHub: [@C4miloN](https://github.com/C4miloN)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions API documentation
- Google Favicon service
- Icons from Unicode emoji set
- Contributors and testers

---

**⭐ If you find this extension useful, please consider giving it a star on GitHub!**