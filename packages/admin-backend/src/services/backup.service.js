const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const cloudinary = require("cloudinary").v2
//const BackupRecord = require("../modules/admin/backups/backupRecord.schema")

const BackupRecord = require(path.join(__dirname, "..", "modules", "admin", "backups", "backupRecord.schema.js"))

const { MongoClient } = require("mongodb")
const axios = require("axios")
require("dotenv").config()

// Validate environment variables
const requiredEnvVars = ["CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET", "MONGO_URI_BASE"]
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) throw new Error(`Missing required environment variable: ${varName}`)
})

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
})

const tempDir = path.join(__dirname, "temp_ops")
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

class BackupService {
  /**
   * Creates a database backup
   * @param {string} dbName - Tenant database name
   * @param {string} tenantId - Tenant ObjectId
   * @param {string} triggeredBy - Backup trigger source
   */
  async backupTenantDatabase(dbName, tenantId, triggeredBy = "cron_job") {
    // Generate timestamp without colons/dots and remove .gz if present
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace(/\.gz$/, "")
    const archivePath = path.join(tempDir, `${dbName}-${timestamp}.gz`)
    const publicId = `${dbName}-${timestamp}` // No file extension in public ID

    try {
      // 1. Create database dump
      const dumpCommand = `mongodump --uri="${process.env.MONGO_URI_BASE}/${dbName}" --archive="${archivePath}" --gzip`
      await this.executeCommand(dumpCommand)

      // 2. Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(archivePath, {
        resource_type: "raw",
        public_id: publicId,
        folder: `database_backups/${dbName}`,
        type: "private",
        overwrite: false,
        use_filename: false,
        unique_filename: false,
      })

      // 3. Create backup record with required fields
      const fileSize = fs.statSync(archivePath).size
      await BackupRecord.create({
        tenant: tenantId,
        dbName,
        status: "success",
        fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        fileSize,
        triggeredBy,
      })

      return { success: true, size: fileSize, publicId: uploadResult.public_id }
    } catch (error) {
      await BackupRecord.create({
        tenant: tenantId,
        dbName,
        status: "failed",
        triggeredBy,
        errorMessage: error.message,
      })
      throw new Error(`Backup failed: ${error.message}`)
    } finally {
      this.safeDeleteFile(archivePath)
    }
  }

  /**
   * Restores a database from backup
   * @param {string} backupRecordId - Backup record ID
   * @param {string} adminUserId - Admin user ID
   */
  async restoreTenantDatabase(backupRecordId, adminUserId) {
    const backupRecord = await BackupRecord.findById(backupRecordId)
    if (!backupRecord) throw new Error("Backup record not found")

    const { dbName, cloudinaryPublicId, tenant: tenantId, fileUrl } = backupRecord
    const tempFile = path.join(tempDir, `restore-${Date.now()}.gz`)

    try {
      // 1. Generate secure download URL
      const downloadUrl = cloudinary.utils.private_download_url(
        cloudinaryPublicId,
        null, // Keep original extension
        {
          resource_type: "raw",
          attachment: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1hr expiration
        }
      )

      // 2. Download backup file
      await this.downloadFile(downloadUrl, tempFile)

      // 3. Drop existing database
      await this.dropDatabase(dbName)

      // 4. Restore database
      const restoreCommand = `mongorestore --uri="${process.env.MONGO_URI_BASE}/${dbName}" --archive="${tempFile}" --gzip --drop`
      await this.executeCommand(restoreCommand)

      // 5. Create restore record
      await BackupRecord.create({
        tenant: tenantId,
        dbName,
        status: "restore_success",
        fileUrl, // Required by schema
        cloudinaryPublicId, // Required by schema
        triggeredBy: "manual_admin",
        // adminUser: adminUserId,
      })

      return { success: true }
    } catch (error) {
      await BackupRecord.create({
        tenant: tenantId,
        dbName,
        status: "restore_failed",
        triggeredBy: "manual_admin",
        // adminUser: adminUserId,
        errorMessage: error.message,
      })
      throw new Error(`Restore failed: ${error.message}`)
    } finally {
      this.safeDeleteFile(tempFile)
    }
  }

  /**
   * Downloads a file from URL
   * @param {string} url - Download URL
   * @param {string} outputPath - Output file path
   */
  async downloadFile(url, outputPath) {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
      timeout: 300000, // 5 minutes
    })

    const writer = fs.createWriteStream(outputPath)
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
    })
  }

  /**
   * Executes shell commands safely
   * @param {string} command - Command to execute
   */
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Command failed: ${command}\n${stderr}`)
          reject(new Error(stderr || `Command execution failed`))
          return
        }

        if (stderr) console.warn(`Command stderr: ${stderr}`)
        resolve(stdout)
      })
    })
  }

  /**
   * Drops a database safely
   * @param {string} dbName - Database name
   */
  async dropDatabase(dbName) {
    const client = new MongoClient(process.env.MONGO_URI_BASE)
    await client.connect()

    try {
      const db = client.db(dbName)
      await db.dropDatabase()
      console.log(`Dropped database: ${dbName}`)
    } catch (error) {
      if (error.code !== 26) {
        // Ignore "NamespaceNotFound" error
        throw error
      }
    } finally {
      await client.close()
    }
  }

  /**
   * Safely deletes a file
   * @param {string} filePath - File path to delete
   */
  safeDeleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch (error) {
      console.error(`File deletion error: ${filePath}`, error)
    }
  }
}

module.exports = new BackupService()
