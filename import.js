const fs = require("fs");

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "json_import"
});

connection.connect();
let TABLE_NAME = "table1";
let FILENAME = "file1.json";

process.argv.forEach(element => {
  let line = element.split("=");
  if (line[0] && line[0].trim() == "--table") {
    TABLE_NAME = line[1] ? line[1].trim() : "invalid";
  }
  if (line[0] && line[0].trim() == "--filename") {
    FILENAME = line[1] ? line[1].trim() : "invalid";
  }
});

connection.query(`DROP TABLE IF EXISTS ${TABLE_NAME};`);
fs.readFile(`./source/${FILENAME}`, "utf8", function(err, data) {
  if (err) throw err;

  const records = JSON.parse(data);
  const columns = Object.keys(records[0]);
  const schema = columns.join("` TEXT, `");

  connection.query(
    "CREATE TABLE IF NOT EXISTS " + TABLE_NAME + "(`" + schema + "` CHAR);"
  );

  const col_insert = "`" + columns.join("`, `") + "`";
  let data_length = records.length;
  records.forEach(record => {
    const values = Object.values(record);
    const val_insert = "'" + values.join("', '") + "'";
    const query = `INSERT INTO ${TABLE_NAME} (${col_insert}) VALUES (${val_insert})`;
    connection.query(query, () => {
      data_length = data_length - 1;
      console.log(`Importing... (${data_length}) Record(s)`);
      console.clear();
      if (!data_length) {
        console.log(`Done importing (${records.length}) Records`);
        process.exit();
      }
    });
  });
});