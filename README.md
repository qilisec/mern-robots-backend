# MERN Robots App 
### [Go to App](https://3.88.166.109:8000/)
### [Frontend Code Repository](https://github.com/qilisec/mern-robots-frontend)
## Overview
This application is a full stack implementation of CRUD functionality hosted remotely on Amazon Web Services.

* Communication between frontend and backend follows REST API guidelines.

* It uses React (Create React App) for the Client, Express.JS for a simple lightweight server and MongoDB for a non-relational Database. Client communication with server is managed using Axios.

* The primary data generated takes the facade of "robots" in which user information is stored (e.g. name, address, birthday, place of work, etc.)

* User authentication and JWT-based authorization are also implemented to allow for protected routing and client-side user-specific component rendering such as user specific profile pages and filtered robot submissions



## Further Details

### Security/Authentication:
Client-Side authentication state data is distributed using React Context.
Both client and server communication are secured with SSL (self-signed).
	
### Authorizaton:
* User login state and authorization is persisted via an Access Token - Refresh Token JWT strategy.

* Access tokens (Quick expiration) are stored in request headers whereas refresh tokens (Long expiration) are stored in HTTP-only cookies. 
	
* Axios request and response interceptors are used to send authorization tokens for initial verification authorization as well as reissuing access tokens upon expiration. 

### Routing:
* Routing is facilitated with React-Router-DOM client side and Express routers server-side

### Miscellaneous/Developement Dependencies:
* Nodemon is utilized on the server side.

* ESlint + Prettier setup: https://www.npmjs.com/package/eslint-config-wesbos (An extension of the popular AirBNB style guide)

* Client and Server/Database are separated onto two AWS EC2 instances.
