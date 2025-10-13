document.addEventListener('DOMContentLoaded', function() {
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    const searchInput = document.getElementById('search');
    const themeToggle = document.getElementById('themeToggle');
    const viewButtons = document.querySelectorAll('.view-button');
    const contextMenu = document.getElementById('contextMenu');
    const editModal = document.getElementById('editModal');
    const editTitle = document.getElementById('editTitle');
    const editUrl = document.getElementById('editUrl');
    const saveEdit = document.getElementById('saveEdit');
    const cancelEdit = document.getElementById('cancelEdit');
    const modalTitle = document.getElementById('modalTitle');
    const openInNewTabCheckbox = document.getElementById('openInNewTab');
    
    let currentTheme = 'light';
    let currentView = 'tree';
    let collapsedFolders = new Set();
    let bookmarkData = null;
    let dragSource = null;
    let currentEditingBookmark = null;
    let openInNewTab = true;

    // Theme Management
    function initTheme() {
        const savedTheme = localStorage.getItem('bookmarksTheme');
        if (savedTheme) {
            currentTheme = savedTheme;
        }
        applyTheme();
    }

    function applyTheme() {
        document.body.setAttribute('data-theme', currentTheme);
        themeToggle.textContent = currentTheme === 'light' ? '🌙 Dark' : '☀️ Light';
        localStorage.setItem('bookmarksTheme', currentTheme);
    }

    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme();
    });

    // Tab Opening Preference
    function initTabPreference() {
        const savedTabPreference = localStorage.getItem('bookmarksOpenInNewTab');
        if (savedTabPreference !== null) {
            openInNewTab = savedTabPreference === 'true';
            openInNewTabCheckbox.checked = openInNewTab;
        }
    }

    function saveTabPreference() {
        localStorage.setItem('bookmarksOpenInNewTab', openInNewTab);
    }

    openInNewTabCheckbox.addEventListener('change', function() {
        openInNewTab = this.checked;
        saveTabPreference();
    });

    // View Management
    function initView() {
        const savedView = localStorage.getItem('bookmarksView');
        if (savedView) {
            currentView = savedView;
        }
        applyView();
    }

    function applyView() {
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === currentView);
        });
        
        bookmarksContainer.className = 'bookmarks-container';
        bookmarksContainer.classList.add(`${currentView}-view`);
        
        localStorage.setItem('bookmarksView', currentView);
        
        if (bookmarkData) {
            renderBookmarks();
        }
    }

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentView = this.dataset.view;
            applyView();
        });
    });

    // Collapsed State Management
    function loadCollapsedState() {
        const saved = localStorage.getItem('collapsedFolders');
        if (saved) {
            collapsedFolders = new Set(JSON.parse(saved));
        } else {
            chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
                setAllFoldersCollapsed(bookmarkTreeNodes[0]);
            });
        }
    }

    function setAllFoldersCollapsed(node) {
        if (node.children) {
            collapsedFolders.add(node.id);
            node.children.forEach(child => {
                if (child.children) {
                    setAllFoldersCollapsed(child);
                }
            });
        }
        saveCollapsedState();
    }

    function saveCollapsedState() {
        localStorage.setItem('collapsedFolders', JSON.stringify([...collapsedFolders]));
    }

    // Bookmarks Management
    function loadBookmarks(searchTerm = '') {
        chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
            bookmarkData = bookmarkTreeNodes;
            if (searchTerm) {
                displaySearchResults(bookmarkTreeNodes, searchTerm);
            } else {
                renderBookmarks();
            }
        });
    }

    function renderBookmarks() {
        bookmarksContainer.innerHTML = '';
        
        if (currentView === 'tree') {
            displayBookmarkTree(bookmarkData[0].children);
        } else if (currentView === 'list') {
            displayBookmarkList(bookmarkData[0].children);
        } else if (currentView === 'grid') {
            displayBookmarkGrid(bookmarkData[0].children);
        }
    }

    // Tree View
    function displayBookmarkTree(nodes, parentElement = bookmarksContainer, level = 0) {
        nodes.forEach(node => {
            if (node.children) {
                const folderElement = createFolderElement(node, level, 'tree');
                parentElement.appendChild(folderElement);
                
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'folder-children';
                
                if (!collapsedFolders.has(node.id)) {
                    childrenContainer.classList.add('expanded');
                    displayBookmarkTree(node.children, childrenContainer, level + 1);
                }
                
                folderElement.appendChild(childrenContainer);
            } else if (node.url) {
                const bookmarkElement = createBookmarkElement(node, 'tree');
                parentElement.appendChild(bookmarkElement);
            }
        });
    }

    // List View
    function displayBookmarkList(nodes, parentElement = bookmarksContainer, currentFolder = '') {
        nodes.forEach(node => {
            if (node.children) {
                const folderName = currentFolder ? `${currentFolder} › ${node.title}` : node.title;
                const folderHeader = document.createElement('div');
                folderHeader.className = 'folder-header';
                folderHeader.innerHTML = `📁 ${node.title} <span style="margin-left: auto; font-size: 11px; color: #666;">(${countBookmarks(node)})</span>`;
                parentElement.appendChild(folderHeader);
                
                displayBookmarkList(node.children, parentElement, folderName);
            } else if (node.url) {
                const bookmarkElement = createBookmarkElement(node, 'list');
                parentElement.appendChild(bookmarkElement);
            }
        });
    }

    // Grid View
    function displayBookmarkGrid(nodes, parentElement = bookmarksContainer) {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-view';
        parentElement.appendChild(gridContainer);

        nodes.forEach(node => {
            if (node.children) {
                const folderHeader = document.createElement('div');
                folderHeader.className = 'folder-header';
                folderHeader.textContent = `📁 ${node.title} (${countBookmarks(node)})`;
                gridContainer.appendChild(folderHeader);
                
                displayBookmarkGrid(node.children, gridContainer);
            } else if (node.url) {
                const bookmarkElement = createBookmarkElement(node, 'grid');
                gridContainer.appendChild(bookmarkElement);
            }
        });
    }

    // Search Results
    function displaySearchResults(bookmarkTreeNodes, searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();
        
        function searchNodes(nodes, path = '') {
            nodes.forEach(node => {
                const currentPath = path ? `${path} › ${node.title}` : node.title;
                
                if (node.children) {
                    searchNodes(node.children, currentPath);
                } else if (node.url && (
                    node.title.toLowerCase().includes(term) || 
                    node.url.toLowerCase().includes(term)
                )) {
                    results.push({...node, path: currentPath});
                }
            });
        }
        
        searchNodes(bookmarkTreeNodes);
        
        bookmarksContainer.innerHTML = '';
        
        if (results.length > 0) {
            const info = document.createElement('div');
            info.className = 'search-info';
            info.textContent = `${results.length} bookmarks found`;
            bookmarksContainer.appendChild(info);
            
            results.forEach(bookmark => {
                const element = createBookmarkElement(bookmark, currentView, true);
                bookmarksContainer.appendChild(element);
            });
        } else {
            const empty = document.createElement('div');
            empty.className = 'empty-folder';
            empty.textContent = 'No bookmarks found';
            bookmarksContainer.appendChild(empty);
        }
    }

    // Create Folder Element
    function createFolderElement(folder, level, viewType) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.setAttribute('data-folder-id', folder.id);
        folderDiv.setAttribute('draggable', 'true');
        
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `
            <span class="folder-icon ${collapsedFolders.has(folder.id) ? 'collapsed' : ''}">📁</span>
            <span>${folder.title}</span>
            <span style="margin-left: auto; font-size: 11px; color: #666;">(${countBookmarks(folder)})</span>
        `;
        
        // Folder click to expand/collapse
        header.addEventListener('click', function(e) {
            if (e.target.closest('.bookmark-actions')) return;
            
            const childrenContainer = folderDiv.querySelector('.folder-children');
            const icon = folderDiv.querySelector('.folder-icon');
            
            if (collapsedFolders.has(folder.id)) {
                collapsedFolders.delete(folder.id);
                icon.classList.remove('collapsed');
                childrenContainer.classList.add('expanded');
                
                if (childrenContainer.children.length === 0) {
                    displayBookmarkTree(folder.children, childrenContainer, level + 1);
                }
            } else {
                collapsedFolders.add(folder.id);
                icon.classList.add('collapsed');
                childrenContainer.classList.remove('expanded');
            }
            saveCollapsedState();
        });

        // Drag events for folder
        setupDragEvents(folderDiv, 'folder', folder);
        
        folderDiv.appendChild(header);
        return folderDiv;
    }

    // Count Bookmarks
    function countBookmarks(node) {
        let count = 0;
        if (node.children) {
            node.children.forEach(child => {
                if (child.children) {
                    count += countBookmarks(child);
                } else if (child.url) {
                    count++;
                }
            });
        }
        return count;
    }

    // Create Bookmark Element
    function createBookmarkElement(bookmark, viewType = 'tree', showPath = false) {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        div.setAttribute('data-bookmark-id', bookmark.id);
        div.setAttribute('draggable', 'true');
        
        const favicon = document.createElement('img');
        favicon.className = 'favicon';
        try {
            const domain = new URL(bookmark.url).hostname;
            favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=${viewType === 'grid' ? 32 : 16}`;
        } catch {
            favicon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRjE2QzM5Ii8+Cjx0ZXh0IHg9IjgiIHk9IjExIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4hPC90ZXh0Pgo8L3N2Zz4K';
        }
        favicon.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRjE2QzM5Ii8+Cjx0ZXh0IHg9IjgiIHk9IjExIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4hPC90ZXh0Pgo8L3N2Zz4K';
        };
        
        if (viewType === 'grid') {
            div.appendChild(favicon);
            
            const tooltip = document.createElement('div');
            tooltip.className = 'bookmark-tooltip';
            
            const tooltipTitle = document.createElement('div');
            tooltipTitle.className = 'tooltip-title';
            tooltipTitle.textContent = bookmark.title;
            
            const tooltipUrl = document.createElement('div');
            tooltipUrl.className = 'tooltip-url';
            tooltipUrl.textContent = bookmark.url;
            
            tooltip.appendChild(tooltipTitle);
            tooltip.appendChild(tooltipUrl);
            div.appendChild(tooltip);
            
        } else {
            const content = document.createElement('div');
            content.className = 'bookmark-content';
            
            const title = document.createElement('div');
            title.className = 'bookmark-title';
            title.textContent = bookmark.title;
            
            const url = document.createElement('div');
            url.className = 'bookmark-url';
            url.textContent = bookmark.url;
            
            content.appendChild(title);
            content.appendChild(url);
            
            // Action buttons
            const actions = document.createElement('div');
            actions.className = 'bookmark-actions';
            actions.innerHTML = `
                <button class="action-btn edit-btn" title="Edit">✏️</button>
                <button class="action-btn delete-btn" title="Delete">🗑️</button>
            `;
            
            actions.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(bookmark);
            });
            
            actions.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBookmark(bookmark.id);
            });
            
            div.appendChild(favicon);
            div.appendChild(content);
            div.appendChild(actions);
            
            if (showPath && bookmark.path) {
                const path = document.createElement('div');
                path.style.fontSize = '10px';
                path.style.color = '#888';
                path.style.marginTop = '2px';
                path.textContent = bookmark.path;
                content.appendChild(path);
            }
        }
        
        // Click to open bookmark
        div.addEventListener('click', function(e) {
            if (!e.target.classList.contains('bookmark-url') && 
                !e.target.classList.contains('bookmark-tooltip') &&
                !e.target.classList.contains('action-btn')) {
                openBookmark(bookmark.url);
            }
        });

        // Context menu
        div.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, bookmark);
        });

        // Drag events
        setupDragEvents(div, 'bookmark', bookmark);

        if (viewType === 'tree') {
            div.addEventListener('mouseenter', function() {
                const url = this.querySelector('.bookmark-url');
                if (url) url.style.display = 'block';
            });
            div.addEventListener('mouseleave', function() {
                const url = this.querySelector('.bookmark-url');
                if (url) url.style.display = 'none';
            });
        }
        
        return div;
    }

    // Open Bookmark Function
    function openBookmark(url) {
        if (openInNewTab) {
            chrome.tabs.create({ url: url });
        } else {
            chrome.tabs.update({ url: url });
        }
    }

    // Drag & Drop Implementation
    function setupDragEvents(element, type, data) {
        element.addEventListener('dragstart', function(e) {
            dragSource = { type, data };
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', data.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        element.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            document.querySelectorAll('.drop-zone, .drop-zone-before').forEach(el => {
                el.classList.remove('drop-zone', 'drop-zone-before');
            });
        });

        element.addEventListener('dragover', function(e) {
            if (dragSource && dragSource.data.id !== data.id) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                this.classList.remove('drop-zone-before');
                if (e.clientY < midpoint) {
                    this.classList.add('drop-zone-before');
                } else {
                    this.classList.add('drop-zone');
                }
            }
        });

        element.addEventListener('dragleave', function() {
            this.classList.remove('drop-zone', 'drop-zone-before');
        });

        element.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drop-zone', 'drop-zone-before');
            
            if (!dragSource) return;
            
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const position = e.clientY < midpoint ? 'before' : 'after';
            
            if (dragSource.type === 'bookmark' && type === 'folder') {
                // Move bookmark to folder
                chrome.bookmarks.move(dragSource.data.id, {
                    parentId: data.id
                }, function() {
                    loadBookmarks();
                });
            } else if (dragSource.type === 'bookmark' && type === 'bookmark') {
                // Reorder bookmarks
                chrome.bookmarks.move(dragSource.data.id, {
                    parentId: data.parentId,
                    index: position === 'before' ? getBookmarkIndex(data.id) : getBookmarkIndex(data.id) + 1
                }, function() {
                    loadBookmarks();
                });
            }
        });
    }

    function getBookmarkIndex(bookmarkId) {
        // This would need to be implemented to find the current index of a bookmark
        return 0;
    }

    // Context Menu
    function showContextMenu(e, bookmark) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        
        // Remove previous event listeners
        const items = contextMenu.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            item.replaceWith(item.cloneNode(true));
        });

        // Add new event listeners
        contextMenu.querySelector('[data-action="edit"]').addEventListener('click', () => {
            openEditModal(bookmark);
            hideContextMenu();
        });

        contextMenu.querySelector('[data-action="delete"]').addEventListener('click', () => {
            deleteBookmark(bookmark.id);
            hideContextMenu();
        });
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    document.addEventListener('click', hideContextMenu);
    document.addEventListener('contextmenu', hideContextMenu);

    // Edit Modal
    function openEditModal(bookmark) {
        currentEditingBookmark = bookmark;
        modalTitle.textContent = 'Edit Bookmark';
        editTitle.value = bookmark.title;
        editUrl.value = bookmark.url;
        editModal.style.display = 'flex';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditingBookmark = null;
    }

    saveEdit.addEventListener('click', function() {
        if (currentEditingBookmark) {
            chrome.bookmarks.update(currentEditingBookmark.id, {
                title: editTitle.value,
                url: editUrl.value
            }, function() {
                closeEditModal();
                loadBookmarks();
            });
        }
    });

    cancelEdit.addEventListener('click', closeEditModal);

    // Delete Bookmark
    function deleteBookmark(bookmarkId) {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            chrome.bookmarks.remove(bookmarkId, function() {
                loadBookmarks();
            });
        }
    }

    // Search
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        if (searchTerm) {
            displaySearchResults(bookmarkData, searchTerm);
        } else {
            renderBookmarks();
        }
    });

    // Initialize
    initTheme();
    initTabPreference();
    initView();
    loadCollapsedState();
    loadBookmarks();
});