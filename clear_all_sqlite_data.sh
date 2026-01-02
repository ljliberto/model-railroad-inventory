#!/usr/bin/env bash
# clear_sqlite_data.sh
#
# Recursively finds all user tables in a SQLite database and deletes ALL rows
# from each table (schema is kept).  It will also clear sqlite_sequence (to
# reset AUTOINCREMENT counters) if present and run VACUUM afterwards.
#
# Usage:
#   ./clear_sqlite_data.sh /path/to/db.sqlite       # prompts for confirmation
#   ./clear_sqlite_data.sh -y /path/to/db.sqlite    # non-interactive (yes)
#
# WARNING: This is destructive. Make a backup before running:
#   cp /path/to/db.sqlite /path/to/db.sqlite.bak
#

set -euo pipefail

show_usage() {
  cat <<USAGE
Usage: $0 [-y] /path/to/database.sqlite
  -y    assume "yes" (no interactive confirmation)
USAGE
}

# parse args
auto_yes=0
if [ "${#@}" -eq 0 ]; then
  show_usage
  exit 2
fi

# simple arg parsing
if [ "$1" = "-y" ]; then
  auto_yes=1
  shift
fi

DB="${1:-}"

if [ -z "$DB" ]; then
  show_usage
  exit 2
fi

if [ ! -f "$DB" ]; then
  echo "Error: database file not found: $DB" >&2
  exit 1
fi

# get list of user tables (exclude sqlite_ internal tables)
tables=$(sqlite3 "$DB" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")

if [ -z "$tables" ]; then
  echo "No user tables found in $DB"
  exit 0
fi

echo "Found the following tables in '$DB':"
echo "-----------------------------------"
echo "$tables"
echo "-----------------------------------"

if [ "$auto_yes" -ne 1 ]; then
  read -r -p "This will DELETE ALL ROWS from every table listed above. Are you sure? [y/N] " ans
  case "$ans" in
    [yY]|[yY][eE][sS]) ;;
    *) echo "Aborted."; exit 0 ;;
  esac
fi

# Build DELETE statements (one per table), with quoting for table names
delete_stmts=$(sqlite3 "$DB" "SELECT 'DELETE FROM \"' || name || '\";' FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")

if [ -z "$delete_stmts" ]; then
  echo "No DELETE statements generated. Nothing to do."
  exit 0
fi

# Check if sqlite_sequence exists (for AUTOINCREMENT)
has_seq=$(sqlite3 "$DB" "SELECT COUNT(*) FROM sqlite_master WHERE name='sqlite_sequence';")

# Compose SQL: disable foreign keys, begin transaction, deletes, clear sequence, commit, re-enable FK
# Use a here-doc to avoid unbound variable issues and preserve newlines
sql=$(cat <<SQL
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
$delete_stmts
SQL
)

if [ "$has_seq" -ne 0 ]; then
  sql="$sql
DELETE FROM sqlite_sequence;"
fi

sql="$sql
COMMIT;
PRAGMA foreign_keys=ON;
"

# Execute the SQL
echo "Running DELETE statements..."
sqlite3 "$DB" "$sql"

# Run VACUUM to reclaim space (runs outside of transaction)
echo "Running VACUUM..."
sqlite3 "$DB" "VACUUM;"

echo "Done. All tables emptied (schema preserved)."

