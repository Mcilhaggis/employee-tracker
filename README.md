# Employee-Tracker

![License](https://img.shields.io/github/license/mcilhaggis/employee-tracker)

![GitHub repo size](https://img.shields.io/github/repo-size/mcilhaggis/employee-tracker)

## Project Description

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
![Screenshot of the Photobooth.](/images/screenshot1.png "Screenshot of the Photobooth")
Select from the menu to view, add, remove, or update employees, roles, departments, or managers
Follow prompt if presented
![Screenshot of the Photobooth.](/images/screenshot2.png "Screenshot of the Photobooth")
![Screenshot of the Photobooth.](/images/screenshot3.png "Screenshot of the Photobooth")



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

## Licensing 
The licensing used for this project is MIT

## Contributions 
Author: Rachael McIlhagga
Twitter: @breadlikerach
    
## Questions
* If you have any questions about this project, please reach out to me  through <a href="https://github.com/mcilhaggis">Github</a>  or via <a href="mailto:rachael.mcilhagga@live.co.uk">Email</a>