require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(` Endpoints disponibles:`);
    console.log(`   - GET  http://localhost:${PORT}/api/game/draw`);
    console.log(`   - POST http://localhost:${PORT}/api/game/simulate`);
});