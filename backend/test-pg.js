const { Pool } = require('/sblaichau/backend/node_modules/pg');
const pool = new Pool({ connectionString: "postgresql://thanhluan:thanhluan%40@127.0.0.1:5432/sblaichau" });
pool.query("SELECT 1").then(res => { console.log("SUCCESS:", res.rows); process.exit(0); }).catch(err => { console.error("ERROR:", err); process.exit(1); });
