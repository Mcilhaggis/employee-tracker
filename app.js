const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");
const promise = require("promise-mysql");

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
                'View employees by department', 
                'View employees by manager',
                'Add employee',
                'Add department',
                'Add role',
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
            case 'View employees by department':
                viewByDept();
                break;
            case 'View employees by manager':
                viewByManager();
                break; 
            case 'View department spendings':
                //function action to set of new questions;
                break; 
            case 'Add employee':
                addEmployees();
                break; 
            case 'Add department':
                addDepartments();
                break;     
            case 'Add role':
                addRoles();
                break;     
            case 'Remove employee':
                deleteEmployee();
                break; 
            case 'Update employee role':
                //is currently updating the dept not role
                updateRole();                
                break; 
            case 'Update employee manager':
                updateManager();
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
    console.log("Fetching departments...");
    //Global variables for choices arrays
    let rolesArr = [];
    let managersArr = [];
    let managerIDArr = [];
    console.log(rolesArr);
    console.log(managersArr);
    console.log(managerIDArr);

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the department names
        return Promise.all([
            conn.query('SELECT id, title FROM role'),
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee")
            ]);

    }).then(([roles, managers]) => {
        //Place role names into an array
        for (i = 0; i < roles.length; i++){
            rolesArr.push(roles[i].title)
        }
        //Place managers into an array
        for (i=0; i< managers.length; i++){
            managersArr.push(managers[i].Employee)
        }
        //Place manager ID into an array
        for (i = 0; i < managers.length; i++){
            managerIDArr.push(managers[i].id)
        }

        return Promise.all([roles, managers]);
        }).then(([roles, managers]) => {
            //if there are no managers:
            managersArr.unshift('--');
            console.log(rolesArr);
            console.log(managersArr);
            console.log(managerIDArr);

            inquirer.prompt([
                //Ask for employee first name
                {
                    type: 'input',
                    name:'firstName',
                    message: 'What is the employees first name?'
                },
                //Ask for employee last name
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is the employees last name?'
                },
                //Ask for employee role
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the employees role?',
                    choices: rolesArr
                },
                //Ask for employee manager
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who do they report to?',
                    choices: managersArr
                }

            ]).then((answer) => {

                let managerNameIndex = managersArr.indexOf(answer.manager) - 1;
                console.log("manager name index: " + managerNameIndex);

                let managerIDIndex = managerIDArr[managerNameIndex];
                console.log("manager id index: " + managerIDIndex);

                connection.query(

                    'INSERT INTO employee SET ?',
                    {
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: rolesArr.indexOf(answer.role) + 1,
                        manager_id: managerIDIndex 
                    },
                    (err) => {
                        if (err) throw err;
                        console.log("Employee entered successfuly!");
                        start();
                    }
                );
});
})

const addDepartments = () => {

        let ad1 = {
            type: 'input',
            name: 'department',
            message: 'What is the new department?'
        }

    let addDepartmentResponseProcessing = (answer) => {    
            connection.query(
                'INSERT INTO department SET ?',
                {
                    dept_name: answer.department,
                },
                (err) => {
                    if (err) throw err;
                    console.log("Department added successfuly!");
                    start();
                }
            );
        };
        inquirer.prompt([ad1]).then(addDepartmentResponseProcessing);
}

const addRoles = () => {
    const deptArr = [];
    connection.query('SELECT dept_name FROM department', (err,res) => {

    let ar1 = {
        type: 'input',
        name: 'roles',
        message: 'What is the new role?'
    }
    let ar2 = {
        type: 'list',
        name: 'dept',
        choices() {
                if (err) throw err;
                res.forEach(({dept_name}) => {
                    deptArr.push(dept_name);
                })
            return deptArr;
        },
        message: 'Which department is this role in?'
    }

    let ar3 = {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this position?'
    }

let addRoleResponseProcessing = (answer) => {    
        connection.query(
            'INSERT INTO role SET ?',
            {
                title: answer.roles,
                department_id: deptArr.indexOf(answer.dept),
                salary: answer.salary
            },
            (err) => {
                if (err) throw err;
                console.log("Role added successfuly!");
                start();
            }
        );
    };
    inquirer.prompt([ar1, ar2, ar3]).then(addRoleResponseProcessing);
  })
}

const viewEmployees = () => {
    console.log("Fetching employees...");

    //this is displaying themselves as their own manager
    let query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.dept_name AS Department, role.salary, CONCAT(employee.first_name, ' ' ,  employee.last_name) AS manager FROM employee LEFT JOIN employee e ON e.id = employee.manager_id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY ID ASC";
    
    connection.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        console.log('--------------------')
        start();
    })   
};

