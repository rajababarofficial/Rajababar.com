import initSqlJs from 'sql.js';

let dbInstance: any = null;

export const getDatabase = async () => {
  if (dbInstance) return dbInstance;

  try {
    console.log("1. Starting WASM Initialization...");
    const SQL = await initSqlJs({
      locateFile: file => `/${file}`
    });
    console.log("2. WASM Initialized successfully!");

    console.log("3. Fetching books.db now...");
    const response = await fetch('/database/books.db');
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status} - Database file not found at /public/database/books.db`);
    }

    const buf = await response.arrayBuffer();
    console.log("4. books.db fetched! Size:", buf.byteLength);

    dbInstance = new SQL.Database(new Uint8Array(buf));
    console.log("5. SQLite Database Instance Created!");
    
    return dbInstance;
  } catch (error: any) {
    console.error("❌ Database Error:", error.message);
    throw error;
  }
};