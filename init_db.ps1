$ErrorActionPreference = "Stop"

$DB_NAME = "couture_db"
$USER = "postgres"
$SCRIPT_FILE = "setup_db.sql"
$ENV_FILE = "backend\.env"

# Read Password from .env
if (Test-Path $ENV_FILE) {
    Write-Host "Reading credentials from $ENV_FILE..."
    foreach ($line in Get-Content $ENV_FILE) {
        if ($line -match "^DB_PASSWORD=(.*)$") {
            $env:PGPASSWORD = $matches[1].Trim()
            Write-Host "Password loaded from .env"
        }
        if ($line -match "^DB_USER=(.*)$") {
             $USER = $matches[1].Trim()
        }
    }
} else {
    Write-Warning ".env file not found at $ENV_FILE. Assuming manual password entry or trusted auth."
}

Write-Host "Checking if database '$DB_NAME' exists..."

# Check if database exists
$exists = psql -U $USER -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'"
if ($exists -eq "1") {
    Write-Host "Database '$DB_NAME' already exists."
} else {
    Write-Host "Database '$DB_NAME' does not exist. Creating..."
    try {
        createdb -U $USER $DB_NAME
        Write-Host "Database '$DB_NAME' created successfully."
    } catch {
        Write-Error "Failed to create database. Ensure PostgreSQL is running and '$USER' has privileges."
        exit 1
    }
}

Write-Host "Applying schema from '$SCRIPT_FILE'..."
try {
    psql -U $USER -d $DB_NAME -f $SCRIPT_FILE
    Write-Host "Schema applied successfully."
} catch {
    Write-Error "Failed to apply schema."
    exit 1
}

Write-Host "Setup complete."
# Clear password from env for this session/script scope end (optional, powershell env vars are process scoped)
$env:PGPASSWORD = $null
