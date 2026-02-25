# Model Railroad Inventory (React + TypeGraphQL + SQLite)

Full-stack app to manage model railroad inventory.

- **Frontend:** React + TypeScript + Vite + Apollo Client
- **Backend:** Node.js + TypeScript + TypeGraphQL + Apollo Server + TypeORM + SQLite (embedded DB)
- **Package manager:** Yarn workspaces

## Scripts (root)

- `yarn dev` – run server + client in normal dev mode
- `yarn debug` – run server in Node debug mode + client dev
- `yarn build` – build server + client
- `yarn test` – run client tests

### Debug details

`yarn debug` does:

- `yarn workspace server debug` – starts the server with `--inspect=9229`
- `yarn workspace client dev` – starts the Vite dev server

Use the provided VS Code launch configs in `.vscode/launch.json` to attach a debugger.

## Setup

```bash
yarn install
yarn dev        # or yarn debug
```

- GraphQL: http://localhost:4000/graphql
- UI: http://localhost:5173

## Features

- Add, edit, and delete inventory items with images
- Multi-level sorting (primary, secondary, tertiary)
- Excel import/export functionality
- **Google Drive integration** - Export directly to Google Drive
- Manage categories, manufacturers, scales, sources, and storage locations
- Custom background images

### Google Drive Export

The app supports exporting your inventory directly to Google Drive. To enable this feature:

1. Follow the setup instructions in [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md)
2. Create a `.env` file in the `client` directory with your Google API credentials
3. Restart the development server

Once configured, when you click "Export to Excel", you'll be able to choose between:
- **Export to this Device** - Downloads the file to your computer
- **Export to Google Drive** - Sign in and select a folder in your Google Drive to save the file
