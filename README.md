# Employee-Tracker
This Node application is for a business owner to be able to view and manage departments, roles, and employees in their company in order to organize and plan their business.

The application gives you the following options:

* View all employees with the option by role, department, or manager
* Add an employee, role, or department
* Update an employee role or manager
* Delete employee, role, or department
* View department salary spending
 
## Installation
Run 'npm install' to install all dependencies
Run schema.sql in MySQLWorkbench
Edit MySQL connection properties in the connectionProperties object in employee-tracker.js

## Usage
Run node app.js to start the application
*INSERT IMAGE*
Select from the menu to view, add, remove, or update employees, roles, departments, or managers
*INSERT IMAGE*
Follow prompt if presented



## Tool & Resources
Node.js - JavaScript runtime environment
MySQLWorkbench - Visual database design tool
### Dependencies
inquirer - For the CLI user interface. This will prompt user within the CLI for employee information.
console.table - Used to print MySQL into tables to the console.
mysql - Used to connect to the MySQL database and perform queries
promise-mysql - Used to create promises from MySQL queries

## Assignment Challenges
Struggle 1: Queries
The most difficult part of this assignment was learning how to query and quering correctly. I understood the concept of the JOINs but was not certain on how to write the code for it.

Struggle 2: SQL Async Issue
I ran into issues with querying and returning a promise right after, I was unable how to figure out how to make the query a promise so I used the promise-mysql package.

## Badges

