# COSC540-Flashcard Builder

## Requirements
- Install Node.js: https://nodejs.org/en/download

## How to download and run
- Switch to the `development` branch  
- Clone the development branch  
- Open the project in your editor  
- Change into the project directory:  
  ```bash
  cd COSC540-Flashcard-Builder
  ```  
- Install dependencies (this may take a few minutes):  
  ```bash
  npm install
  ```  
- Start the development server:  
  ```bash
  npm run dev
  ```  
- Open your browser to:  
  ```text
  http://localhost:3000
  ```

## File Structure
- **`app/`** – contains the main (home) page and global layout  
- **`components/`** – reusable UI pieces used throughout the app  
- **`pages/`** – top‑level routes; file names map to URLs (e.g. `dash.jsx` → `/dash`)  
- **`public/images/`** – static logos and images  
- **`styles/`** – CSS files; `globals.css` lives under `app/` for base styles  
- **`utils/`** – miscellaneous helpers (JSON files, React context, etc.)  
- **`.env.local`** – environment variables (not checked into Git; holds secret keys)

## Package.json
- Lists project dependencies (e.g. Axios for HTTP, bcrypt for hashing)  
- Be cautious when updating: major version bumps can break the app

## Backend Setup
1. **Create a `.env.local` file** in the project root with these variables:
   ```bash
   NEXTAUTH_URL=http://localhost:3000/
   NEXTAUTH_SECRET=your-random-secret
   MONGODB_URI=mongodb://localhost:27017/flash
   JWT_SECRET=your_super_secret_key
   ```
2. **On macOS**, if you haven’t installed MongoDB before:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@6.0
   brew services start mongodb-community@6.0
   ```

## Unit Tests
* Tests are written using Jest and React Testing Library.
* To install all dependencies (including devDependencies):  
  ```bash
  npm install
  ```
* To run both unit and integration tests together:  
  ```bash
  npm test
  ```
* To run tests in watch mode (re‑runs on file changes):  
  ```bash
  npm run test:watch
  ```
* To run tests with a coverage report:  
  ```bash
  npm run test:ci
  ```
### How the unit tests work
1. **Location**  
   Unit tests live in the `__tests__/` directory, mirroring your `components/` and `lib/` folders.
2. **Isolation via mocking**  
   External dependencies (e.g. HTTP calls, Next.js router) are mocked with `jest.mock()`, so tests focus on a single function or component.
3. **Pure function tests**  
   Utility modules like `lib/hash.js` are invoked directly and their return values asserted.
4. **Component tests under jsdom**  
   React components are rendered in a simulated browser (`jsdom`) using `@testing-library/react`, and user interactions are simulated via `@testing-library/user-event`.
6. **Fast feedback**  
   Because no real I/O or external servers are involved, unit tests run in milliseconds and can be run in watch mode for rapid development.

## Integration Tests
* Integration tests live in the `integration-tests/` directory.
* They spin up an in‑memory MongoDB, mount your real API route handlers via a mini Express server, and drive your React components end‑to‑end.
* To run only integration tests:  
  ```bash
  npm run test:int
  ```
* To run both unit and integration tests together:  
  ```bash
  npm test
  ```
### How the integration tests work
1. **In‑memory MongoDB**  
   Uses `mongodb-memory-server` to launch a throw‑away database in RAM, so your code connects to a real Mongo instance without external setup.

2. **Express wrapper for API routes**  
   A tiny server in `integration-tests/testServer.js` mounts your Next.js `/api/decks` handler under Express. This runs the exact same code that the deployed API uses.

3. **Auth & routing mocks**  
   - The real `verifyToken()` is stubbed so every request appears authenticated.  
   - `next/navigation`’s `useRouter()` is mocked to prevent errors from `router.push()` calls.

4. **Axios override with Supertest**  
   Instead of going through jsdom’s XHR (which has CORS restrictions), `axios.post` is replaced to call `supertest(server).post(...)`. This still exercises your real handler and database logic.

5. **React Testing Library drives the form**  
   The test renders `<AddDeckForm />`, types into the “Deck Name” input, clicks “Create Deck,” then asserts on UI updates (success message) and database state via `request.get('/api/decks')`.

6. **Assertions on both UI and data**  
   - Verifies the success message appears in the component.  
   - Confirms the new deck exists by querying the same in‑process API and inspecting the in‑memory database.

### Integration vs. Unit Tests
| Aspect            | Unit Tests                                            | Integration Tests                                                                                   |
|-------------------|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| **Scope**         | One function or component in isolation, with dependencies mocked. | Multiple layers (component → network → API → database) working together as in production.           |
| **Speed**         | Very fast, no I/O.                                    | Slower, but still quick (in‑memory DB + mini‑server).                                               |
| **Isolation**     | Mocks all external calls.                             | Mocks only auth and router; everything else runs un‑mocked against real code.                       |
| **Purpose**       | Verify individual logic and edge cases.               | Verify end‑to-end workflows and catch integration bugs (e.g., schema mismatches, mis‑wiring).      |
| **Complexity**    | Simple setup.                                         | More setup (global hooks, teardown, wrapper server), but higher confidence in full‑path behavior.   |
