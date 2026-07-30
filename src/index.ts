import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import db from './db';
import { readFileSync } from 'node:fs';
import type { Resolvers } from './__generated__/resolvers-types';

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');

// Referenced by `contextType` in codegen.yml.
export type MyContext = {};

const resolvers: Resolvers = {
    Query: {
        games() {
            return db.games
        },
        game(_, args) {
            return db.games.find((game) => game.id === args.id) ?? null
        },
        reviews() {
            return db.reviews
        },
        review(_, args) {
            return db.reviews.find((review) => review.id === args.id) ?? null
        },
        authors() {
            return db.authors
        },
        author(_, args) {
            return db.authors.find((author) => author.id === args.id) ?? null
        }
    },
    Game: {
        reviews(parent) {
            return db.reviews.filter((review) => review.game_id === parent.id)
        }
    },
    Author: {
        reviews(parent) {
            return db.reviews.filter((review) => review.author_id === parent.id)
        }
    },
    Review: {
        // Non-null in the schema (Author! / Game!), and every row's foreign key
        // points at an existing record, so the lookup can't miss.
        author(parent) {
            return db.authors.find((author) => author.id === parent.author_id)!
        },
        game(parent) {
            return db.games.find((game) => game.id === parent.game_id)!
        }
    },
    Mutation: {
        addGame(_, args) {
            let game = {
                ...args.game,
                id: Math.floor(Math.random() * 10000).toString()
            }
            db.games.push(game)

            return game
        },
        deleteGame(_, args) {
            db.games = db.games.filter((game) => game.id !== args.id)

            return db.games
        },
        updateGame(_, args) {
            db.games = db.games.map((game) => {
                if (game.id === args.id) {
                    // Apply only the fields actually sent. Both edits are
                    // nullable, and spreading a null would violate the
                    // non-null title/platform on Game.
                    return {
                        ...game,
                        ...(args.edits.title != null && { title: args.edits.title }),
                        ...(args.edits.platform != null && { platform: args.edits.platform })
                    }
                }

                return game
            })

            return db.games.find((game) => game.id === args.id) ?? null
        }
    }
}

// setup server takes schema and resolver as parameters
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

