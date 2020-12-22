const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");
const { rootCertificates } = require("tls");

//Create connection to mySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Montanawolf94!',
    database: 'employee_DB'
});

//Overarching function to start all inquirer promps
const start = () => {
    console.log("Launching the app..")
    inquirer
        .prompt(
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                'View all employees', 
                'View all employees by department', 
                'View all employees by Manager',
                'Add employee',
                'Remove employee',
                'Update employee role',
                'Update employee manager']
            }
        )
}