const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");

//Create connection to mySQL database
const connectionInformation = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Montanawolf94!',
    database: 'employee_DB'
};
 const connection = mysql.createConnection(connectionInformation);

//Overarching function to start all inquirer promps
const start = () => {
    console.log("Launching the app..")
    let firstQuestion = {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                'View all employees', 
                'View all employees by department', 
                'View all employees by manager',
                'Add employee',
                'Remove employee',
                'Update employee role',
                'Update employee manager',
                'View all roles',
                'EXIT'
    ]
    };

    //Asking the user what action they'd like to complete
    let firstResponse = (answer) => {
        switch (answer.action) {
            case 'View all employees':
                //function action to set of new questions;
                break;
            case 'View all employees by department':
                //function action to set of new questions;
                break;
            case 'View all employees by manager':
                //function action to set of new questions;
                break; 
            case 'Add employee':
                addEmployees();
                break; 
            case 'Remove employee':
                deleteEmployee();
                break; 
            case 'Update employee role':
                //function action to set of new questions;
                break; 
            case 'Update employee manager':
                //function action to set of new questions;
                break; 
            case 'View all roles':
                //function action to set of new questions;
                break;     
            case 'EXIT':
                connection.end();
                process.exit(0);
            default:
                connection.end();
                process.exit(0);
        }
    };
    inquirer.prompt(firstQuestion).then(firstResponse);
}



const addEmployees = () => {
    console.log("Creating new employee..");
    //Ask for employee first name
    let a1 = {
        type: 'input',
        name:'firstName',
        message: 'What is the employees first name?'
    };
    //Ask for employee last name
    let a2 = {
        type: 'input',
        name: 'lastName',
        message: 'What is the employees last name?'
    };
    //Ask for employee role
    let a3 = {
        type: 'list',
        name: 'role',
        message: 'What is the employees role?',
        choices: ['Sales','Finance','Marketing','Engineering']
    };
    //Ask for employee manager
    let a4 = {
        type: 'list',
        name: 'manager',
        message: 'Who do they report to?',
        choices: ['Jen','Rachel','Tania']
    };

let addEmployeeResponseProcessing = (answer) => {
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                //Adding one to ech of the below so that they don't enter the table as zero, since the id's for these start at 1
                role_id: q3.choices.indexOf(answer.role) + 1,
                manager_id: q4.choices.indexOf(answer.manager) + 1,
            },
            (err) => {
                if (err) throw err;
                console.log("Employee entered successfuly!");
                start();
            }
        );
    };
    inquirer.prompt([a1,a2,a3,a4]).then(addEmployeeResponseProcessing);
}



const deleteEmployee = () => {
    console.log("Deleting the employee..");
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                choices() {
                    const employeeArr = [];
                    results.forEach(({first_name}) => {
                        employeeArr.push(first_name);
                    });
                    return employeeArr;
                },
                message: 'Which employee would you like to remove?',
            },
        ])
        .then((answer) => {
            //store the chosen employee name
            let chosenEmployee;
            //if employee exists in DB, store
            results.forEach((name) => {
                if(name.first_name === answer.employee) {
                    chosenEmployee = name.id;
                    console.log(chosenEmployee);
                }
            })
            connection.query(
                'DELETE FROM employee WHERE id = ?', chosenEmployee, (err, data) => {
                    if (err) throw err;
                    console.log(data.affectedRows + " record updated");
                    }
            )
        })
    });
}








// Instantiate the connection
let connectionCallBack = (err) => {
    if (err) throw err;
    start();
};
connection.connect(connectionCallBack);