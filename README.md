# Beavgredients

### Team:
Alexander Sahlstrom

Levi Cook

Nico Sarmiento

Kenneth Robertson

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#running-the-application">Running The Application</a></li>
        <li><a href="#build-production">Build Production</a></li>
        <li><a href="#live-deployment">Live Deployment</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#testing">Testing</a></li>
    <li>
      <a href="#documentation">Documentation</a>
      <ul>
        <li><a href="#user-documentation">User Documentation</a></li>
        <li><a href="#developer-documentation">Developer Documentation</a></li>
      </ul>
    </li>
    <li>
      <a href="#development-process">Development Process</a>
      <ul>
        <li><a href="#version-control">Version Control</a></li>
        <li><a href="#issue-tracking">Issue Tracking</a></li>
        <li><a href="#continuous-integration">Continuous Integration</a></li>
        <li><a href="#build-system">Build System</a></li>
      </ul>
    </li>
  </ol>
</details>




## About The Project

Beavgredients is a web application that helps with recipe searching while on a budget. 

Beavgredients allows users to input ingredients they have at home into a pantry, then lists recipes you can make with the ingredients they already have on hand. It'll also show recipes that you're only missing 1 ingridient for. Users can then add recipes they're interested into a cart, which they can then email to themselves with a list of ingredients they are missing to shop for.



Open the website at [https://beavgredients.vercel.app/](https://beavgredients.vercel.app/)

### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Vercel][Vercel]][Vercel-url]
* [![TheMealDB][TheMealDB]][TheMealDB-url]

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- Node.js (v18 or later recommended)
- npm (comes with Node)

You can verify installation with:
```sh
node -v
```

```sh
npm -v
```
### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/robekenn/Beavgredients
   ```
2. Navigate into the web directory:
   ```sh
   cd Beavgredients/Web
   ```
3. Install frontend dependencies:
   ```sh
   npm install
   ```
4. Navigate into the API folder:
   ```sh
   cd api
   ```
5. Install backend dependancies:
   ```sh
   npm install
   ```

### Running The Application
With 2 terminals open:
1. Terminal 1: Start the Backend
   From inside /web/api:
   ```sh
   cd Beavgredients/Web/api
   node index.js
   ```
2. Terminal 2: Start the frontend
   From inside /web
      ```sh
   cd Beavgredients/Web
   npm run dev
   ```
3. Open your browser and go to:
   ```sh
   http://localhost:3000
   ```
The application should now be running locally.

### Build Production

To create a production build:
```sh
cd Beavgredients/Web
npm run build
```
To start the production server locally:
```sh
npm start
```
### Live Deployment

The application is deployed on Vercel at [https://beavgredients.vercel.app/](https://beavgredients.vercel.app/)

## Usage

### Operational Use Case: Load a recipe missing 1 ingridient & email ingridient list

1. Open the application (locally or via the live deployment).

2. In the pantry section on the left side of the screen, add the following ingredients:
  - egg
  - peanut_butter

3. After adding the ingredients, select "Filter" and select "Missing 1 Ingridient"

4. After filtering, select the first recipe shown:
   - Should be "Peanut Butter Cookies"
  
[![Example 1 Screen Shot][example-screenshot-1]](https://beavgredients.vercel.app/)

5. Click the green "+" button to add the recipe to your cart
   
6. Click "Start Cooking" on the bottom right of the screen
   
7. Fill the form with your email
   
8. A list with the recipes you selected and the ingredients you are missing and need to buy will be sent to the provided email


## Testing

GitHub Actions is configured to automatically run the test workflow on a push to main

- To run tests locally:
  ```bash
  npm test
  ```


## Documentation

### User Documentation
Instructions for end users can be found here: [User Documentation](/User_Documentation.md)

### Developer Documentation
Technical architecture, development workflow, and internal design details: [Developer Documentation](Developer_Documentation.md)

## Development Process

### Version Control
- Using GitHub repository for feature branches and pull requests

### Issue Tracking
- Trello board to track bugs, features and project tasks

### Continuous Integration
- GitHub Actions workflow (.github/workflows/ci.yml) automatically builds the project on push

### Build System
- Next.js build via npm scripts (`npm run dev`, `npm run build`)

<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Vercel]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Vercel-url]: https://vercel.com/
[TheMealDB]: https://img.shields.io/badge/TheMealDB-FF6F00?style=for-the-badge&logo=api&logoColor=white
[TheMealDB-url]: https://www.themealdb.com/

[example-screenshot-1]: Web/app/components/ui/example-screenshot-1.png
