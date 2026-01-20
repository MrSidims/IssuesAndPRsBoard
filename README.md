# LLVM Issues Viewer

A web application for viewing open GitHub issues and pull requests from the LLVM project, filtered by AMDGPU, AMDGCN, and SPIR-V/SPIRV tags.

## Why?

- **AMDGPU/AMDGCN Issues**: View all open issues containing AMDGPU or AMDGCN in title or labels
- **SPIR-V/SPIRV Issues**: View all open issues containing SPIR-V or SPIRV in title or labels
- **Pull Requests**: View all open PRs containing any of the above keywords
- Dark theme GitHub-style interface
- Direct links to issues/PRs on GitHub
- Label display with original colors

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)

## Installation

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

Start the server:
```bash
npm start
```

The application will be available at: **http://localhost:3000**

To stop the server, press `Ctrl+C` in the terminal.

## API Rate Limits

This application uses the GitHub API without authentication, which has a rate limit of 60 requests per hour. If you encounter rate limit errors:

1. Wait a few minutes before refreshing
2. Or add a GitHub Personal Access Token (see below)

### Adding a GitHub Token (Optional)

To increase the rate limit to 5,000 requests per hour:

1. Create a token at https://github.com/settings/tokens
2. Set an environment variable before starting:
   ```bash
   GITHUB_TOKEN=your_token_here npm start
   ```

Then modify `server.js` to include the token in the Authorization header.

## Project Structure

```
llvm-issues-viewer/
├── server.js          # Express server with GitHub API endpoints
├── public/
│   └── index.html     # Frontend interface
├── package.json       # npm configuration
└── README.md          # This file
```

## License

MIT
