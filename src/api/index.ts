import { setupServer } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

setupServer().then((app) => {
    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}`);
        console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
    });
}).catch(console.error);
