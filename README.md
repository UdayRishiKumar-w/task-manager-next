# task-manager-next

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![GraphQL](https://img.shields.io/badge/GraphQL-Apollo-E10098?logo=graphql)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![License](https://img.shields.io/github/license/UdayRishiKumar-w/task-manager-next)

---

A full-stack productivity application built with Next.js (app router), TypeScript, GraphQL (Apollo Server), MongoDB (Mongoose), and NextAuth (credentials + GitHub), Apollo Client, shadcn UI, react-hook-form, and Zod. This project demonstrates modern web development practices, clean architecture, secure authentication, and fully typed end-to-end development.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- GraphQL + Apollo Server
- MongoDB + Mongoose
- Apollo Client
- DataLoader
- NextAuth
- Zod

## Features

- JWT authentication
- Task CRUD
- Pagination & filtering
- Optimized GraphQL resolvers
- End-to-end type safety

## Architecture

- GraphQL API inside Next.js route handlers
- MongoDB connection pooling
- Context-based authorization
- Typed frontend via GraphQL Codegen

## Run Locally

- Clone repository

```bash
git clone https://github.com/UdayRishiKumar-w/task-manager-next.git
cd task-manager-next
```

- Development server

```bash
npm install
npm run codegen
npm run dev
```

- Docker setup

```bash
docker compose up --build
```

## Environment variables

- MONGODB_URI = Mongo DB URI
- NEXTAUTH_URL = next auth URL
- NODE_ENV = node js environment
- AUTH_SECRET = Authentication secret
- GITHUB_SECRET = Github secret for provider
- GITHUB_ID = Github ID for provider
