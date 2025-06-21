const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const backupDir = path.join(__dirname, "../backups");

// Ensure the backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Creates a compressed backup of a specific tenant's database.
 * @param {string} dbName - The name of the tenant's database to back up.
 * @returns {Promise<string>} A promise that resolves with the path to the backup file.
 */
const backupTenantDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    // Sanitize dbName to prevent command injection, allowing only alphanumeric and underscores.
    const safeDbName = dbName.replace(/[^a-zA-Z0-9_]/g, "");
    if (safeDbName !== dbName) {
      return reject(new Error("Invalid characters in database name."));
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const backupFile = path.join(backupDir, `${safeDbName}_${timestamp}.gz`);
    const mongoUri = `${process.env.MONGO_URI_BASE}/${safeDbName}`;

    // Construct the mongodump command
    const command = `mongodump --uri="${mongoUri}" --archive="${backupFile}" --gzip`;

    console.log(`Executing backup command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup Error: ${stderr}`);
        return reject(new Error(`Failed to back up database ${safeDbName}.`));
      }
      console.log(`Backup successful for ${safeDbName}. File: ${backupFile}`);
      resolve(backupFile);
    });
  });
};

/**
 * Restores a tenant's database from a specified backup file.
 * @param {string} dbName - The name of the tenant's database to restore to.
 * @param {string} backupFileName - The name of the backup file in the /backups directory.
 * @returns {Promise<string>} A promise that resolves with a success message.
 */
const restoreTenantDatabase = (dbName, backupFileName) => {
  return new Promise((resolve, reject) => {
    const safeDbName = dbName.replace(/[^a-zA-Z0-9_]/g, "");
    const backupFile = path.join(backupDir, backupFileName);

    if (!fs.existsSync(backupFile)) {
      return reject(new Error(`Backup file not found: ${backupFileName}`));
    }

    const mongoUri = `${process.env.MONGO_URI_BASE}/${safeDbName}`;

    // --drop flag ensures the existing collections are dropped before restoring.
    const command = `mongorestore --uri="${mongoUri}" --archive="${backupFile}" --gzip --drop`;

    console.log(`Executing restore command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Restore Error: ${stderr}`);
        return reject(new Error(`Failed to restore database ${safeDbName}.`));
      }
      console.log(
        `Restore successful for ${safeDbName} from ${backupFileName}.`
      );
      resolve(`Database ${safeDbName} restored successfully.`);
    });
  });
};

module.exports = { backupTenantDatabase, restoreTenantDatabase };
