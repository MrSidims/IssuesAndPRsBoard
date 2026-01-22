const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Load configuration
const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('Error loading config:', error);
        return { tabs: [] };
    }
}

let config = loadConfig();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';

// Helper function to fetch from GitHub API
async function fetchGitHub(url) {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'LLVM-Issues-Viewer'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Build search query from tab configuration
function buildSearchQuery(tab) {
    const typeFilter = tab.type === 'prs' ? 'is:pr' : 'is:issue';
    let query = `repo:${tab.repo} ${typeFilter} is:open`;

    // Add keywords (include filter)
    if (tab.keywords && tab.keywords.length > 0) {
        const keywordQuery = tab.keywords.map(k => k).join(' OR ');
        query += ` (${keywordQuery})`;
    }

    return query;
}

// Filter results based on blacklist (case-insensitive)
function filterBlacklist(items, blacklist) {
    if (!blacklist || blacklist.length === 0) {
        return items;
    }

    const blacklistLower = blacklist.map(term => term.toLowerCase());

    return items.filter(item => {
        // Check title
        const titleLower = (item.title || '').toLowerCase();
        for (const term of blacklistLower) {
            if (titleLower.includes(term)) {
                return false;
            }
        }

        // Check labels
        if (item.labels && item.labels.length > 0) {
            for (const label of item.labels) {
                const labelNameLower = (label.name || '').toLowerCase();
                for (const term of blacklistLower) {
                    if (labelNameLower.includes(term)) {
                        return false;
                    }
                }
            }
        }

        return true;
    });
}

// API endpoint to get configuration
app.get('/api/config', (req, res) => {
    // Reload config on each request to pick up changes
    config = loadConfig();
    res.json(config);
});

// Dynamic API endpoint for fetching issues/PRs based on tab ID
app.get('/api/tab/:tabId', async (req, res) => {
    try {
        const tabId = req.params.tabId;
        const page = parseInt(req.query.page) || 1;

        // Find the tab configuration
        const tab = config.tabs.find(t => t.id === tabId);
        if (!tab) {
            return res.status(404).json({ error: `Tab '${tabId}' not found in configuration` });
        }

        const query = encodeURIComponent(buildSearchQuery(tab));
        const url = `${GITHUB_API}/search/issues?q=${query}&per_page=100&page=${page}&sort=updated&order=desc`;

        const data = await fetchGitHub(url);

        // Apply blacklist filter (use tab-specific if defined, otherwise global)
        const blacklist = tab.blacklist !== undefined ? tab.blacklist : (config.blacklist || []);
        if (blacklist.length > 0) {
            const originalCount = data.items.length;
            data.items = filterBlacklist(data.items, blacklist);
            data.filtered_count = originalCount - data.items.length;
        }

        data.page = page;
        data.total_pages = Math.ceil(data.total_count / 100);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching data for tab ${req.params.tabId}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Configuration loaded from: ${CONFIG_PATH}`);
    console.log(`Tabs configured: ${config.tabs.map(t => t.label).join(', ')}`);
    if (config.blacklist && config.blacklist.length > 0) {
        console.log(`Global blacklist: ${config.blacklist.join(', ')}`);
    }
    console.log('Press Ctrl+C to stop');
});
