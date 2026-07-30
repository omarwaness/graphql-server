import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import db from './db';
import { typeDefs } from './schema'

const resolvers = {
    Query: {
        games() {
            return db.games
        },
        game(_: unknown, args: { id: string }) {
            return db.games.find((game) => game.id === args.id)
        },
        reviews() {
            return db.reviews
        },
        review(_: unknown, args: { id: string }) {
            return db.reviews.find((review) => review.id === args.id)
        },
        authors() {
            return db.authors
        },
        author(_: unknown, args: { id: string }) {
            return db.authors.find((author) => author.id === args.id)
        }
    },
    Game: {
        reviews(parent: { id: string }) {
            return db.reviews.filter((review) => review.game_id === parent.id)
        }
    },
    Author: {
        reviews(parent: { id: string }) {
            return db.reviews.filter((review) => review.author_id === parent.id)
        }
    },
    Review: {
        author(parent: { author_id: string }) {
            return db.authors.find((author) => author.id === parent.author_id)
        },
        game(parent: { game_id: string }) {
            return db.games.find((game) => game.id === parent.game_id)
        }
    },
    Mutation: {
        addGame(_: unknown, args: { game: { title: string; platform: string[] } }) {
            let game = {
                ...args.game,
                id: Math.floor(Math.random() * 10000).toString()
            }
            db.games.push(game)

            return game
        },
        deleteGame(_: unknown, args: { id: string }) {
            db.games = db.games.filter((game) => game.id !== args.id)

            return db.games
        },
        updateGame(_: unknown, args: { id: string; edits: { title?: string; platform?: string[] } }) {
            db.games = db.games.map((game) => {
                if (game.id === args.id) {
                    return { ...game, ...args.edits }
                }

                return game
            })

            return db.games.find((game) => game.id === args.id)
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

