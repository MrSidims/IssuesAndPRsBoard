const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';
const REPO = 'llvm/llvm-project';

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

// API endpoint for AMDGPU/AMDGCN issues
app.get('/api/amd-issues', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // Search for issues with AMDGPU or AMDGCN in title or labels
        const query = encodeURIComponent(`repo:${REPO} is:issue is:open (AMDGPU OR AMDGCN)`);
        const url = `${GITHUB_API}/search/issues?q=${query}&per_page=100&page=${page}&sort=updated&order=desc`;

        const data = await fetchGitHub(url);
        data.page = page;
        data.total_pages = Math.ceil(data.total_count / 100);
        res.json(data);
    } catch (error) {
        console.error('Error fetching AMD issues:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint for SPIR-V/SPIRV issues
app.get('/api/spirv-issues', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // Search for issues with SPIR-V or SPIRV in title or labels
        const query = encodeURIComponent(`repo:${REPO} is:issue is:open (SPIR-V OR SPIRV)`);
        const url = `${GITHUB_API}/search/issues?q=${query}&per_page=100&page=${page}&sort=updated&order=desc`;

        const data = await fetchGitHub(url);
        data.page = page;
        data.total_pages = Math.ceil(data.total_count / 100);
        res.json(data);
    } catch (error) {
        console.error('Error fetching SPIRV issues:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint for AMDGPU/AMDGCN PRs
app.get('/api/amd-prs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // Search for PRs with AMDGPU or AMDGCN
        const query = encodeURIComponent(`repo:${REPO} is:pr is:open (AMDGPU OR AMDGCN)`);
        const url = `${GITHUB_API}/search/issues?q=${query}&per_page=100&page=${page}&sort=updated&order=desc`;

        const data = await fetchGitHub(url);
        data.page = page;
        data.total_pages = Math.ceil(data.total_count / 100);
        res.json(data);
    } catch (error) {
        console.error('Error fetching AMD PRs:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint for SPIR-V/SPIRV PRs
app.get('/api/spirv-prs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // Search for PRs with SPIR-V or SPIRV
        const query = encodeURIComponent(`repo:${REPO} is:pr is:open (SPIR-V OR SPIRV)`);
        const url = `${GITHUB_API}/search/issues?q=${query}&per_page=100&page=${page}&sort=updated&order=desc`;

        const data = await fetchGitHub(url);
        data.page = page;
        data.total_pages = Math.ceil(data.total_count / 100);
        res.json(data);
    } catch (error) {
        console.error('Error fetching SPIRV PRs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
