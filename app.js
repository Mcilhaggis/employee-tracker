const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");
const promise = require("promise-mysql");
const ascii = require("asciiart-logo");
const password = require("./password.js")

//Create connection to mySQL database
const connectionInformation = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    //Password stored in seperate js file and added to git ignore
    password: password,
    database: 'employee_DB'
};
 const connection = mysql.createConnection(connectionInformation);

//Intro screen
const intro = () => {
    console.log(
        ascii({
        name: 'Employee Tracker',
        font: 'DOS Rebel',
        lineChars: 10,
        orderColor: 'grey',
        logoColor: 'yellow',
    })
    .right('github.com/McIlhaggis')
    .render()
    );
    start();
}

//Overarching function to start all inquirer promps
const start = () => {
    let firstQuestion = {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                'View all employees', 
                'View employees by department', 
                'View employees by manager',
                'View employees by role',
                'View department spending',
                'Add employee',
                'Add department',
                'Add role',
                'Remove employee',
                'Remove role',
                'Remove department',
                'Update employee role',
                'Update employee manager',
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
            case 'View department spending':
                viewDeptSpending();
                break; 
            case 'View employees by role':
                viewByRole();
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
            case 'Remove role':
                deleteRole();
                break; 
            case 'Remove department':
                deleteDepartment();
                break; 
            case 'Update employee role':
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
    //Variables for choices arrays
    let rolesArr = [];
    let rolesIDArr = [];
    let managersArr = [];
    let managerIDArr = [];


    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the roles available and managers
        return Promise.all([
            conn.query('SELECT id, title FROM role'),
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee")
            ]);

            }).then(([roles, managers]) => {

                //Place roles into an array
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
                        //Place role ID into an array
                        for (i = 0; i < roles.length; i++){
                            rolesIDArr.push(roles[i].id)
                        }
                
                return Promise.all([roles, managers]);
                }).then(([roles, managers]) => {

                    //Option if there are no managers:
                    managersArr.unshift('--');

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


                        //Store index of chosen manager
                        let managerNameIndex = managersArr.indexOf(answer.manager) - 1;
                        //Get the chosen managers id
                        let managerIDIndex = managerIDArr[managerNameIndex];
                        //Store index of role
                        let rolesTitleIndex = rolesArr.indexOf(answer.role);
                        //Store ID of role
                        let roleID = rolesIDArr[rolesTitleIndex]


                        connection.query(
                            //Insert into table
                            'INSERT INTO employee SET ?',
                            {
                                first_name: answer.firstName,
                                last_name: answer.lastName,
                                role_id: roleID,
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
}
const addDepartments = () => {

    //Storing question in a variable to cal later
    let ad1 = {
        type: 'input',
        name: 'department',
        message: 'What is the new department?'
    }

let addDepartmentResponseProcessing = (answer) => {  

        //Insert new department into table  
        connection.query(
            'INSERT INTO department SET ?',
            {
                dept_name: answer.department,
            },
            (err) => {
                if (err) throw err;
                console.log(`${answer.department} added successfuly!`);
                start();
            }
        );
    };
    //Call on question and answer processing
    inquirer.prompt([ad1]).then(addDepartmentResponseProcessing);
}
const addRoles = () => {
    //Array to store departments for options that the role can be assigned to
    const deptArr = [];
    const deptIDArr = [];

    //Get the list of departments that currently exist
    connection.query('SELECT id, dept_name FROM department', (err,res) => {

        res.forEach(({id}) => {
            deptIDArr.push(id);
        })

    let ar1 = {
        type: 'input',
        name: 'roles',
        message: 'What is the new role?'
    }
    let ar2 = {
        type: 'list',
        name: 'dept',
        choices() {
            //Store current departments in the array and siaply to user 
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
    //Store the index of the chosen dept
        let chosenDeptIndex = deptArr.indexOf(answer.dept);
        let deptID = deptIDArr[chosenDeptIndex];
    
        //Insert role into role table
        connection.query(
            'INSERT INTO role SET ?',
            {
                title: answer.roles,
                department_id: deptID,
                salary: answer.salary
            },
            (err) => {
                if (err) throw err;
                start();
            }
        );
    };
    //Initiate questions and answer processing
    inquirer.prompt([ar1, ar2, ar3]).then(addRoleResponseProcessing);
  })
}
const viewEmployees = () => {
    //Fetch employees from employee table
    let query =  
    "SELECT employee.id AS ID, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.dept_name AS Department, role.salary AS 'Salary', CONCAT(e.first_name, ' ' ,  e.last_name) AS Manager FROM employee LEFT JOIN employee e ON e.id = employee.manager_id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY ID ASC";
    
    //Table log results
    connection.query(query, (err, results) => {
        if (err) throw err;
        console.log(`\n You are now viewing all employees...\n`);
        console.log('--------------------')
        console.table(results);
        console.log('--------------------')
        start();
    })   
};
const viewByDept = () => {
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
                    console.log(`\n You are now viewing all employees in ${answer.department}...\n`);

                    console.table(results);

                    //Restart main menu
                    start();
                })
            })
        })
};
const viewByRole = () => {
    let roleChoiceArray = [];
        
        //Query the roles
        connection.query('SELECT title FROM role', (err, res) => {
            if (err) throw err;

        //Map roles names into an array
        roleChoiceArray = res.map(choice => choice.title);            

            inquirer.prompt({
                type: 'list',
                name: 'role',
                choices: roleChoiceArray,
                message: 'Which role do you want to view?'
            })
            .then((answer) => {
                const query = `SELECT employee.id AS ID, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS Title, department.dept_name AS Department, role.salary AS Salary FROM role LEFT JOIN department ON role.department_id = department.id INNER JOIN employee ON role_id = role.id WHERE role.title = '${answer.role}' ORDER BY ID ASC`;
    
                connection.query(query, (err, results) => {
                    if (err) throw err;
    
                    //Display results in a console table
                    console.log(`\n You are now viewing all employees with the role ${answer.role}...\n`);
                    console.table(results);
    
                    //Restart main menu
                    start();
                })
            })
        })
    };