const viewByDept = () => {
    console.log("Fetching departments...");
    let deptChoiceArray = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the department names
        return conn.query('SELECT dept_name FROM department');
    }).then(function(results){
        //Place dept names into an array
            deptChoiceArray = results.map(choice => choice.dept_name);
        }).then(() => {
            inquirer.prompt({
                type: 'list',
                name: 'department',
                choices: deptChoiceArray,
                message: 'Which department do you want to view?'
            }).then((answer) => {
                const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.dept_name AS Department, role.salary AS Salary, concat(e.first_name, ' ' ,  e.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = e.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.dept_name = '${answer.department}' ORDER BY ID ASC`;

                connection.query(query, (err, results) => {
                    if (err) throw err;

                    //display results in a console table
                    console.table(results);

                    //Restart main menu
                    start();
                })
            })
        })
    
   
};

//not complete - needs elements changed 
const viewByManager = () => {
    console.log("Fetching departments...");
    let deptChoiceArray = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the department names
        return conn.query('SELECT d FROM department');
    }).then(function(results){
        //Place dept names into an array
            deptChoiceArray = results.map(choice => choice.dept_name);
        }).then(() => {
            inquirer.prompt({
                type: 'list',
                name: 'department',
                choices: deptChoiceArray,
                message: 'Which department do you want to view?'
            }).then((answer) => {
                const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.dept_name AS Department, role.salary AS Salary, concat(e.first_name, ' ' ,  e.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = e.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.dept_name = '${answer.department}' ORDER BY ID ASC`;

                connection.query(query, (err, results) => {
                    if (err) throw err;

                    //display results in a console table
                    console.table(results);

                    //Restart main menu
                    start();
                })
            })
        })
    
   
};
}
const addDepartments = () => {

    let ad1 = {
        type: 'input',
        name: 'department',
        message: 'What is the new department?'
    }

let addDepartmentResponseProcessing = (answer) => {    
        connection.query(
            'INSERT INTO department SET ?',
            {
                dept_name: answer.department,
            },
            (err) => {
                if (err) throw err;
                console.log("Department added successfuly!");
                start();
            }
        );
    };
    inquirer.prompt([ad1]).then(addDepartmentResponseProcessing);
}

const addRoles = () => {
    const deptArr = [];
    connection.query('SELECT dept_name FROM department', (err,res) => {

    let ar1 = {
        type: 'input',
        name: 'roles',
        message: 'What is the new role?'
    }
    let ar2 = {
        type: 'list',
        name: 'dept',
        choices() {
                if (err) throw err;
                res.forEach(({dept_name}) => {
                    deptArr.push(dept_name);
                })
            return deptArr;
        },
        message: 'Which department is this role in?'
    }

    let ar3 = {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this position?'
    }

let addRoleResponseProcessing = (answer) => {    
        connection.query(
            'INSERT INTO role SET ?',
            {
                title: answer.roles,
                department_id: deptArr.indexOf(answer.dept),
                salary: answer.salary
            },
            (err) => {
                if (err) throw err;
                console.log("Role added successfuly!");
                start();
            }
        );
    };
    inquirer.prompt([ar1, ar2, ar3]).then(addRoleResponseProcessing);
  })
}

const viewEmployees = () => {
    console.log("Fetching employees...");

    //this is displaying themselves as their own manager
    let query =  
    "SELECT employee.id AS ID, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.dept_name AS Department, role.salary AS 'Salary', CONCAT(e.first_name, ' ' ,  e.last_name) AS Manager FROM employee LEFT JOIN employee e ON e.id = employee.manager_id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY ID ASC";
    
    connection.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        console.log('--------------------')
        start();
    })   
};

const viewByDept = () => {
    console.log("Fetching departments...");
    let deptChoiceArray = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the department names
        return conn.query('SELECT dept_name FROM department');
    }).then(function(results){
        //Place dept names into an array
            deptChoiceArray = results.map(choice => choice.dept_name);
        }).then(() => {
            inquirer.prompt({
                type: 'list',
                name: 'department',
                choices: deptChoiceArray,
                message: 'Which department do you want to view?'
            }).then((answer) => {
                const query = `SELECT employee.id AS ID, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS Title, department.dept_name AS Department, role.salary AS Salary, CONCAT(e.first_name, ' ' , e.last_name) AS Manager FROM employee LEFT JOIN employee e ON e.id = employee.manager_id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.dept_name = '${answer.department}' ORDER BY ID ASC`;

                connection.query(query, (err, results) => {
                    if (err) throw err;

                    //display results in a console table
                    console.table(results);

                    //Restart main menu
                    start();
                })
            })
        })
    
   
};

