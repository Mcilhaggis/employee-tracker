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
                viewEmployees();
                break;
            case 'View all employees by department':
                viewByDept();
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
                updateRole();                
                break; 
            case 'Update employee manager':
                updateManager();
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
    connection.query('SELECT * FROM role', (err, res) => {
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
        choices() {
                const roleArr = [];
                res.forEach(({title}) => {
                    roleArr.push(title);
                })
                return roleArr;
            }
    };
    
    //Ask for employee manager
    let a4 = {
        type: 'list',
        name: 'manager',
        message: 'Who do they report to?',
        //Needs to be updated with list of actual employees
        choices: ['Jen','Rachel','Tania']
    };

let addEmployeeResponseProcessing = (answer) => {
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: a3.choices.indexOf(answer.role),
                manager_id: a4.choices.indexOf(answer.manager) + 1,
            },
            (err) => {
                if (err) throw err;
                console.log("Employee entered successfuly!");
                start();
            }
        );
    };
    inquirer.prompt([a1,a2,a3,a4]).then(addEmployeeResponseProcessing);
    })
}

const viewEmployees = () => {
    console.log("Fetching employees...");

    let query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.dept_name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee LEFT JOIN employee m ON employee.manager_id = m.id INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC";
    
    //DOESNT SHOW ANY MANAGERS???
    connection.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        console.log('--------------------')
        start();
    })   
};

const viewByDept = () => {
    console.log("Fetching departments...");
    
    connection.query('SELECT dept_name FROM department', (err, results) => {
        if (err) throw err;
        let vbd1 = {
            type: 'list',
            name: 'department',
            choices() {
                const deptArr = [];
                results.forEach(({dept_name}) => {
                    deptArr.push(dept_name);
                })
                return deptArr;
            },
            message: 'Which department do you want to view?'
        }
        //Display employees in chosen department
        let displayDeptChosen = () => {
            let query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.dept_name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.dept_name = '${results.department}' ORDER BY ID ASC`;

            connection.query(query, (err, res) => {
                if (err) throw err;
                console.table(res);
                start();
            })
        }
        inquirer.prompt([vbd1]).then(displayDeptChosen);
    })   
};


const viewByManager = () => {

}

const viewDeptSpending = () => {

}


const updateRole = () => {
    console.log("Updating emplyee role...");
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
            let ur1 = {
                type: 'list',
                name: 'employee',
                choices() {
                    const employeeArr = [];
                    results.forEach(({first_name}) => {
                        employeeArr.push(first_name);
                    })
                    //you dont have any employees message if array is empty
                    return employeeArr;
                },
                message: 'Which employee would you like to update?',
            };
    // connection.query('SELECT * FROM department - add this for flexible roles taken from db 
            let ur2 = {
                type: 'list',	
                name: 'role',
                //Are these roles preset values?
                choices: ['Marketing','Sales','Finance','Engineering'],
                message: 'What is the employees new role?'
            }
            let updateEmployeeRoleProcessing = (answer) => {
                let chosenRoleEmployee;
                //store the new role title 
                let newRole = answer.role;
                //store new role title index
                let newRoleIndex = ur2.choices.indexOf(newRole) + 1;
                //if employee exists in DB, store
                results.forEach((name) => {
                    if(name.first_name === answer.employee) {
                        chosenRoleEmployee = name.id;
                        console.log("the employee id chosen is:" + chosenRoleEmployee);
                    }
                })
                connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            role_id: newRoleIndex,
                            },
                        {
                            id: chosenRoleEmployee,
                        },
                    ],
                    //If the employee role is the same make the user choose again
                     (err, data) => {
                        if (err) throw err;
                        console.log(data.affectedRows + " record updated");
                        start();
                        }
                )
            };
            inquirer.prompt([ur1,ur2]).then(updateEmployeeRoleProcessing);
        })            
    };


const updateManager = () => {
    console.log("Updating emplyee manager...");
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
            let um1 = {
                type: 'list',
                name: 'employee',
                choices() {
                    const employeeArr = [];
                    results.forEach(({first_name}) => {
                        employeeArr.push(first_name);
                    })
                    //add you dont have any employees message if array is empty
                    return employeeArr;
                },
                message: 'Which employee would you like to update?',
            };
            let um2 = {
                type: 'list',	
                name: 'manager',
                //Are these roles preset values?
                choices: ['Jen','Rachel','Tania'],
                message: 'Who is the employees new manager?'
            }
            let updateEmployeeManagerProcessing = (answer) => {
                let chosenManagerEmployee;
                //store the new role title 
                let newManager = answer.manager;
                //store new role title index
                let newManagerIndex = um2.choices.indexOf(newManager) + 1;
                //if employee exists in DB, store
                results.forEach((name) => {
                    if(name.first_name === answer.employee) {
                        chosenManagerEmployee = name.id;
                        console.log("the employee id chosen is:" + chosenManagerEmployee);
                    }
                })
                connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            manager_id: newManagerIndex,
                            },
                        {
                            id: chosenManagerEmployee,
                        },
                    ],
                    //If the employee role is the same make the user choose again
                    (err, data) => {
                        if (err) throw err;
                        console.log(data.affectedRows + " record updated");
                        start();
                        }
                )
            };
            inquirer.prompt([um1,um2]).then(updateEmployeeManagerProcessing);
        })            
    };


const deleteEmployee = () => {
    console.log("Firing employee..");
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
                    })

                    // if (employeeArr.length === 0){
                    //     console.log("You need employees before you can fire them");
                    //     start();
                    // } else {
                    return employeeArr;
                    // }
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