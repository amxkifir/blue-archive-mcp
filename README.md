# Blue Archive MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to Blue Archive game data, including student information, equipment, stages, items, and more.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Blue Archive MCP Server integrates with the SchaleDB API to provide AI assistants with real-time access to Blue Archive game data. This server implements the Model Context Protocol, enabling seamless integration with MCP-compatible clients like Claude Desktop.

### Key Capabilities

- **Student Database**: Access detailed information about all Blue Archive students
- **Equipment & Items**: Browse weapons, equipment, and consumable items
- **Stage Information**: Get details about campaign stages and raids
- **Multimedia Content**: Retrieve student avatars and voice clips
- **Advanced Search**: Filter and search across all data types
- **Multi-language Support**: Available in Chinese, Japanese, and English

## Features

- ✅ **8 Comprehensive Tools** for accessing game data
- 🌐 **Multi-language Support** (CN/JP/EN)
- 🔍 **Advanced Filtering** and search capabilities
- 🖼️ **Rich Media Integration** (avatars, voice clips)
- ⚡ **Performance Optimized** with caching
- 🛡️ **Error Handling** and retry mechanisms
- 📱 **Responsive Data Formatting** (text/markdown)

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- MCP-compatible client (e.g., Claude Desktop)

### Method 1: NPM Installation (Recommended)

Install directly from NPM:

```bash
npm install -g blue-archive-mcp
```

Or install locally in your project:

```bash
npm install blue-archive-mcp
```

### Method 2: From Source

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blue_archive_mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test the server**
   ```bash
   npm start
   ```

## Configuration

### Claude Desktop Integration

Add the following configuration to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

#### For NPM Installation:

```json
{
  "mcpServers": {
    "blue-archive": {
      "command": "npx",
      "args": ["blue-archive-mcp"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### For Source Installation:

```json
{
  "mcpServers": {
    "blue-archive": {
      "command": "node",
      "args": ["path/to/blue_archive_mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `CACHE_TIMEOUT` | Cache timeout (ms) | `300000` |

## Available Tools

### 1. get_students
Retrieve student information with filtering options.

**Parameters:**
- `language` (string, optional): Language preference (cn/jp/en) - Default: "cn"
- `search` (string, optional): Search by student name
- `limit` (number, optional): Maximum results - Default: 20
- `detailed` (boolean, optional): Include detailed stats - Default: false
- `school` (string, optional): Filter by school
- `starGrade` (number, optional): Filter by star grade (1-3)
- `role` (string, optional): Filter by tactical role

### 2. get_student_info
Get detailed information for a specific student.

**Parameters:**
- `studentId` (number, required): Student's unique ID
- `language` (string, optional): Language preference - Default: "cn"

### 3. get_student_by_name
Find student by name (supports multiple languages).

**Parameters:**
- `name` (string, required): Student name in any supported language
- `language` (string, optional): Response language - Default: "cn"
- `detailed` (boolean, optional): Include detailed information - Default: false

### 4. get_raids
Retrieve raid information and boss data.

**Parameters:**
- `language` (string, optional): Language preference - Default: "cn"
- `search` (string, optional): Search by raid name
- `detailed` (boolean, optional): Include detailed stats - Default: false

### 5. get_equipment
Browse equipment and weapon data.

**Parameters:**
- `language` (string, optional): Language preference - Default: "cn"
- `category` (string, optional): Equipment category filter
- `tier` (number, optional): Equipment tier (1-7)
- `limit` (number, optional): Maximum results - Default: 20
- `detailed` (boolean, optional): Include detailed stats - Default: false

### 6. get_stages
Access campaign and stage information.

**Parameters:**
- `language` (string, optional): Language preference - Default: "cn"
- `search` (string, optional): Search by stage name
- `area` (string, optional): Filter by area
- `chapter` (string, optional): Filter by chapter
- `difficulty` (string, optional): Filter by difficulty
- `limit` (number, optional): Maximum results - Default: 20
- `detailed` (boolean, optional): Include detailed information - Default: false

### 7. get_items
Retrieve consumable items and materials.

**Parameters:**
- `language` (string, optional): Language preference - Default: "cn"
- `search` (string, optional): Search by item name
- `category` (string, optional): Item category filter
- `rarity` (number, optional): Item rarity (1-5)
- `tags` (string, optional): Filter by tags
- `limit` (number, optional): Maximum results - Default: 20
- `detailed` (boolean, optional): Include detailed information - Default: false

### 8. get_student_avatar
Get student avatar images in various formats.

**Parameters:**
- `studentId` (number, optional): Student's unique ID
- `name` (string, optional): Student name (alternative to ID)
- `language` (string, optional): Language preference - Default: "cn"
- `avatarType` (string, optional): Avatar type (portrait/collection/icon/lobby) - Default: "portrait"
- `format` (string, optional): Output format (markdown/md) - Default: "markdown"

## Usage Examples

### Basic Student Search
```
Find all students from Gehenna Academy
```

### Detailed Student Information
```
Get detailed information about Shiroko including stats and skills
```

### Equipment Browsing
```
Show me all tier 6 weapons with detailed stats
```

### Stage Information
```
Find all hard difficulty stages in chapter 3
```

### Avatar Display
```
Show me Hina's collection avatar in markdown format
```

## Development

### Project Structure
```
blue_archive_mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript output
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building from Source
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm start
```

### Code Architecture

The server is built with:
- **TypeScript** for type safety and modern JavaScript features
- **@modelcontextprotocol/sdk** for MCP protocol implementation
- **Zod** for runtime type validation and schema generation
- **SchaleDB API** as the primary data source

### Key Components

- **BlueArchiveMCPServer**: Main server class handling MCP protocol
- **SchaleDBClient**: API client for data fetching
- **ErrorHandler**: Centralized error handling and logging
- **ParameterHandler**: Input validation and normalization
- **Logger**: Structured logging system

## Troubleshooting

### Common Issues

#### Connection Problems
- **Symptom**: Server fails to start or connect
- **Solution**: Check Node.js version (18+ required) and verify configuration paths

#### Data Loading Failures
- **Symptom**: API requests return empty results
- **Solution**: Verify internet connection and SchaleDB API availability

#### Tools Not Appearing
- **Symptom**: Tools don't show up in Claude Desktop
- **Solution**: Restart Claude Desktop after configuration changes

### Debug Mode
Enable debug logging by setting the environment variable:
```bash
LOG_LEVEL=debug npm start
```

### Performance Optimization
- Data is cached for 5 minutes by default
- Use `detailed=false` for faster responses when full data isn't needed
- Limit result sets with the `limit` parameter

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add appropriate error handling
- Include JSDoc comments for new functions
- Test changes thoroughly before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Data Source

This server uses data from [SchaleDB](https://schaledb.com/), an open-source Blue Archive database. All game assets and data are property of their respective owners.

---

**Note**: This is an unofficial tool created by fans for the Blue Archive community. It is not affiliated with or endorsed by the game's official developers.