const viewByManager = () => {
    console.log("Fetching employees...");
    //Global variables for choices arrays
    let managerNameArr = [];
    let managerIDArr = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the department names
            return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name, '') AS Employee FROM employee ORDER BY Employee");

    }).then((managers) => {
        //Place manager names into an array
        for (i = 0; i < managers.length; i++){
            managerNameArr.push( managers[i].Employee)
        }
        
        //Place manager ID into an array
        for (i = 0; i < managers.length; i++){
            managerIDArr.push(managers[i].id)
        }

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'manager',
                    choices: managerNameArr,
                    message: 'Which managers employees do you want to view?'    
                }
            ]).then((answer) => {

                let managerNameID = managerNameArr.indexOf(answer.manager);
                let managerID = managerIDArr[managerNameID];

                    const query = `SELECT employee.id AS 'ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.dept_name AS Department, role.salary AS 'Salary', CONCAT(e.first_name, ' ' ,  e.last_name) AS Manager FROM employee LEFT JOIN employee e ON e.id = employee.manager_id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE employee.manager_id = '${managerID}' ORDER BY ID ASC`;


                    connection.query(query, (err, results) => {
                        if (err) throw err;

                        //display results in a console table
                        console.table(results);

                        //Restart main menu
                        start();
                })
            })
        })
    
    
};


const viewDeptSpending = () => {

}

const updateRole = () => {

    console.log("Fetching employees...");
    //Global variables for choices arrays
    let employeeArr = [];
    let roleArr = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the employee names and role options
        return Promise.all([
            conn.query('SELECT id, title FROM role'),
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee")
            ]);

            
    }).then(([roles, employees]) => {
        console.log(employees);
         console.log(roles)
        
        //Place employee names into an array
        for (i = 0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee)
        }
        
        //Place roles into an array
        for (i = 0; i < roles.length; i++){
            roleArr.push(roles[i].title)
        }

        return Promise.all([employees, roles]);
        }).then(([employees, roles]) => {
;

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    choices: employeeArr,
                    message: 'Which employee do you want to change the role of?'    
                },
                {
                    type: 'list',
                    name: 'role',
                    choices: roleArr,
                    message: 'What is their new role?'    
                }
            ]).then((answer) => {
                
                let employeeID;
                let roleID;
                
                
                //Get selected employee ID
                for(i=0; i<employees.length; i++) {
                    if(answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }

                //Get role ID
                for(i=0; i<roles.length; i++) {
                    if(answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                // update the employee with the manager ID
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) throw err;
                    console.log(`\n ${answer.name} ROLE UPDATED TO ${answer.role}...\n`);
                
                
                        // Restart main menu
                        start();
                })
            })
        })  
};


const updateManager = () => {
    console.log("Fetching employees...");
    //Global variables for choices arrays
    let employeeArr = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the department names
            return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee");

    }).then((employees) => {
        //Place role names into an array
        for (i = 0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee)
        }
            // if there is to be no manager:
            employeeArr.unshift('--');

            inquirer.prompt([
                //Ask for employee first name
                {
                    type: 'list',
                    name:'name',
                    message: 'Which employee would you like to edit?',
                    choices: employeeArr
                },

                //Ask for employee manager
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is their new manager?',
                    choices: employeeArr
                }

            ]).then((answer) => {
                console.log(answer.manager);
                console.log(answer.name);
                
                let employeeID;
                let managerID;
                
                //Get selected employee ID
                for(i=0; i<employees.length; i++) {
                    if(answer.name == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }
                //Get manager ID
                for(i=0; i<employees.length; i++) {
                    if(answer.manager == employees[i].Employee){
                        managerID = employees[i].id;
                    }
                }
                //update the employee with the manager ID
                connection.query(`UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) throw err;
                    console.log(`\n ${answer.name} MANAGER UPDATED TO ${answer.manager}...\n`);

                    start();
                })
            })
        })
    }
      

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
                }
            })
            connection.query(
                'DELETE FROM employee WHERE id = ?', chosenEmployee, (err, data) => {
                    if (err) throw err;
                    start();
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