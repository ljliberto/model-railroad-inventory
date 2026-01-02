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