const viewByManager = () => {
    //Variables for choices arrays
    let managerNameArr = [];
    let managerIDArr = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the manager names
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
                        console.log(`\n VIEWING ${answer.manager}'S EMPLOYEES...\n`);

                        console.table(results);

                        //Restart main menu
                        start();
                })
            })
        })
    
    
};
const viewDeptSpending = () => {

    //Crate connection with promise-sql
    promise.createConnection(connectionInformation).then((conn) => {

        return Promise.all([
            //Query current salaries paid and departments 
            conn.query("SELECT department.dept_name AS department, role.salary FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department ASC"),
            conn.query('SELECT dept_name FROM department ORDER BY dept_name ASC')
        ]);

    }).then(([salaries, departments]) => {

        let deptArr = [];
        let dept;

        //Loop all departments
        for(i = 0; i < departments.length; i++) {
            let spending = 0;

            //Add salaries together
            for(j = 0; j < salaries.length; j++){
                if(departments[i].dept_name == salaries[j].department){
                    spending += salaries[j].salary;
                }
            }
            //Store department details in object
            dept = {
                Department: departments[i].dept_name,
                Budget: spending
            }

            deptArr.push(dept);
        }
        //Display info in a table
        console.log(`\n VIEWING ALL DEPARTMENTS SPENDING...\n`);

        console.table(deptArr)

        start();
    })
}
const updateRole = () => {

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
                    console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n`);
                
                
                        // Restart main menu
                        start();
                })
            })
        })  
};
const updateManager = () => {
    //Global variables for choices arrays
    let employeeArr = [];

    //Create connection with promise
    promise.createConnection(connectionInformation).then((conn) => {

        //Query the employee names
            return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee");

    }).then((employees) => {
        //Place role names into an array
        for (i = 0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee)
        }
            //Option if there is to be no manager:
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
                }
            })
            connection.query(
                'DELETE FROM employee WHERE id = ?', chosenEmployee, (err, data) => {
                    if (err) throw err;
                    console.log(`\n ${answer.employee} REMOVED...\n`);

                    start();
                    }
            )
        })
    });
}
const deleteRole = () => {
    console.log("Removing role..");
    connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'role',
                choices() {
                    const roleArr = [];
                    results.forEach(({title}) => {
                        roleArr.push(title);
                    })

                    return roleArr;
                },
                message: 'Which role would you like to remove?',
            },
        ])
        .then((answer) => {
            //store the chosen role
            let chosenRole;
            //if role exists in DB, store
            results.forEach((position) => {
                if(position.title === answer.role) {
                    chosenRole = answer.role;
                }
            })

            console.log(chosenRole)
            connection.query(
                //Remove the role from the DB
                'DELETE FROM role WHERE title = ?', chosenRole, (err, data) => {
                    if (err) throw err;
                    start();
                    console.log(`\n ${answer.role} REMOVED...\n`);
                    start();
                    }
            )
        })
    });
}
const deleteDepartment = () => {
    connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'department',
                choices() {
                    const deptArr = [];
                    results.forEach(({dept_name}) => {
                        deptArr.push(dept_name);
                    })

                    return deptArr;
                },
                message: 'Which department would you like to remove?',
            },
        ])
        .then((answer) => {
            //store the dept role
            let chosenDept;
            //if dept exists in DB, store
            results.forEach((dept) => {
                if(dept.dept_name === answer.department) {
                    chosenDept = dept.dept_name;
                }
            })
            connection.query(
                'DELETE FROM department WHERE dept_name = ?', chosenDept, (err, data) => {
                    if (err) throw err;
                    start();
                    console.log(`\n ${answer.department} REMOVED...\n`);

                    }
            )
        })
    });
}

// Instantiate the connection
let connectionCallBack = (err) => {
    if (err) throw err;
    intro();
};
connection.connect(connectionCallBack);