const AppDataSource = require("../data-source");
const app = require("./app");

const port = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server berjalan di http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Gagal terhubung ke database:", error);
    process.exit(1);
  });
