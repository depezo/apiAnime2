import express from 'express';
import cors from 'cors';
import { schema } from './graphql';
import { AuthenticationError } from 'apollo-server-express';
import { getFembedPrimary } from './data/players/lat_players_data';

const functions = require('firebase-functions');
const { ApolloServer, gpl } = require('apollo-server-express');

async function startApolloServer() {
    const app = express();
    app.use(cors());
    const server = new ApolloServer({
        schema,
        introspection: true,
        context: ({ req }: any) => {
            const token = req.headers.authentication || '';
            if (token != '7665c216-2294-4b9b-815f-1b4a35ec761e') throw new AuthenticationError('you must be logged in');
            return token;
        },
    });
    await server.start();
    server.applyMiddleware({ app, path: '/' });
    app.listen(5000, () => {
        console.log("Server anime start in: http://localhost:5000");
    });
    //exports.graphql = functions.https.onRequest(app);
}

//getFembedPrimary('');
startApolloServer();