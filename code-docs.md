1. Here is the stack of technologies we use:
"dependencies": {
    "framer-motion": "^12.40.0",
    "lucide-react": "^1.17.0",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "sqlite": "^5.1.1",
    "sqlite3": "^6.0.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }

2. do not leave comments. you are allowed to keave comments only for the next explanation: associations and connections (with cardinality), validation, how optional attributes in classes are checked and what constraints they have 
(for example - we have a use class, our user is either a barber or a customer and customer/barber can only invoke customer/barber methods accordingly). take into account the fact that we have composition connections, abstract clases, qualifier association etc. it is a uml thing. follow OOP principles.
3. all mock data and comments and errors must be written in English and should only cover requirements. data should be logical and give reasoning basis for complete picture
4. local sqlite database which executes script for retrieving data on startup. further work is done using classes and methods on frontend. 
5. follow domain driven design. we will have repository (for communication with db), infrastructure (for connection to database and initialising clients)
6. 
